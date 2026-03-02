from .base import BaseProvider
from typing import Optional

class PerplexityProvider(BaseProvider):
    def get_primary_model_id(self) -> str:
        return "perplexity/sonar-reasoning-pro"

    def get_fallback_model_id(self) -> Optional[str]:
         # Fallback to standard online model (Legacy)
        return "perplexity/sonar-medium-online"

    def is_reasoning_enabled(self) -> bool:
        # Sonar-medium doesn't support reasoning param (it's implicit or N/A)
        return False
