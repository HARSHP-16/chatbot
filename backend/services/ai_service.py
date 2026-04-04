import os
import time
from google import genai
from dotenv import load_dotenv
from utils.prompt import build_prompt

# override=True ensures .env always wins over system environment variables
load_dotenv(override=True)

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Models to try in order of preference (fallback chain)
MODELS = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
]


def get_ai_response(question, data, role, language="en"):
    """
    Integrates with Gemini (google-genai SDK) to get a natural language response.
    Tries multiple models with retry + fallback on rate limit errors.
    """
    if not API_KEY or API_KEY == "your_gemini_api_key_here":
        return "System Configuration Error: Please add your GEMINI_API_KEY to backend/.env and restart the server."

    final_prompt = build_prompt(
        user_question=question,
        context_data=data,
        role=role,
        language=language
    )

    client = genai.Client(api_key=API_KEY)

    last_error = None

    for model in MODELS:
        for attempt in range(3):  # up to 3 retries per model
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=final_prompt
                )
                return response.text.strip()

            except Exception as e:
                err_str = str(e)
                last_error = err_str
                print(f"[{model}] Attempt {attempt + 1} failed: {err_str[:120]}")

                if "API_KEY_INVALID" in err_str or "valid API key" in err_str.lower():
                    return "⚠️ Invalid Gemini API key. Please update GEMINI_API_KEY in backend/.env and restart Flask."

                if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                    print(f"Quota exhausted on {model}, immediately trying next model...")
                    break   # Try next model immediately without sleeping

                elif "NOT_FOUND" in err_str or "404" in err_str:
                    print(f"Model {model} not available, trying next...")
                    break   # Try next model immediately

                else:
                    # Unknown error — wait briefly and retry
                    if attempt < 1:
                        time.sleep(1)

    # All models exhausted
    print(f"All models failed. Last error: {last_error}")
    return (
        "⚠️ The AI service is temporarily unavailable due to quota limits. "
        "Please wait a minute and try again, or check your API key billing at "
        "https://ai.dev/rate-limit"
    )
