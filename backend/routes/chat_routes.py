from flask import Blueprint, request, jsonify
from services.ai_agent import handle_query

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint. Delegates to the RAG-based AI agent pipeline.
    Expects: { "message": str, "language": str (en/hi/mr), "role": str (student/faculty/admin) }
    Returns: { "reply": str }
    """
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400

    message = data.get('message', '').strip()
    language = data.get('language', 'en')
    role = data.get('role', 'student')

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Route through the full RAG pipeline (retrieval → prompt build → Gemini)
    reply = handle_query(user_question=message, role=role, language=language)

    return jsonify({"reply": reply}), 200
