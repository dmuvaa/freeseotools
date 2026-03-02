import os
import asyncio
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import httpx
from dotenv import load_dotenv

from logger import log_debug, log_info, log_warn, log_error
from providers.registry import get_provider_for_model, PROVIDER_REGISTRY

# ---------------------------------------------------------------------
# Env
# ---------------------------------------------------------------------
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set")

class OpenRouterClient:
    """
    OpenRouter async client delegating logic to specific model Providers.
    """
    def __init__(self) -> None:
        self.client = httpx.AsyncClient(
            base_url=OPENROUTER_BASE_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://blitzgeo.app",
                "X-Title": "BlitzGeo LLM Analytics",
            },
            timeout=90,
        )
        log_info("openrouter", "Client initialized with Modular Providers")

    async def query(self, requested_model: str, messages: List[Dict]) -> Dict:
        """
        Delegates query to the specific provider for the requested model.
        """
        try:
            provider = get_provider_for_model(requested_model)
            # Provider handles fallback logic internally
            result = await provider.query(self.client, messages)
            
            # Enrich result with requested model for consistency
            result["requested_model"] = requested_model
            return result

        except Exception as e:
            log_error("openrouter", f"Query failed for {requested_model}: {e}")
            raise

    async def query_model(self, model: str, query_text: str) -> Tuple[str, Optional[str]]:
        """
        Legacy helper simplified to use new query method.
        Returns (model, content)
        """
        try:
            messages = [
                {
                    "role": "system", 
                    "content": "You are a brand intelligence analyst. Answer the user query comprehensively. You MUST cite your sources. Use Markdown links [Title](URL) inline, or list them in a 'Sources:' section at the end. If you do not have live internet access, cite known domains."
                },
                {"role": "user", "content": query_text}
            ]
            result = await self.query(model, messages)
            return model, result.get("content")
        except Exception:
            return model, None

    async def query_multiple_models(self, models: list[str], prompt: str) -> Dict[str, Dict]:
        """
        Concurrent execution helper.
        Returns Dict[model_id, response_dict(content, usage, raw_response, etc.)]
        """
        async def safe_query(m):
            try:
                # query returns dict with content, raw_response etc.
                messages = [
                    {
                        "role": "system", 
                        "content": "You are a brand intelligence analyst. Answer the user query comprehensively. You MUST cite your sources. Use Markdown links [Title](URL) inline, or list them in a 'Sources:' section at the end."
                    },
                    {"role": "user", "content": prompt}
                ]
                result = await self.query(m, messages)
                return m, result
            except Exception:
                # Return failed structure
                return m, {"content": None, "error": "Failed"}

        tasks = [safe_query(model) for model in models]
        results = await asyncio.gather(*tasks)
        return dict(results)

    async def close(self):
        await self.client.aclose()


# ---------------------------------------------------------------------
# Exports for main.py compatibility
# ---------------------------------------------------------------------
openrouter_client = OpenRouterClient()
# Export the registry keys as supported models list/dict for validation
SUPPORTED_MODELS = {k: k for k in PROVIDER_REGISTRY.keys()}

if __name__ == "__main__":
    # Simple test
    async def main():
        print("Testing Modular Client...")
        try:
            # Test one of the mapped models
            res = await openrouter_client.query_model("google/gemini-2.5-pro", "Hello")
            print(f"Result: {res}")
        finally:
            await openrouter_client.close()
    
    asyncio.run(main())
