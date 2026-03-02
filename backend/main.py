"""
BlitzGeo FastAPI Backend
API endpoints + Background worker for processing audit jobs
"""
import asyncio
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, AsyncGenerator

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from supabase import create_client, Client

from models import JobPayload, HealthResponse, GenerateTipsRequest, GenerateTipsResponse
from openrouter import openrouter_client, SUPPORTED_MODELS
from analyzer import brand_analyzer, calculate_blitz_score
from logger import log_info, log_error, log_warn, log_debug, log_buffer
from chat import index_chat_handler, IndexChatRequest, IndexChatResponse, ChatSessionResponse


# ============================================
# Configuration
# ============================================

class Settings(BaseSettings):
    """Application settings from environment"""
    redis_url: str = Field("redis://localhost:6379", validation_alias="REDIS_URL")
    use_redis: bool = Field(False, validation_alias="USE_REDIS")
    supabase_url: str = Field("", validation_alias="SUPABASE_URL")
    supabase_service_role_key: str = Field("", validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    queue_name: str = "queue:blitz_jobs"
    worker_id: str = f"worker-{uuid.uuid4().hex[:8]}"
    
    # Auth secrets for protected endpoints
    api_key: str = Field("", validation_alias="OPENROUTER_API_KEY") # Reusing for simplicity or strictly separate?
    # Actually, api_key was for debug endpoints. Let's keep it separate or optional.
    # The user has OPENROUTER_API_KEY in .env, but maybe not API_KEY.
    
    admin_secret: str = ""  # For admin endpoints
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Global connections
redis_client: Optional[redis.Redis] = None
supabase_client: Optional[Client] = None
worker_task: Optional[asyncio.Task] = None
scheduler_task: Optional[asyncio.Task] = None


# ============================================
# Request/Response Models
# ============================================

# Standard models for all scheduled/triggered jobs
STANDARD_MODELS = [
    "openai/gpt-5",
    "google/gemini-2.5-pro",
    "anthropic/claude-opus-4.5",
    "perplexity/sonar-reasoning",
    "deepseek/deepseek-v3.2"
]


class SimulateAuditRequest(BaseModel):
    query: str
    model: str = "perplexity/sonar-reasoning"


class SimulateAuditResponse(BaseModel):
    raw_ai_text: Optional[str]
    tokens_used: Optional[int]
    execution_time_ms: int


class TestParserRequest(BaseModel):
    brand_aliases: list[str]
    test_text: str


class TestParserResponse(BaseModel):
    is_mentioned: bool
    matched_alias: Optional[str]
    sentiment_score: float


class TriggerJobRequest(BaseModel):
    job_id: str
    force_restart: bool = False


class TriggerJobResponse(BaseModel):
    status: str
    message: str


class RunNowRequest(BaseModel):
    keyword_ids: list[str]


# ============================================
# Auth Dependencies
# ============================================

async def verify_api_key(x_api_key: str = Header(None, alias="X-API-Key")):
    """Verify API key for debug endpoints"""
    if not settings.api_key:
        # If no API key configured, allow access (dev mode)
        return True
    if x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


async def verify_admin_secret(x_admin_secret: str = Header(None, alias="X-Admin-Secret")):
    """Verify admin secret for admin endpoints"""
    if not settings.admin_secret:
        # If no admin secret configured, allow access (dev mode)
        return True
    if x_admin_secret != settings.admin_secret:
        raise HTTPException(status_code=401, detail="Invalid admin secret")
    return True


# ============================================
# Database Connections
# ============================================

async def get_redis() -> Optional[redis.Redis]:
    """Get Redis connection"""
    global redis_client
    if not settings.use_redis:
        return None
        
    if redis_client is None:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    return redis_client


def get_supabase() -> Client:
    """Get Supabase client"""
    global supabase_client
    if supabase_client is None:
        supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    return supabase_client


# ============================================
# Job Processing Logic
# ============================================

async def process_job(job_payload: JobPayload):
    """
    Process a single audit job:
    1. Update status to PROCESSING
    2. Query all models concurrently
    3. Analyze each response
    4. Store results in audit_runs
    5. Calculate and store Blitz Score
    6. Update status to COMPLETED
    """
    db = get_supabase()
    job_id = job_payload.job_id
    
    log_info("worker", f"Processing job: {job_id}", {
        "job_id": job_id,
        "query": job_payload.query_phrase[:50],
        "models": job_payload.models
    })
    
    # --- Ghostbuster Check ---
    # Verify job still exists and is valid before burning compute
    job_check = db.table("audit_jobs").select("status").eq("id", job_id).single().execute()
    
    if not job_check.data:
        log_info("worker", f"Job dropped (Record deleted): {job_id}")
        return

    current_status = job_check.data.get("status")
    if current_status in ["FAILED", "CANCELLED"]:
        log_info("worker", f"Job dropped (Status {current_status}): {job_id}")
        return
    # -------------------------
    
    try:
        # Update job status to PROCESSING
        db.table("audit_jobs").update({
            "status": "PROCESSING"
        }).eq("id", job_id).execute()
        
        log_info("worker", f"Job status → PROCESSING", {"job_id": job_id})
        
        # Query all models concurrently
        log_info("worker", f"Querying {len(job_payload.models)} models", {
            "job_id": job_id,
            "model_count": len(job_payload.models)
        })
        responses = await openrouter_client.query_multiple_models(
            job_payload.models,
            job_payload.query_phrase
        )
        
        # Analyze each response and store results
        mention_results: list[bool] = []
        
        for model, response_data in responses.items():
            start_time = time.time()
            
            response_text = response_data.get("content")
            
            if response_text:
                # Analyze the response
                analysis = brand_analyzer.analyze(
                    response_text,
                    job_payload.brand_aliases,
                    job_payload.primary_domain,
                    raw_response=response_data.get("raw_response")
                )
                execution_time = int((time.time() - start_time) * 1000)
                
                # Store the run
                run_data = {
                    "job_id": job_id,
                    "ai_model": model,
                    "response_raw": response_text,
                    "is_mentioned": analysis.is_mentioned,
                    "sentiment_score": analysis.sentiment_score,
                    "citations_found": [c.dict() for c in analysis.citations_found], # Serialize Pydantic objects
                    "execution_time_ms": execution_time
                }
                
                mention_results.append(analysis.is_mentioned)
                
                log_info("analyzer", f"Analyzed response from {model}", {
                    "job_id": job_id,
                    "model": model,
                    "is_mentioned": analysis.is_mentioned,
                    "citations_count": len(analysis.citations_found)
                })
            else:
                # Failed response
                run_data = {
                    "job_id": job_id,
                    "ai_model": model,
                    "response_raw": None,
                    "is_mentioned": False,
                    "sentiment_score": None,
                    "citations_found": [],
                    "execution_time_ms": None
                }
                mention_results.append(False)
                
                log_warn("worker", f"No response from {model}", {
                    "job_id": job_id,
                    "model": model
                })
            
            # Insert run into database
            db.table("audit_runs").insert(run_data).execute()
            log_debug("supabase", f"Stored run for {model}", {
                "job_id": job_id,
                "model": model,
                "is_mentioned": run_data["is_mentioned"]
            })
        
        # Calculate Blitz Score
        blitz_score = calculate_blitz_score(mention_results)
        
        # Update job with score and completion status
        db.table("audit_jobs").update({
            "status": "COMPLETED",
            "blitz_score": blitz_score,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", job_id).execute()
        
        log_info("worker", f"Job completed with Blitz Score: {blitz_score}", {
            "job_id": job_id,
            "blitz_score": blitz_score,
            "mentions": sum(mention_results),
            "total_models": len(mention_results)
        })
        
    except Exception as e:
        log_error("worker", f"Error processing job {job_id}: {e}", {
            "job_id": job_id,
            "error": str(e)
        })
        # Mark job as failed
        try:
            db.table("audit_jobs").update({
                "status": "FAILED"
            }).eq("id", job_id).execute()
        except:
            pass


async def worker_loop():
    """
    Main worker loop - continuously processes jobs from Redis queue.
    Uses BRPOP for blocking pop (waits for new jobs).
    """
    if not settings.use_redis:
        log_info("worker", "Redis is disabled (USE_REDIS=false). Worker loop will not start.", {"worker_id": settings.worker_id})
        return

    r = await get_redis()
    if r is None:
        return
        
    log_info("worker", f"Starting worker loop", {
        "worker_id": settings.worker_id,
        "queue": settings.queue_name
    })
    
    while True:
        try:
            # BRPOP with 5 second timeout (returns None if no job)
            result = await r.brpop(settings.queue_name, timeout=5)
            
            if result:
                _, job_json = result
                log_debug("redis", f"Job received from queue", {
                    "queue": settings.queue_name,
                    "payload_length": len(job_json)
                })
                
                try:
                    job_data = json.loads(job_json)
                    # Handle job_type default if missing (backward compatibility)
                    if "job_type" not in job_data:
                        job_data["job_type"] = "STANDARD"
                        
                    job_payload = JobPayload(**job_data)
                    
                    if job_payload.job_type == "KNOWLEDGE_GRAPH":
                        from knowledge_graph import knowledge_graph_worker
                        await knowledge_graph_worker.execute_graph_job(job_payload, get_supabase())
                        
                        # Mark job as COMPLETED
                        db = get_supabase()
                        db.table("audit_jobs").update({
                            "status": "COMPLETED",
                            "completed_at": datetime.utcnow().isoformat()
                        }).eq("id", job_payload.job_id).execute()
                        
                        log_info("worker", f"KG Job completed", {"job_id": job_payload.job_id})
                    
                    elif job_payload.job_type == "INDEX_GRAPH":
                        from index_graph import index_graph_worker
                        
                        # Mark as PROCESSING
                        db = get_supabase()
                        db.table("audit_jobs").update({
                            "status": "PROCESSING"
                        }).eq("id", job_payload.job_id).execute()
                        
                        await index_graph_worker.execute(job_payload, get_supabase())
                        
                        # Mark job as COMPLETED
                        db.table("audit_jobs").update({
                            "status": "COMPLETED",
                            "completed_at": datetime.utcnow().isoformat()
                        }).eq("id", job_payload.job_id).execute()
                        
                        log_info("worker", f"Index Graph Job completed", {"job_id": job_payload.job_id})
                    
                    else:
                        await process_job(job_payload)
                except json.JSONDecodeError as e:
                    log_error("worker", f"Invalid JSON in queue", {"error": str(e)})
                except Exception as e:
                    log_error("worker", f"Error processing job", {"error": str(e)})
                    
        except asyncio.CancelledError:
            log_info("worker", "Worker loop cancelled")
            break
        except Exception as e:
            log_error("redis", f"Queue error: {e}", {"error": str(e)})
            await asyncio.sleep(1)  # Brief pause before retry


# ============================================
# Application Lifespan
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - start/stop worker"""
    global worker_task
    
    # Start worker on startup
    log_info("api", f"Starting BlitzGeo backend", {"worker_id": settings.worker_id})
    worker_task = asyncio.create_task(worker_loop())
    
    # Start scheduler
    from scheduler import scheduler_loop
    scheduler_task = asyncio.create_task(scheduler_loop())
    
    yield
    
    # Stop worker on shutdown
    if worker_task:
        worker_task.cancel()
        try:
            await worker_task
        except asyncio.CancelledError:
            pass

    # Stop scheduler
    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass
    
    # Close Redis connection
    if redis_client:
        await redis_client.close()
    
    log_info("api", f"Shutdown complete", {"worker_id": settings.worker_id})


# ============================================
# FastAPI App
# ============================================

app = FastAPI(
    title="BlitzGeo Backend",
    description="API endpoints + Background worker for audit job processing",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# 1. System Endpoints (Ops)
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Tells the cloud platform "I am alive and connected to Redis."
    """
    redis_ok = False
    
    if not settings.use_redis:
        return HealthResponse(
            status="healthy",
            worker_id=settings.worker_id,
            redis_connected=False
        )
        
    try:
        r = await get_redis()
        if r:
            await r.ping()
            redis_ok = True
    except:
        pass
    
    return HealthResponse(
        status="healthy" if redis_ok else "degraded",
        worker_id=settings.worker_id,
        redis_connected=redis_ok
    )


# ============================================
# 2. Debugging Endpoints (Developer Tools)
# ============================================

@app.post("/debug/simulate-audit", response_model=SimulateAuditResponse)
async def simulate_audit(
    request: SimulateAuditRequest,
    _: bool = Depends(verify_api_key)
):
    """
    Test the AI connection and prompt structure immediately.
    Returns raw AI response without storing to database.
    """
    if request.model not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported model. Options: {list(SUPPORTED_MODELS.keys())}"
        )
    
    start_time = time.time()
    
    model, response_text = await openrouter_client.query_model(
        request.model,
        request.query
    )
    
    execution_time = int((time.time() - start_time) * 1000)
    
    if response_text is None:
        raise HTTPException(status_code=502, detail="AI model returned no response")
    
    # Estimate tokens (rough approximation: ~4 chars per token)
    tokens_estimate = len(response_text) // 4 if response_text else 0
    
    return SimulateAuditResponse(
        raw_ai_text=response_text,
        tokens_used=tokens_estimate,
        execution_time_ms=execution_time
    )


@app.post("/debug/test-parser", response_model=TestParserResponse)
async def test_parser(
    request: TestParserRequest,
    _: bool = Depends(verify_api_key)
):
    """
    Test if the Regex logic correctly detects the brand in a block of text.
    """
    # Run analysis
    analysis = brand_analyzer.analyze(
        request.test_text,
        request.brand_aliases,
        None  # No domain filtering for test
    )
    
    # Find which alias matched (if any)
    matched_alias = None
    if analysis.is_mentioned:
        normalized_text = brand_analyzer.normalize_text(request.test_text)
        for alias in request.brand_aliases:
            import re
            alias_lower = alias.lower()
            escaped_alias = re.escape(alias_lower)
            pattern = rf'\b{escaped_alias}\b'
            if re.search(pattern, normalized_text):
                matched_alias = alias
                break
    
    return TestParserResponse(
        is_mentioned=analysis.is_mentioned,
        matched_alias=matched_alias,
        sentiment_score=analysis.sentiment_score
    )


# ============================================
# 3. Admin Endpoints (Control)
# ============================================

@app.post("/admin/trigger-job", response_model=TriggerJobResponse)
async def trigger_job(
    request: TriggerJobRequest,
    _: bool = Depends(verify_admin_secret)
):
    """
    Manually push a specific Job ID into the processing pipeline.
    Useful if a job gets stuck in "QUEUED" state.
    """
    db = get_supabase()
    
    # Verify job exists
    result = db.table("audit_jobs").select("*").eq("id", request.job_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = result.data
    
    # If force_restart, reset status and clear old runs
    if request.force_restart:
        # Delete old runs
        db.table("audit_runs").delete().eq("job_id", request.job_id).execute()
        
        # Reset job status
        db.table("audit_jobs").update({
            "status": "QUEUED",
            "blitz_score": None,
            "completed_at": None
        }).eq("id", request.job_id).execute()
    
    # Get project for brand aliases
    project_result = db.table("projects").select("*").eq("id", job["project_id"]).single().execute()
    
    if not project_result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = project_result.data
    
    # Create job payload and process in background
    job_payload = JobPayload(
        job_id=request.job_id,
        project_id=job["project_id"],
        query_phrase=job["query_phrase"],
        brand_aliases=project.get("brand_aliases", []),
        primary_domain=project.get("primary_domain", ""),
        models=job["models_selected"],
        job_type=job.get("job_type", "STANDARD")
    )
    
    # Start processing in background task (bypassing Redis)
    asyncio.create_task(process_job(job_payload))
    
    log_info("api", f"Job triggered manually", {"job_id": request.job_id})
    
    return TriggerJobResponse(
        status="triggered",
        message=f"Job {request.job_id} started in background task"
    )


@app.delete("/api/project/{project_id}")
async def delete_project(project_id: str):
    """
    Delete a project and all associated data.
    Uses the service role key to bypass RLS.
    """
    db = get_supabase()
    
    try:
        # 1. Verify project exists
        result = db.table("projects").select("id, name").eq("id", project_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project_name = result.data.get("name", project_id)
        
        # 2. Delete (CASCADE should handle audit_jobs and monitored_keywords)
        db.table("projects").delete().eq("id", project_id).execute()
        log_info("api", f"Project deleted: {project_name}", {"project_id": project_id})
        return {"status": "deleted", "project_id": project_id, "message": f"Project '{project_name}' and all related data deleted."}
    
    except HTTPException:
        raise
    except Exception as e:
        log_error("api", f"Delete project error: {e}", {"project_id": project_id})
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs/enqueue")
async def enqueue_job(payload: JobPayload):
    """
    HTTP endpoint to enqueue a job from the frontend instead of directly pushing to Redis.
    Processes the job synchronously in the background if Redis is disabled.
    """
    if settings.use_redis:
        r = await get_redis()
        if r:
            await r.lpush(settings.queue_name, json.dumps(payload.dict()))
            log_info("api", f"Job {payload.job_id} pushed to Redis queue from HTTP endpoint")
            return {"status": "enqueued", "job_id": payload.job_id, "queue": "redis"}
            
    # Fallback/Direct processing
    asyncio.create_task(process_job(payload))
    log_info("api", f"Job {payload.job_id} started in background task from HTTP endpoint")
    return {"status": "started", "job_id": payload.job_id, "queue": "background"}


@app.post("/api/strategy/generate-tips", response_model=GenerateTipsResponse)
async def generate_tips(
    request: GenerateTipsRequest
):
    """
    Generate dynamic ranking tips directly from the target AI model.
    Caches the response in the database to save credits.
    """
    db = get_supabase()
    
    # 1. Check if we already have it cached
    cache_result = db.table("ai_ranking_tips").select("*").eq("project_id", request.project_id).eq("query_phrase", request.query_phrase).eq("target_model", request.target_model).execute()
    
    if cache_result.data and len(cache_result.data) > 0:
        cached = cache_result.data[0]
        log_info("api", f"Returning cached tips for {request.target_model}")
        return GenerateTipsResponse(
            tips=cached.get("tips", []),
            additional_tips=cached.get("additional_tips", "")
        )
        
    # 2. Not cached. Generate via OpenRouter.
    log_info("api", f"Generating dynamic tips for {request.target_model}")
    
    import re
    
    prompt = f"""How do I make {request.brand_name} appear when users search '{request.query_phrase}' in your AI system? 

Respond STRICTLY in the following JSON format. Do not use markdown blocks. Do not include any conversational text.
{{
  "tips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "additional_tip": "A single sentence pro-tip here"
}}"""
    
    # If the exact model isn't currently active, fallback to GPT-4o-mini for speed/cost.
    target = request.target_model if request.target_model in SUPPORTED_MODELS else "openai/gpt-4o-mini"
    
    _, response_text = await openrouter_client.query_model(target, prompt)
    
    if not response_text:
        raise HTTPException(status_code=502, detail="Failed to generate AI tips")
        
    main_tips = []
    additional_tips = ""
    
    try:
        # Extract json if wrapped in markdown
        json_str = response_text
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            
        data = json.loads(json_str)
        main_tips = data.get("tips", [])[:3]
        additional_tips = data.get("additional_tip", "") or data.get("additional_tips", "")
    except Exception as e:
        log_error("api", f"Failed to parse AI JSON: {e}, Raw: {response_text}")
        
    if not main_tips:
        main_tips = ["Optimize your landing pages with clear, descriptive headers.", "Publish high-quality content matching the user intent.", "Ensure your site loads fast and is mobile-friendly."]
        
    # 4. Save to cache
    try:
        db.table("ai_ranking_tips").insert({
            "project_id": request.project_id,
            "query_phrase": request.query_phrase,
            "target_model": request.target_model,
            "tips": main_tips,
            "additional_tips": additional_tips
        }).execute()
    except Exception as e:
        log_error("api", f"Failed to cache tips: {e}")
        # Not fatal, continue returning response
        
    return GenerateTipsResponse(
        tips=main_tips,
        additional_tips=additional_tips
    )
    


@app.post("/api/tracking/run-now")
async def run_tracking_now(
    request: RunNowRequest
):
    """
    Manually trigger specific monitored keywords to run immediately.
    Consumes credits.
    """
    db = get_supabase()
    redis_conn = await get_redis()
    
    triggers_count = 0
    errors = []
    
    if not request.keyword_ids:
        return {"status": "ok", "triggered": 0}
        
    try:
        response = db.table("monitored_keywords")\
            .select("*, projects(org_id, brand_aliases, primary_domain)")\
            .in_("id", request.keyword_ids)\
            .execute()
        
        keywords = response.data or []
        
        for record in keywords:
            keyword_id = record['id']
            project = record.get('projects')
            
            if not project:
                continue
                
            org_id = project['org_id']
            
            # Check credits
            org_res = db.table("organizations").select("credits_balance").eq("id", org_id).single().execute()
            
            if not org_res.data:
                 continue
                 
            credits = org_res.data.get('credits_balance', 0)
            COST_PER_RUN = 5
            
            if credits < COST_PER_RUN:
                errors.append(f"Insufficient credits for keyword {keyword_id}")
                continue
                
            # Deduct credits
            db.table("organizations").update({"credits_balance": credits - COST_PER_RUN}).eq("id", org_id).execute()
            
            # Create Job
            job_id = str(uuid.uuid4())
            
            db.table("audit_jobs").insert({
                "id": job_id,
                "project_id": record['project_id'],
                "query_phrase": record['query_phrase'],
                "status": "QUEUED",
                "models_selected": STANDARD_MODELS,
                "job_type": "STANDARD" 
            }).execute()
            
            # Push to Redis
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
                # If no Redis, process sync/background using asyncio task directly instead of queueing
                asyncio.create_task(process_job(job_payload))
            
            # Update last_run_at
            db.table("monitored_keywords").update({
                "last_run_at": datetime.utcnow().isoformat()
            }).eq("id", keyword_id).execute()
            
            triggers_count += 1
            
    except Exception as e:
        log_error("api", f"Run now error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "status": "ok", 
        "triggered": triggers_count, 
        "errors": errors
    }


# ============================================
# 4. Monitoring Endpoints (Dashboard)
# ============================================

class SystemStatusResponse(BaseModel):
    """System status for dashboard monitoring"""
    queue_depth: int
    worker_id: str
    worker_active: bool
    redis_connected: bool
    recent_jobs: dict = Field(default_factory=dict)
    uptime_seconds: int = 0


# Track server start time
_server_start_time: Optional[datetime] = None


@app.get("/api/status", response_model=SystemStatusResponse)
async def get_system_status():
    """
    Get current system status for dashboard monitoring.
    Returns queue depth, worker status, and recent job statistics.
    """
    global _server_start_time
    if _server_start_time is None:
        _server_start_time = datetime.utcnow()
    
    # Check Redis connection and queue depth
    redis_ok = False
    queue_depth = 0
    
    if settings.use_redis:
        try:
            r = await get_redis()
            if r:
                await r.ping()
                redis_ok = True
                queue_depth = await r.llen(settings.queue_name)
        except Exception as e:
            log_warn("api", f"Redis check failed: {e}")
    
    # Get recent job stats from Supabase
    recent_jobs = {"completed": 0, "failed": 0, "queued": 0, "processing": 0}
    try:
        db = get_supabase()
        
        # Count jobs by status (last 24 hours)
        from datetime import timedelta
        cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        
        result = db.table("audit_jobs").select("status").gte("created_at", cutoff).execute()
        
        if result.data:
            for job in result.data:
                status = job.get("status", "").lower()
                if status in recent_jobs:
                    recent_jobs[status] += 1
    except Exception as e:
        log_warn("api", f"Job stats query failed: {e}")
    
    # Calculate uptime
    uptime = int((datetime.utcnow() - _server_start_time).total_seconds())
    
    return SystemStatusResponse(
        queue_depth=queue_depth,
        worker_id=settings.worker_id,
        worker_active=worker_task is not None and not worker_task.done(),
        redis_connected=redis_ok,
        recent_jobs=recent_jobs,
        uptime_seconds=uptime
    )


@app.get("/api/logs")
async def stream_logs():
    """
    Stream logs in real-time using Server-Sent Events (SSE).
    Connect with EventSource in browser to receive live updates.
    """
    async def event_generator() -> AsyncGenerator[str, None]:
        # Send recent logs first
        recent = log_buffer.get_recent(50)
        for entry in recent:
            yield f"data: {entry.to_sse()}\n\n"
        
        # Subscribe to new logs
        queue = await log_buffer.subscribe()
        try:
            while True:
                try:
                    entry = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {entry.to_sse()}\n\n"
                except asyncio.TimeoutError:
                    # Send keepalive
                    yield f": keepalive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            await log_buffer.unsubscribe(queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/logs/recent")
async def get_recent_logs(count: int = 50, level: Optional[str] = None, component: Optional[str] = None):
    """
    Get recent log entries (non-streaming).
    Useful for initial dashboard load.
    """
    if level:
        entries = log_buffer.get_by_level(level.upper(), count)
    elif component:
        entries = log_buffer.get_by_component(component, count)
    else:
        entries = log_buffer.get_recent(count)
    
    return {
        "count": len(entries),
        "logs": [
            {
                "timestamp": e.timestamp.isoformat(),
                "level": e.level,
                "component": e.component,
                "message": e.message,
                "metadata": e.metadata
            }
            for e in entries
        ]
    }


# ============================================
# 5. Chat Endpoints (AI Assistant)
# ============================================

@app.get("/api/chat/sessions/{audit_id}")
async def get_chat_session(audit_id: str):
    """
    Get existing chat session and messages for an audit.
    Returns session info + message history if a valid session exists (< 72h old).
    Returns empty response if no session exists.
    """
    db = get_supabase()
    
    try:
        session = index_chat_handler.get_session(db, audit_id)
        
        if session:
            return {
                "exists": True,
                "session_id": session.session_id,
                "messages": [{"role": m.role, "content": m.content} for m in session.messages],
                "expires_at": session.expires_at,
                "created_at": session.created_at
            }
        else:
            return {
                "exists": False,
                "session_id": None,
                "messages": [],
                "expires_at": None,
                "created_at": None
            }
    except Exception as e:
        log_error("chat", f"Get session error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load session")


@app.post("/api/chat/index", response_model=IndexChatResponse)
async def chat_with_index(request: IndexChatRequest):
    """
    Chat about an Index Audit snapshot.
    
    The AI assistant is context-locked to the provided audit data
    and will only answer questions using information from that audit.
    Messages are persisted to the database for 72 hours.
    
    Request:
        - index_audit_id: UUID of the index audit to chat about
        - message: User's question
    
    Response:
        - session_id: ID of the chat session
        - response: AI-generated answer grounded in audit data
        - citations: Data points from the audit that were referenced
        - message_count: Total messages in the session
    """
    db = get_supabase()
    
    try:
        result = await index_chat_handler.chat(db, request)
        return result
    except Exception as e:
        log_error("chat", f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat request")


@app.post("/api/chat/cleanup")
async def cleanup_expired_sessions():
    """
    Clean up expired chat sessions (older than 72 hours).
    Can be called by a cron job or manually.
    """
    db = get_supabase()
    
    try:
        count = index_chat_handler.cleanup_expired(db)
        return {"deleted": count, "status": "ok"}
    except Exception as e:
        log_error("chat", f"Cleanup error: {e}")
        raise HTTPException(status_code=500, detail="Failed to cleanup sessions")


@app.delete("/api/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str):
    """
    Delete a specific chat session early (before 72h expiry).
    """
    db = get_supabase()
    
    try:
        db.table("chat_sessions").delete().eq("id", session_id).execute()
        log_info("chat", f"Deleted session {session_id}")
        return {"deleted": True, "session_id": session_id}
    except Exception as e:
        log_error("chat", f"Delete session error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete session")


# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True, access_log=False)
