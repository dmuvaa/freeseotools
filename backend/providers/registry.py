from typing import Dict, Type
from .base import BaseProvider
from .openai import OpenAIProvider
from .google import GoogleProvider
from .anthropic import AnthropicProvider
from .perplexity import PerplexityProvider
from .deepseek import DeepSeekProvider

# Registry mapping model IDs to specific Provider Instances
PROVIDER_REGISTRY: Dict[str, BaseProvider] = {
    "openai/gpt-5": OpenAIProvider(),
    "google/gemini-2.5-pro": GoogleProvider(),
    "anthropic/claude-opus-4.5": AnthropicProvider(),
    "perplexity/sonar-reasoning": PerplexityProvider(),
    "deepseek/deepseek-v3.2": DeepSeekProvider(),
}

def get_provider_for_model(model_id: str) -> BaseProvider:
    if model_id not in PROVIDER_REGISTRY:
        raise ValueError(f"No provider registered for model: {model_id}")
    return PROVIDER_REGISTRY[model_id]
