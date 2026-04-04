import re
import utils.data_manager as data_manager

# Cache to store precomputed sets so we don't regex 15,000 items on every chat
_indexed_cache = {}
_index_timestamp = 0


def _tokenize(text):
    return re.findall(r"[a-zA-Z0-9]+", str(text).lower())

def get_relevant_data(query, top_k=40):
    """
    Retrieves and ranks relevant chunks from the campus dataset.
    """
    if not query:
        return []
        
    data = data_manager.load_data()
    if not data:
        return []
        
    query_lower = query.lower().strip()
    
    # Ignore common stop words for matching
    stop_words = {
        "what", "is", "the", "a", "an", "for", "in", "of", "to", "and", "on", "are", "do", "does",
        "when", "where", "how", "can", "i", "we", "you", "it", "this", "that", "with", "from", "about"
    }
    query_words = set(w for w in _tokenize(query_lower) if w not in stop_words and len(w) > 1)

    if not query_words:
        return []
    
    global _indexed_cache, _index_timestamp
    
    current_time = data_manager._last_modified_time
    if not _indexed_cache or current_time != _index_timestamp:
        _indexed_cache = {}
        for idx, item in enumerate(data):
            q_text = item.get('question', '').lower()
            a_text = item.get('answer', '').lower()
            content = item.get('content', '').lower()
            section = str(item.get('section', '')).lower()
            keywords = item.get('keywords', [])
            if isinstance(keywords, list):
                k_text = ' '.join(str(k) for k in keywords).lower()
            else:
                k_text = str(keywords).lower()
            category = str(item.get('category', '')).lower()
            source = str(item.get('source', '')).lower()

            combined_text = " ".join([
                category,
                source,
                section,
                q_text,
                a_text,
                content,
                k_text,
            ])
            token_set = set(_tokenize(combined_text))
            
            _indexed_cache[idx] = {
                'item': item,
                'combined_text': combined_text,
                'token_set': token_set
            }
        _index_timestamp = current_time
    
    results = []
    for idx, item in enumerate(data):
        cache_item = _indexed_cache.get(idx)
        if not cache_item:
            continue
            
        combined_text = cache_item['combined_text']
        token_set = cache_item['token_set']
        overlap = query_words.intersection(token_set)
        if not overlap:
            continue

        # Higher score for exact phrase and stronger token overlap.
        overlap_score = len(overlap)
        phrase_bonus = 3 if query_lower in combined_text else 0
        score = overlap_score + phrase_bonus
        results.append((score, cache_item['item']))

    results.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in results[:top_k]]
