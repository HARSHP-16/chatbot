from services.retrieval import retrieve_context
from services.ai_service import get_ai_response

def handle_query(user_question, role="student"):
    """
    Main entry point for the AI Agent system.
    Follows Retrieval-Augmented Generation (RAG) architecture.
    
    Args:
        user_question (str): The query sent by the user in any language.
        role (str): The role of the user (e.g., student, faculty).
        
    Returns:
        str: Final intelligent, context-aware answer from the bot.
    """
    # 1. Error Handling: empty query
    if not user_question or str(user_question).strip() == "":
        return "Please ask a valid question."
        
    # 2. Retrieval: Fetch relevant knowledge from JSON dataset
    retrieved_data = retrieve_context(user_question, top_k=2)
    
    # 3. GenAI API call: Pass question, retrieved data, and role
    final_answer = get_ai_response(question=user_question, data=retrieved_data, role=role)
    
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
