import threading
from collections import defaultdict

MAX_TURNS_PER_SESSION = 10

_lock = threading.Lock()
_memory = defaultdict(list)


def get_history(session_id, max_turns=6):
    if not session_id:
        return []

    with _lock:
        turns = list(_memory.get(session_id, []))

    if max_turns <= 0:
        return []
    return turns[-max_turns:]


def append_turn(session_id, user_message, assistant_reply):
    if not session_id:
        return

    turn = {
        "user": str(user_message or "").strip(),
        "assistant": str(assistant_reply or "").strip(),
    }

    if not turn["user"] and not turn["assistant"]:
        return

    with _lock:
        _memory[session_id].append(turn)
        if len(_memory[session_id]) > MAX_TURNS_PER_SESSION:
            _memory[session_id] = _memory[session_id][-MAX_TURNS_PER_SESSION:]


def clear_history(session_id):
    if not session_id:
        return

    with _lock:
        if session_id in _memory:
            del _memory[session_id]
