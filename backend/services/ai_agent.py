from services.retrieval import get_relevant_data
from services.ai_service import get_ai_response

def handle_query(user_question, role="student", language="en"):
    """
    Main entry point for the AI Agent system.
    Follows Retrieval-Augmented Generation (RAG) architecture.

    Args:
        user_question (str): The query sent by the user in any language.
        role (str): The role of the user (e.g., student, faculty, admin).
        language (str): Language code for the reply (en, hi, mr).

    Returns:
        str: Final intelligent, context-aware answer from the bot.
    """
    # 1. Guard: empty query
    if not user_question or str(user_question).strip() == "":
        return "Please ask a valid question."

    # 2. Retrieval: Fetch relevant knowledge from the JSON dataset
    results = get_relevant_data(user_question, top_k=2)

    # Format retrieved items into a readable context string for the prompt
    if results:
        context_parts = []
        for item in results:
            q = item.get('question', '')
            a = item.get('answer', '')
            context_parts.append(f"Q: {q}\nA: {a}")
        retrieved_data = "\n\n".join(context_parts)
    else:
        retrieved_data = ""

    # 3. GenAI API call: Pass question, retrieved data, role, and language
    final_answer = get_ai_response(
        question=user_question,
        data=retrieved_data,
        role=role,
        language=language
    )

    # 4. Return clean response
    return final_answer

# For local testing and execution validation
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    print("\n--- Testing CampusCopilot AI Agent ---")
    question = "When is exam?"
    print(f"Query: {question}")
    
    answer = handle_query(question)
    print(f"Response: \n{answer}\n")
    
    question2 = "Hostel mess options?"
    print(f"Query: {question2}")
    
    answer2 = handle_query(question2, role="faculty")
    print(f"Response: \n{answer2}\n")
