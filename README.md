# CampusCopilot (AI Agent Module)

This repository contains the CampusCopilot project code. 
*Note: The Frontend and Database integrations are handled in parallel by the wider team. This instruction set focuses strictly on the modular **AI Agent Layer** in the backend.*

## 🌟 Key Features
- **RAG Architecture:** Leverages Retrieval-Augmented Generation to restrict answers strictly to the provided data domain.
- **Role Contexting:** Provides differential responses based on whether the caller specifies the user as a "student" or "faculty".
- **Multilingual NLP:** Uses Gemini's underlying capabilities to respond natively in the language queried.

## 🏗️ Tech Stack
- **AI Backend:** Python, Google Gemini SDK (`google-generativeai`)
- **Environment Management:** `python-dotenv`

## 🚀 AI Module Setup

### 1. Pre-requisites
- Python 3.9+
- Gemini API Key (Studio)

### 2. Environment Initialization
Navigate into the backend and setup your python environment:
```bash
cd backend
python -m venv myenv

# Activate venv:
# Windows: .\myenv\Scripts\Activate.ps1
# Mac/Linux: source myenv/bin/activate

pip install -r requirements.txt
```

### 3. API Configuration
Create a `.env` file inside `/backend` and place your Gemini Key:
```text
GEMINI_API_KEY=your_key_here
```

### 4. Direct Execution Testing
You can standalone-test the AI Logic without the Flask routes or Frontend.
```bash
python services/ai_agent.py
```

## 📁 Repository Structure
- `/frontend` - HTML/CSS/JS presentation layer.
- `/backend` - Flask REST server, routes, and Gemini inference.
  - `/data/campus_data.json` - Local JSON store for relevant campus data.
  - `/utils/data_manager.py` - Thread-safe handler for data insertion/loading.
  - `/services/retrieval.py` - Keyword scoring and sorting system.
  - `/services/ai_agent.py` - Core AI logic engine.
- `/docs` - Architecture and API details.

## 🗄️ Data Management API

The project uses a clean JSON-based data management module (over basic string arrays) to serve relevant context to the Gemini AI models. 

You can programmatically add new information dynamically using the Admin endpoint.

**Add Data Entry:** `POST /api/admin/update-data` (Make sure to register the admin blueprint `admin_bp` in `backend/app.py`).

**Payload:**
```json
{
  "question": "library timing on weekends",
  "answer": "9 AM to 5 PM",
  "category": "library",
  "updated_at": "2026-04-04"
}
```

## 🔌 API Implementation Guide (For Teammates)
To use the AI layer in your own routing files (e.g. inside `app.py`), simply import the agent:

```python
from services.ai_agent import handle_query

# Trigger the prompt chain securely
response_text = handle_query(user_question="When are our exams?", role="student")
print(response_text)
```
