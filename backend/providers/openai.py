from .base import BaseProvider
from typing import Optional

class OpenAIProvider(BaseProvider):
    def get_primary_model_id(self) -> str:
        return "openai/gpt-5"

    def get_fallback_model_id(self) -> Optional[str]:
        return "openai/gpt-4o"

    def is_reasoning_enabled(self) -> bool:
        return True
