def build_prompt(user_question, context_data, role):
    """
    Builds a structured prompt for the GenAI API to ensure safe, contextual, 
    and RAG-constrained answers.
    """
    system_instruction = f"""
You are CampusCopilot, an intelligent campus assistant responding to a user with the role of '{role}'.
Your primary goal is to answer queries based strictly on the 'Retrieved Campus Data' provided below.

CRITICAL RULES:
1. NO HALLUCINATION: If the 'Retrieved Campus Data' does not contain the answer, you MUST state: "I'm sorry, I don't have that information. Please check the official campus portal."
2. RESTRICTIVE SCOPE: Do not use external knowledge to answer facts about the campus. Only use the provided data.
3. MULTILINGUAL SUPPORT: You must answer in the same language that the user asked the question.
4. ROLE CONTEXT: Frame your response respectfully according to the user's role ({role}).
5. CONCISENESS: Keep your answer helpful and directly address the user's question.
"""

    prompt = f"""
{system_instruction}

--- Retrieved Campus Data ---
{context_data if context_data else "No relevant campus data found."}

--- User Query ---
{user_question}

Provide your response below:
"""
    return prompt.strip()
