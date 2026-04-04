def build_prompt(user_question, context_data, role, language="en"):
    """
    Builds a structured prompt for the GenAI API to ensure safe, contextual,
    and RAG-constrained answers.
    """
    lang_map = {
        "hi": "Hindi",
        "mr": "Marathi",
        "en": "English"
    }
    lang_name = lang_map.get(language, "English")

    system_instruction = f"""You are CampusCopilot, an intelligent campus assistant responding to a user with the role of '{role}'.
Your primary goal is to answer queries based strictly on the 'Retrieved Campus Data' provided below.

CRITICAL RULES:
1. NO HALLUCINATION: If the 'Retrieved Campus Data' does not contain the answer, you MUST state: "I'm sorry, I don't have that information. Please check the official campus portal."
2. RESTRICTIVE SCOPE: Do not use external knowledge to answer facts about the campus. Only use the provided data.
3. LANGUAGE: You MUST reply in {lang_name}. Even if the user wrote in another language, your response must be in {lang_name}.
4. ROLE CONTEXT: Frame your response respectfully according to the user's role ({role}).
5. CONCISENESS: Keep your answer helpful and directly address the user's question in 3-5 sentences."""

    prompt = f"""
{system_instruction}

--- Retrieved Campus Data ---
{context_data if context_data else "No relevant campus data found for this query."}

--- User Query ---
{user_question}

Provide your response below:
"""
    return prompt.strip()
