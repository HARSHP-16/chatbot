from utils.data_manager import load_data

def get_relevant_data(query, top_k=3):
    """
    Retrieve top relevant campus data for a given query.
    Case-insensitive search, matches query with question field, prioritizes latest data.
    """
    if not query:
        return []
        
    data = load_data()
    if not data:
        return []
        
    query_lower = query.lower().strip()
    query_words = set(query_lower.split())
    
    scored_items = []
    
    for item in data:
        question = item.get('question', '').lower()
        question_words = set(question.split())
        
        score = 0
        
        # Exact match of the entire query in the question
        if query_lower in question:
            score += 10
            
        # Word level matching
        word_overlaps = len(query_words.intersection(question_words))
        score += word_overlaps * 2
        
        if score > 0:
            scored_items.append({
                'item': item,
                'score': score
            })
            
    # Sort primarily by score (descending), secondarily by latest date (descending)
    # The updated_at format is YYYY-MM-DD so simple string comparison works perfectly for sorting
    scored_items.sort(
        key=lambda x: (x['score'], x['item'].get('updated_at', '0000-00-00')), 
        reverse=True
    )
    
    # Return top 2-3 answers as requested
    top_results = [result['item'] for result in scored_items[:top_k]]
    return top_results
