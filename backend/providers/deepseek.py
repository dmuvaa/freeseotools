from .base import BaseProvider
from typing import Optional

class DeepSeekProvider(BaseProvider):
    def get_primary_model_id(self) -> str:
        return "deepseek/deepseek-v3.2"

    def get_fallback_model_id(self) -> Optional[str]:
         # Fallback to DeepSeek Coder (often more reliable availability)
        return "deepseek/deepseek-coder"

    def is_reasoning_enabled(self) -> bool:
        # Only enable reasoning for the primary V3.2 model, not the fallback
        # This requires checking which model is being used, but base class handles "is_reasoning_enabled" globally.
        # We might need to override _prepare_payload or just set False to be safe if V3.2 is broken anyway.
        return False
