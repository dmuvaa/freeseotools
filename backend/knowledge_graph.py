
"""
Brand Knowledge Graph Worker
Executes deep-dive "probes" to map brand presence in AI latent space.
"""
import asyncio
import json
from typing import List, Dict, Any
from datetime import datetime

from models import JobPayload, KnowledgeGraphResult, ProbeResult
from openrouter import openrouter_client
from logger import log_info, log_error

class KnowledgeGraphWorker:
    """
    Orchestrates the 4-dimensional probe into the AI model and RAG Source Dump.
    """
    
    def __init__(self):
        pass

    async def execute_graph_job(self, job: JobPayload, db_client) -> KnowledgeGraphResult:
        """
        Main entry point for Knowledge Graph jobs.
        Run 4 probes in parallel, aggregate, and save.
        """
        brand = job.brand_aliases[0] if job.brand_aliases else "Unknown Brand"
        model = job.models[0] if job.models else "perplexity/sonar-medium-online"
        
        log_info("knowledge_graph", f"Starting Knowledge Graph for {brand} on {model}")

        # Define the 4 probes
        probes = [
            self.identity_probe(brand, model),
            self.neighbor_probe(brand, model),
            self.attribute_probe(brand, model),
            self.sentiment_probe(brand, model)
        ]
        
        # Run in parallel
        results = await asyncio.gather(*probes)
        
        # --- RAG DUMP Logic (Sequential, only if supported) ---
        # If model is Perplexity/Sonar, we try to extract sources directly
        rag_sources = []
        if "perplexity" in model or "sonar" in model or "online" in model:
             rag_sources = await self.rag_source_dump(brand, model)
        
        # Aggregate
        kg_result = KnowledgeGraphResult(
            brand=brand,
            probes=results,
            summary=f"Processed {len(results)} probes for {brand}",
            rag_sources=rag_sources
        )
        # Note: KnowledgeGraphResult needs to handle rag_sources if we want it typed, 
        # or we just shove it into the JSON map. Let's put it in the map for DB.
        
        try:
            # Prepare JSONB data
            knowledge_map = {
                "probes": [p.dict() for p in results],
                "rag_sources": rag_sources,
                "summary": kg_result.summary
            }
            
            db_client.table("knowledge_audits").insert({
                "project_id": job.project_id,
                "ai_model": model,
                "knowledge_map": knowledge_map,
                "created_at": datetime.utcnow().isoformat()
            }).execute()
            
            log_info("knowledge_graph", "Saved Knowledge Graph result")
            
        except Exception as e:
            log_error("knowledge_graph", f"Failed to save to DB: {e}")
            raise e

        return kg_result

    async def _query_ai(self, prompt: str, model: str, system_prompt: str = None) -> str:
        """Helper to query AI and get text"""
        try:
            # We construct messages manually here to bypass default behaviors/inject specific system prompts
            messages = []
            if system_prompt:
                 messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            result = await openrouter_client.query(model, messages)
            return result.get("content") or ""
        except Exception as e:
            log_error("knowledge_graph", f"Probe query failed: {e}")
            return ""

    async def identity_probe(self, brand: str, model: str) -> ProbeResult:
        """
        Probe A: Identity Query (The Direct Hit)
        Goal: Tests if the entity exists in the model's 'Long Term Memory'.
        """
        question = f"Who is {brand} and what do they do? Please be concise."
        response = await self._query_ai(question, model)
        
        # Confidence Heuristic
        confidence = 1.0
        lower_resp = response.lower()
        if "i don't know" in lower_resp or "i am not aware" in lower_resp or "no information" in lower_resp:
            confidence = 0.0
        elif len(response) < 50:
            confidence = 0.3 # Vague
            
        return ProbeResult(
            probe_type="identity",
            question=question,
            response=response,
            confidence_score=confidence
        )

    async def neighbor_probe(self, brand: str, model: str) -> ProbeResult:
        """
        Probe B: Association Query (The Neighbors)
        Goal: Tests semantic linkage to category/competitors.
        """
        question = f"List the top 5 competitors to {brand}. Just list names."
        response = await self._query_ai(question, model)
        
        confidence = 0.8 if len(response) > 20 else 0.0
        
        return ProbeResult(
            probe_type="neighbor",
            question=question,
            response=response,
            confidence_score=confidence
        )

    async def attribute_probe(self, brand: str, model: str) -> ProbeResult:
        """
        Probe C: Attribute Query (The Details)
        Goal: Tests for hallucinations on specific details.
        """
        question = f"What is the pricing model of {brand}? Be specific."
        response = await self._query_ai(question, model)
        
        confidence = 0.7 if len(response) > 30 else 0.0
        
        return ProbeResult(
            probe_type="attribute",
            question=question,
            response=response,
            confidence_score=confidence
        )

    async def sentiment_probe(self, brand: str, model: str) -> ProbeResult:
        """
        Probe D: Negative Query (The Stress Test)
        Goal: Uncovers negative sentiment weights.
        """
        question = f"What are common complaints about {brand}?"
        response = await self._query_ai(question, model)
        
        confidence = 0.9 if response and len(response) > 20 else 0.0
        
        return ProbeResult(
            probe_type="sentiment",
            question=question,
            response=response,
            confidence_score=confidence
        )

    async def rag_source_dump(self, brand: str, model: str) -> List[str]:
        """
        The 'RAG Dump': Force model to reveal sources via JSON.
        """
        prompt = f"Search for {brand} online. List every single URL you visited to form your answer. Format the output as a JSON list of URLs."
        
        try:
            response = await self._query_ai(prompt, model)
            # Basic parsing of JSON from text
            try:
                # Find start and end of JSON list
                start = response.find('[')
                end = response.rfind(']') + 1
                if start != -1 and end != -1:
                    json_str = response[start:end]
                    return json.loads(json_str)
            except:
                pass
            return [] # Fallback
        except Exception as e:
            log_error("knowledge_graph", f"RAG Dump failed: {e}")
            return []

# Singleton
knowledge_graph_worker = KnowledgeGraphWorker()
