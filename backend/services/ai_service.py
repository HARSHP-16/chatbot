import os
import google.generativeai as genai
from dotenv import load_dotenv
from utils.prompt import build_prompt

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY and API_KEY.strip() not in ("", "your_gemini_api_key_here"):
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY is not set or is still the placeholder value in .env")
    API_KEY = None

def get_ai_response(question, data, role, language="en"):
    """
    Integrates with Gemini to get a natural language response.
    Constructs the prompt securely using RAG context.
    """
    if not API_KEY:
        return "System Configuration Error: Gemini API key is missing or not configured."

    try:
        # Build strict RAG prompt with language instruction
        final_prompt = build_prompt(
            user_question=question,
            context_data=data,
            role=role,
            language=language
        )

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(final_prompt)

        return response.text.strip()

    except Exception as e:
        print(f"GenAI API Error: {str(e)}")
        return "I'm sorry, I encountered an issue while trying to process your request."
