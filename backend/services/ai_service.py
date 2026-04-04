import os
import time
from groq import Groq
from dotenv import load_dotenv
from backend.utils.prompt import build_prompt

# override=True ensures .env always wins over system environment variables
load_dotenv(override=True)

API_KEY = os.getenv("GROQ_API_KEY", "").strip()

PRIMARY_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
FALLBACK_MODELS = [
    model.strip()
    for model in os.getenv("GROQ_FALLBACK_MODELS", "llama-3.1-8b-instant").split(",")
    if model.strip()
]
MODELS = [PRIMARY_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_MODEL]

MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "900"))
TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.3"))
MAX_RETRIES = int(os.getenv("GROQ_MAX_RETRIES", "2"))


def get_ai_response(question, data, role, language="en", mode="campus", chat_history=None, user_profile=None):
    """
    Integrates with Groq to get a natural language response.
    Tries multiple models with retry + fallback on rate limit errors.
    """
    if not API_KEY or API_KEY == "your_groq_api_key_here":
        return "System Configuration Error: Please add your GROQ_API_KEY to .env and restart the server."

    final_prompt = build_prompt(
        user_question=question,
        context_data=data,
        role=role,
        language=language,
        mode=mode,
        chat_history=chat_history or [],
        user_profile=user_profile or {},
    )

    client = Groq(api_key=API_KEY, timeout=25)

    last_error = None

    for model in MODELS:
        for attempt in range(MAX_RETRIES):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "user",
                            "content": final_prompt,
                        }
                    ],
                    temperature=TEMPERATURE,
                    max_tokens=MAX_TOKENS,
                )
                content = response.choices[0].message.content if response.choices else ""
                if content:
                    return content.strip()
                last_error = "Empty response from Groq"
                continue

            except Exception as e:
                err_str = str(e)
                last_error = err_str
                print(f"[{model}] Attempt {attempt + 1} failed: {err_str[:120]}")

                lower_err = err_str.lower()

                if "api key" in lower_err and "invalid" in lower_err:
                    return "⚠️ Invalid Groq API key. Please update GROQ_API_KEY in .env and restart Flask."

                if "rate limit" in lower_err or "429" in err_str or "quota" in lower_err:
                    print(f"Quota exhausted on {model}, immediately trying next model...")
                    break   # Try next model immediately without sleeping

                elif "not_found" in lower_err or "404" in err_str or ("model" in lower_err and "decommissioned" in lower_err):
                    print(f"Model {model} not available, trying next...")
                    break   # Try next model immediately

                else:
                    # Unknown error — wait briefly and retry
                    if attempt < MAX_RETRIES - 1:
                        time.sleep(1.2)

    # All models exhausted
    print(f"All models failed. Last error: {last_error}")

    last_error_text = (last_error or "").lower()
    if "resource_exhausted" in last_error_text or "429" in last_error_text or "quota" in last_error_text:
        return (
            "⚠️ The AI service is temporarily unavailable due to quota limits. "
            "Please wait a minute and try again, or check your Groq billing and limits."
        )

    if "api key" in last_error_text and "invalid" in last_error_text:
        return "⚠️ Invalid Groq API key. Please update GROQ_API_KEY in .env and restart Flask."

    return (
        "⚠️ The AI service is temporarily unavailable right now. "
        "Please retry in a moment."
    )
