import os
from flask import Blueprint, request, jsonify
import google.generativeai as genai

chat_bp = Blueprint('chat_bp', __name__)

# Configure Gemini
# If the key is missing or 'mock', we bypass actual initialization
API_KEY = os.getenv("GEMINI_API_KEY", "mock")
if API_KEY != "mock":
    genai.configure(api_key=API_KEY)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400

    message = data['message']
    language = data.get('language', 'en')

    lang_instruction = " Please reply in English."
    if language == 'hi':
        lang_instruction = " Please reply in Hindi."
    elif language == 'mr':
        lang_instruction = " Please reply in Marathi."
        
    system_prompt = f"You are CampusCopilot, an intelligent campus assistant for students and faculty. You help with scheduling, navigating the campus, finding faculty details, and campus events. Limit your responses to 3-5 concise sentences unless a detailed list is requested. Be polite and helpful.{lang_instruction}"
    
    full_prompt = f"{system_prompt}\n\nUser: {message}"

    try:
        if API_KEY == "mock":
            # Return a mock response if we are just testing local setup without API key
            return jsonify({
                "reply": f"(Mock) Request received in {language}: {message}. Configure GEMINI_API_KEY for real responses."
            }), 200

        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(full_prompt)
        
        return jsonify({
            "reply": response.text
        }), 200
        
    except Exception as e:
        print("Chat Error:", str(e))
        return jsonify({"error": "Failed to process chat request"}), 500
