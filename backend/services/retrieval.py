import re
from utils.data_manager import load_data

def get_relevant_data(query, top_k=5):
    """
    Retrieve top relevant campus data for a given query.
    Case-insensitive search, matches query across question, answer, and keywords.
    """
    if not query:
        return []
        
    data = load_data()
    if not data:
        return []
        
    query_lower = query.lower().strip()
    # Strip punctuation for word matching
    query_clean = re.sub(r'[^\w\s]', '', query_lower)
    
    # Ignore common stop words for better scoring
    stop_words = {"what", "is", "the", "a", "an", "for", "in", "of", "to", "and", "on", "are", "do", "does"}
    query_words = set(w for w in query_clean.split() if w not in stop_words)
    
    scored_items = []
    
    for item in data:
        q_text = item.get('question', '').lower()
        a_text = item.get('answer', '').lower()
        keywords = item.get('keywords', [])
        if isinstance(keywords, list):
            k_text = ' '.join(str(k) for k in keywords).lower()
        else:
            k_text = str(keywords).lower()
            
        combined_text = q_text + " " + a_text + " " + k_text
        
        score = 0
        
        # Exact match of the entire query in the combined text (high weight)
        if query_lower in combined_text:
            score += 20
            
        # Word level matching
        combined_clean = re.sub(r'[^\w\s]', '', combined_text)
        combined_words = set(combined_clean.split())
        
        word_overlaps = len(query_words.intersection(combined_words))
        score += word_overlaps * 3
        
        # Boost score if keywords match explicitly
        if any(w in k_text for w in query_words):
            score += 5
            
        # Extra boost for exact acronym match or special terms
        for w in query_words:
            if w in q_text.split() or w in a_text.split():
                score += 2

        if score > 0:
            scored_items.append({
                'item': item,
                'score': score
            })
            
    # Sort primarily by score (descending), secondarily by latest date (descending)
    scored_items.sort(
        key=lambda x: (x['score'], x['item'].get('updated_at', '0000-00-00')), 
        reverse=True
    )
    
    # Return top answers
    top_results = [result['item'] for result in scored_items[:top_k]]
    return top_results

