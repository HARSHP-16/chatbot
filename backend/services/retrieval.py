import json
import os
import re

# Resolve absolute path to campus_data.json based on the current file's location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'campus_data.json')

def load_data():
    """Loads campus data from the JSON file."""
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading campus data: {e}")
        return []

def retrieve_context(query, top_k=2):
    """
    Implements a simple keyword-based search over the campus JSON data.
    Returns the top 'top_k' relevant answers as a formatted text block.
    """
    if not query:
        return ""

    data = load_data()
    if not data:
        return ""

    # Normalize query for basic keyword matching
    normalized_query = query.lower()
    query_words = set(re.findall(r'\w+', normalized_query))
    
    scored_items = []
    
    for item in data:
        score = 0
        topic = item.get('topic', '').lower()
        keywords = [k.lower() for k in item.get('keywords', [])]
        
        # Exact topic match
        if topic in query_words:
            score += 5
            
        # Keyword matches
        for kw in keywords:
            if kw in query_words:
                score += 2
                
        # Substring match in the content
        content = item.get('content', '').lower()
        for qw in query_words:
            if len(qw) > 3 and qw in content:
                score += 1

        if score > 0:
            scored_items.append({"score": score, "content": item['content']})

    # Sort results by score, descending
    scored_items.sort(key=lambda x: x['score'], reverse=True)
    
    # Extract top answers
    top_results = [item['content'] for item in scored_items[:top_k]]
    
    if not top_results:
        return ""
        
    return "\n\n".join(top_results)
