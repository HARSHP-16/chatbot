import json
import os
import threading
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'campus_data.json')

# Basic lock for safer concurrent writes
_lock = threading.Lock()

def load_data():
    """Load data safely from the JSON file."""
    if not os.path.exists(DATA_PATH):
        return []
    
    with _lock:
        try:
            with open(DATA_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            # Handle corrupted file
            return []
        except Exception as e:
            print(f"Error loading data: {e}")
            return []

def save_data(data):
    """Save data to the JSON file safely preventing corruption."""
    with _lock:
        try:
            # Write to a temporary file first, then replace to avoid corruption
            temp_path = DATA_PATH + '.tmp'
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            os.replace(temp_path, DATA_PATH)
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
