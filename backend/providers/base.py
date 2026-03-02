from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
import httpx
import json

class BaseProvider(ABC):
    """
    Abstract base class for AI Model Providers.
    Each provider handles its own specific model IDs, fallbacks, and parameter quirks.
    """

    @abstractmethod
    def get_primary_model_id(self) -> str:
        pass

    @abstractmethod
    def get_fallback_model_id(self) -> Optional[str]:
        pass

    @abstractmethod
    def is_reasoning_enabled(self) -> bool:
        pass

    def _prepare_payload(self, model_id: str, messages: List[Dict], stream: bool = False) -> Dict:
        """Standard payload preparation, can be overridden"""
        payload = {
            "model": model_id,
            "messages": messages,
            "stream": stream,
        }
        
        if self.is_reasoning_enabled():
            payload["reasoning"] = {"enabled": True}

        if stream:
            payload["stream_options"] = {"include_usage": True}
            
        return payload

    async def query(self, client: httpx.AsyncClient, messages: List[Dict]) -> Dict:
        """
        Execute a standard query with fallback logic managed by the provider class if needed.
        Note: The high-level fallback (Provider -> Provider) might be managed by the registry,
        but simple "same provider" fallbacks can be here.
        """
        attempts = [self.get_primary_model_id(), self.get_fallback_model_id()]
        attempts = [m for m in attempts if m] # filter None

        last_error = None

        for model_id in attempts:
            try:
                payload = self._prepare_payload(model_id, messages)
                
                resp = await client.post("/chat/completions", json=payload)
                resp.raise_for_status()
                
                data = resp.json()
                msg = data["choices"][0]["message"]

                return {
                    "actual_model": model_id,
                    "content": msg.get("content"),
                    "reasoning_details": msg.get("reasoning_details"),
                    "usage": data.get("usage"),
                    "raw_response": data,  # Pass full response for metadata extraction (citations)
                }
            except Exception as e:
                # Log happens at caller level or here? Let's assume caller logs basic info,
                # but we can print debug info
                print(f"DEBUG: Provider attempt {model_id} failed: {e}")
                last_error = e
        
        raise last_error or RuntimeError("All attempts failed")
