import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load env
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("Error: OPENROUTER_API_KEY not found in .env")
    sys.exit(1)

print(f"Initializing Client with Key: {api_key[:8]}...")

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=api_key,
)

model_to_test = "anthropic/claude-opus-4.5"
print(f"Testing Model: {model_to_test}...")

try:
    completion = client.chat.completions.create(
      extra_headers={
        "HTTP-Referer": "https://blitzgeo.app", 
        "X-Title": "BlitzGeo Tester", 
      },
      model=model_to_test,
      messages=[
        {
          "role": "user",
          "content": "What is the meaning of life?"
        }
      ]
    )
    print("\n--- RESPONSE SUCCESS ---")
    print(completion.choices[0].message.content)
    print("------------------------\n")

except Exception as e:
    print("\n--- RESPONSE FAILED ---")
    print(e)
    print("-----------------------\n")
