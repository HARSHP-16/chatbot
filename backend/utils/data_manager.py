import json
import os
import threading
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DATA_PATH = os.path.join(BASE_DIR, 'data', 'campus_data.json')

# Basic lock for safer concurrent writes
_lock = threading.Lock()

# In-memory cache for speed optimization
_cached_data = None
_last_modified_time = 0


def _get_data_files():
    if not os.path.isdir(DATA_DIR):
        return []

    ignored_suffixes = ("_index.json", "_stats.json")
    files = []
    for name in os.listdir(DATA_DIR):
        if not name.lower().endswith('.json'):
            continue
        if name.lower().endswith(ignored_suffixes):
            continue
        files.append(os.path.join(DATA_DIR, name))

    return sorted(files)


def _normalize_entry(entry, fallback_source="campus_data"):
    if not isinstance(entry, dict):
        return None

    question = str(entry.get('question', '')).strip()
    answer = str(entry.get('answer', '')).strip()
    content = str(entry.get('content', '')).strip()
    section = str(entry.get('section', '')).strip()
    category = str(entry.get('category', '')).strip() or "general"
    source = str(entry.get('source', '')).strip() or fallback_source

    keywords = entry.get('keywords', [])
    if isinstance(keywords, list):
        normalized_keywords = [str(k).strip() for k in keywords if str(k).strip()]
    elif isinstance(keywords, str) and keywords.strip():
        normalized_keywords = [keywords.strip()]
    else:
        normalized_keywords = []

    if not (question or answer or content):
        return None

    return {
        "question": question,
        "answer": answer,
        "content": content,
        "section": section,
        "category": category,
        "source": source,
        "keywords": normalized_keywords,
        "chunk_id": entry.get('chunk_id'),
    }


def _extract_entries(payload, file_path):
    file_source = os.path.splitext(os.path.basename(file_path))[0]
    entries = []

    if isinstance(payload, list):
        for item in payload:
            normalized = _normalize_entry(item, fallback_source=file_source)
            if normalized:
                entries.append(normalized)
        return entries

    if isinstance(payload, dict):
        # Direct single-record object
        if any(k in payload for k in ("content", "question", "answer")):
            normalized = _normalize_entry(payload, fallback_source=file_source)
            if normalized:
                entries.append(normalized)
            return entries

        # Category-indexed object with arrays of records
        for key, value in payload.items():
            if not isinstance(value, list):
                continue

            for item in value:
                if not isinstance(item, dict):
                    continue
                if 'category' not in item:
                    item = {**item, 'category': key}
                normalized = _normalize_entry(item, fallback_source=file_source)
                if normalized:
                    entries.append(normalized)

    return entries


def _build_signature(paths):
    if not paths:
        return "0-0-0"

    mtimes = [os.path.getmtime(path) for path in paths if os.path.exists(path)]
    if not mtimes:
        return "0-0-0"

    return f"{len(paths)}-{int(max(mtimes) * 1000)}-{int(sum(mtimes) * 1000)}"

def load_data():
    """Load and merge campus data from all supported JSON files."""
    global _cached_data, _last_modified_time

    data_files = _get_data_files()
    if not data_files:
        return []

    current_signature = _build_signature(data_files)

    # Return from memory if the file hasn't changed
    if _cached_data is not None and current_signature == _last_modified_time:
        return _cached_data

    with _lock:
        # Double check inside lock in case another thread already loaded it
        if _cached_data is not None and current_signature == _last_modified_time:
            return _cached_data

        try:
            merged = []
            seen = set()

            for path in data_files:
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        payload = json.load(f)
                except json.JSONDecodeError:
                    continue

                entries = _extract_entries(payload, path)
                for entry in entries:
                    dedup_key = (
                        entry.get('source', ''),
                        str(entry.get('chunk_id', '')),
                        entry.get('question', ''),
                        entry.get('answer', ''),
                        entry.get('content', ''),
                    )
                    if dedup_key in seen:
                        continue
                    seen.add(dedup_key)
                    merged.append(entry)

            _cached_data = merged
            _last_modified_time = current_signature
            return _cached_data
        except Exception as e:
            print(f"Error loading data: {e}")
            return []

def save_data(data):
    """Save data to the JSON file safely preventing corruption."""
    global _cached_data, _last_modified_time
    
    with _lock:
        try:
            # Write to a temporary file first, then replace to avoid corruption
            temp_path = DATA_PATH + '.tmp'
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            os.replace(temp_path, DATA_PATH)
            
            # Immediately update the cache in memory
            _cached_data = data
            _last_modified_time = _build_signature(_get_data_files())
            
            return True
        except Exception as e:
            print(f"Error saving data: {e}")
            return False

def validate_entry(entry):
    """Check if the entry has all required fields and valid formats."""
    required_fields = ['question', 'answer', 'category', 'updated_at']
    for field in required_fields:
        if field not in entry or not isinstance(entry[field], str) or not entry[field].strip():
            return False, f"Missing or invalid field: {field}"
    
    # Try parsing date to ensure correct format
    try:
        datetime.strptime(entry['updated_at'], '%Y-%m-%d')
    except ValueError:
        return False, "Invalid date format for updated_at. Expected YYYY-MM-DD"
        
    return True, "Valid"

def add_entry(entry):
    """Add a new entry, avoiding duplicate questions."""
    is_valid, msg = validate_entry(entry)
    if not is_valid:
        return False, msg
        
    data = load_data()
    
    # Check for duplicates (case-insensitive on question string)
    for existing in data:
        if existing.get('question', '').strip().lower() == entry['question'].strip().lower():
            # Already exists, return early to prevent duplication
            return False, "Duplicate entry: question already exists"
            
    data.append({
        'question': entry['question'].strip(),
        'answer': entry['answer'].strip(),
        'category': entry['category'].strip(),
        'updated_at': entry['updated_at'].strip()
    })
    
    success = save_data(data)
    if success:
        return True, "Entry added successfully"
    else:
        return False, "Failed to save data"
