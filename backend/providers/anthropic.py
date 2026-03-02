from .base import BaseProvider
from typing import Optional

class AnthropicProvider(BaseProvider):
    def get_primary_model_id(self) -> str:
        return "anthropic/claude-opus-4.5"

    def get_fallback_model_id(self) -> Optional[str]:
        # Fallback to stable Claude 3.5 Sonnet
        return "anthropic/claude-3.5-sonnet"

    def is_reasoning_enabled(self) -> bool:
        return False
