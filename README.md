# CampusCopilot

CampusCopilot is a production-ready, multilingual AI-powered campus assistant web application. It helps students and faculty interact with campus data (timetable, events, faculty, rooms, etc.) using natural language and supports smart actions.

## 🌟 Key Features
- **AI Chat Interface:** ChatGPT-like interface powered by the Gemini API for natural conversation.
- **Multilingual Support:** English, Hindi, and Marathi parsing and answering capabilities.
- **Campus Data Integration:** Potential queries on Timetables, Events, and Faculty profiles.
- **Lightweight & Fast:** Built entirely using Vanilla HTML, CSS, JavaScript (no bundler) on top of Python Flask.

## 🏗️ Tech Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Python + Flask
- **AI:** Google Generative AI (Gemini Flash Model)
- **Database:** MongoDB (PyMongo) - Optional, for extending into profiles and memory

## 🚀 Setup Instructions

### 1. Pre-requisites
- Python 3.9+
- MongoDB (Running locally or via Atlas)
- Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Activate venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Create a .env file locally with GEMINI_API_KEY and MONGO_URI
flask run
```
Backend runs locally at `http://127.0.0.1:5000`

### 3. Frontend Setup
```bash
# You can use any static server, e.g. python built-in server:
cd frontend
python -m http.server 5500
```
Then navigate to `http://127.0.0.1:5500`

## 📁 Repository Structure
- `/frontend` - HTML/CSS/JS presentation layer.
- `/backend` - Flask REST server, routes, and Gemini inference.
  - `/data/campus_data.json` - Local JSON store for relevant campus data.
  - `/utils/data_manager.py` - Thread-safe handler for data insertion/loading.
  - `/services/retrieval.py` - Keyword scoring and sorting system.
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
