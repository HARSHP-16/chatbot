from backend.utils.language import get_language_label


def _format_chat_history(chat_history):
    if not chat_history:
        return "No previous conversation."

    lines = []
    for turn in chat_history[-6:]:
        user_text = str(turn.get("user", "")).strip()
        assistant_text = str(turn.get("assistant", "")).strip()

        if user_text:
            lines.append(f"User: {user_text}")
        if assistant_text:
            lines.append(f"Assistant: {assistant_text}")

    return "\n".join(lines) if lines else "No previous conversation."


def _format_user_profile(user_profile):
    if not isinstance(user_profile, dict) or not user_profile:
        return "No profile data provided."

    fields = [
        ("name", "Name"),
        ("email", "Email"),
        ("department", "Department"),
        ("age", "Age"),
        ("semester", "Semester"),
    ]

    lines = []
    for key, label in fields:
        value = str(user_profile.get(key, "")).strip()
        if value:
            lines.append(f"{label}: {value}")

    return "\n".join(lines) if lines else "No profile data provided."


def build_prompt(user_question, context_data, role, language="en", mode="campus", chat_history=None, user_profile=None):
    """
    Builds a grounded prompt to reduce hallucinations and keep responses relevant.
    """
    language_label = get_language_label(language)
    history_text = _format_chat_history(chat_history or [])
    profile_text = _format_user_profile(user_profile or {})

    if mode == "casual":
        prompt = f"""
You are UniMind, a friendly campus assistant.

Rules you must follow:
1) This is casual conversation (greeting/small-talk/help request).
2) Respond naturally and warmly.
3) Do not fabricate specific campus facts (deadlines, fees, rooms, contacts) unless provided in context.
4) If user asks for specific campus facts in this turn, ask one short follow-up question.
5) Keep it concise (1-3 lines).
6) Respond in this language: {language_label}. Keep script natural for that language.
7) User role is: {role}
8) Use chat history for continuity (pronouns, follow-ups), but do not invent missing facts.
9) If profile data is available, use it for personalization (department/semester context).

CHAT HISTORY:
{history_text}

USER PROFILE:
{profile_text}

QUESTION:
{user_question}

ANSWER:
"""
        return prompt.strip()

    prompt = f"""
You are UniMind, a campus assistant.

Rules you must follow:
1) Answer using ONLY the provided campus context data.
2) Do not invent facts, dates, links, room numbers, deadlines, fees, or policies.
3) If context is missing or unclear, say exactly: "I don't know based on the available campus data."
4) Keep the response focused on the user question and avoid unrelated details.
5) Use concise bullet points only when listing multiple items; otherwise use a short paragraph.
6) Respond in this language: {language_label}. Keep script natural for that language.
7) User role is: {role}
8) Use chat history for continuity (pronouns, follow-ups), but never override context data.
9) If profile data is available, use it for personalization (department/semester context).

CHAT HISTORY:
{history_text}

USER PROFILE:
{profile_text}

CONTEXT DATA:
{context_data if context_data else "No relevant data found."}

QUESTION:
{user_question}

ANSWER:
"""
    return prompt.strip()
