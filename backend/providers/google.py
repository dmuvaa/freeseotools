from .base import BaseProvider
from typing import Optional

class GoogleProvider(BaseProvider):
    def get_primary_model_id(self) -> str:
        # Currently 404s, but intended primary
        return "google/gemini-2.5-pro"

    def get_fallback_model_id(self) -> Optional[str]:
        # Fallback to standard Gemini Pro (Legacy)
        return "google/gemini-pro"

    def is_reasoning_enabled(self) -> bool:
        return False
