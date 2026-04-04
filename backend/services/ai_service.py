import os
import google.generativeai as genai
from dotenv import load_dotenv

# We need the prompt builder from our utils
from utils.prompt import build_prompt

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY and API_KEY.strip() != "":
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY is not set in .env")

def get_ai_response(question, data, role):
    """
    Integrates with Gemini to get a natural language response.
    Constructs the prompt securely using RAG context.
    """
    if not API_KEY or API_KEY.strip() == "":
        return "System Configuration Error: Gemini API key is missing."

    try:
        # Build strict RAG prompt
        final_prompt = build_prompt(user_question=question, context_data=data, role=role)
        
        # Initialize Gemini 2.5 Flash model (good for speed/hackathons)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Call Generate Content API
        response = model.generate_content(final_prompt)
        
        return response.text.strip()
        
    except Exception as e:
        print(f"GenAI API Error: {str(e)}")
        return "I'm sorry, I encountered an issue while trying to process your request."
