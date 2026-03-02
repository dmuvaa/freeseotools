import asyncio
import uuid
import json
from datetime import datetime
from supabase import create_client
from logger import log_info, log_error
from models import JobPayload
from main import settings, get_supabase, get_redis, STANDARD_MODELS, process_job

async def scheduler_loop():
    """
    Background task that runs periodically to:
    1. Find monitored_keywords where next_run_at <= NOW() and is_active = TRUE
    2. Check if organization has enough credits.
    3. Deduct credits and Trigger Audit Job
    4. Update next_run_at based on frequency
    """
    log_info("scheduler", "Scheduler started. Running every 60 minutes.")
    
    while True:
        try:
            log_info("scheduler", "Checking for due keywords...")
            db = get_supabase()
            
            # 1. Fetch due keywords
            # Note: Supabase-py doesn't support complex joins well in one go for updating, 
            # so we fetch and then iterate.
            response = db.table("monitored_keywords")\
                .select("*, projects(org_id, brand_aliases, primary_domain)")\
                .eq("is_active", True)\
                .lte("next_run_at", datetime.utcnow().isoformat())\
                .execute()
                
            keywords = response.data or []
            
            if not keywords:
                log_info("scheduler", "No keywords due for tracking.")
            else:
                log_info("scheduler", f"Found {len(keywords)} keywords due for tracking.")
                
                redis_conn = await get_redis()
                
                for record in keywords:
                    keyword_id = record['id']
                    project = record.get('projects')
                    
                    if not project:
                        log_error("scheduler", f"Keyword {keyword_id} has no project. Skipping.")
                        continue
                        
                    org_id = project['org_id']
                    
                    # 2. Check Credits
                    org_res = db.table("organizations").select("credits_balance").eq("id", org_id).single().execute()
                    
                    if not org_res.data:
                         log_error("scheduler", f"Org {org_id} not found. Skipping.")
                         continue
                         
                    credits = org_res.data.get('credits_balance', 0)
                    COST_PER_RUN = 5
                    
                    if credits < COST_PER_RUN:
                        log_error("scheduler", f"Org {org_id} insufficient credits ({credits}). Skipping keyword {keyword_id}.")
                        # Optional: Mark keyword as paused or notify user? 
                        # For now, just skip until they top up.
                        continue
                    
                    # 3. Deduct Credits
                    new_balance = credits - COST_PER_RUN
                    db.table("organizations").update({"credits_balance": new_balance}).eq("id", org_id).execute()
                    
                    # 4. Trigger Job
                    # Using valid models from STANDARD_MODELS
                    job_id = str(uuid.uuid4())
                    
                    db.table("audit_jobs").insert({
                        "id": job_id,
                        "project_id": record['project_id'],
                        "query_phrase": record['query_phrase'],
                        "status": "QUEUED",
                        "models_selected": STANDARD_MODELS,
                        "job_type": "STANDARD" 
                    }).execute()
                    
                    job_payload = JobPayload(
                        job_id=job_id,
                        project_id=record['project_id'],
                        query_phrase=record['query_phrase'],
                        brand_aliases=project.get('brand_aliases', []),
                        primary_domain=project.get('primary_domain', ""),
                        models=STANDARD_MODELS,
                        job_type="STANDARD"
                    )
                    
                    if settings.use_redis and redis_conn:
                        await redis_conn.lpush(settings.queue_name, json.dumps(job_payload.dict()))
                    else:
                        asyncio.create_task(process_job(job_payload))
                    
                    log_info("scheduler", f"Triggered job {job_id} for keyword {keyword_id}. Credits deducted.")
                    
                    # 5. Update next_run_at
                    # simplified: add 1 day or 7 days
                    from datetime import timedelta
                    now = datetime.utcnow()
                    if record['frequency'] == 'daily':
                        next_run = now + timedelta(days=1)
                    else:
                        next_run = now + timedelta(days=7)
                        
                    db.table("monitored_keywords").update({
                        "last_run_at": now.isoformat(),
                        "next_run_at": next_run.isoformat()
                    }).eq("id", keyword_id).execute()

        except Exception as e:
            log_error("scheduler", f"Scheduler loop error: {e}")
        
        # Sleep for 60 minutes (3600 seconds)
        # Check hourly
        await asyncio.sleep(3600)
