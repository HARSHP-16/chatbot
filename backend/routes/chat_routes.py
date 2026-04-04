from flask import Blueprint, request, jsonify
from backend.services.ai_agent import handle_query
from backend.services.chat_memory import get_history, append_turn, clear_history
from backend.utils.language import normalize_language

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint. Delegates to the RAG-based AI agent pipeline.
    Expects: { "message": str, "language": str, "role": str (student/faculty/admin) }
    Returns: { "reply": str }
    """
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400

    message = data.get('message', '').strip()
    language = normalize_language(data.get('language', 'en'))
    role = data.get('role', 'student')
    session_id = str(data.get('session_id', '')).strip()
    user_profile = data.get('user_profile', {})

    if not session_id:
        session_id = f"guest:{request.remote_addr or 'unknown'}:{role}"

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Route through the full RAG pipeline
    history = get_history(session_id=session_id, max_turns=6)
    reply = handle_query(
        user_question=message,
        role=role,
        language=language,
        chat_history=history,
        user_profile=user_profile,
    )
    append_turn(session_id=session_id, user_message=message, assistant_reply=reply)

    return jsonify({"reply": reply, "session_id": session_id}), 200


@chat_bp.route('/chat/memory/clear', methods=['POST'])
def clear_chat_memory():
    data = request.get_json() or {}
    session_id = str(data.get('session_id', '')).strip()

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    clear_history(session_id)
    return jsonify({"status": "ok", "message": "Chat memory cleared."}), 200
