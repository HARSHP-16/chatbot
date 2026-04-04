# Backend Architecture

## Overview
The backend is built with Python and Flask. It uses `Flask-CORS` for cross-origin management from our frontend and `google-generativeai` to converse with the Gemini models.

## Folder Structure
- `/app.py` - Flask entry point, loads environment variables and registers the application routes.
- `/routes` - Contains the Flask Blueprints representing groups of APIs (e.g., `chat_routes.py`, `admin.py`).
- `/services` - Contains retrieval logic for parsing keyword scores on local data.
- `/utils` - Handlers such as the `data_manager.py` for thread-safe JSON interactions.

## Core Workflows

### 1. Processing a Chat Message
1. User sends `POST /api/chat` request from the frontend with `message` and `language` in JSON.
2. The `chat_routes.py` blueprint handles the route.
3. The system pulls relevant context from `campus_data.json` via `services/retrieval.py` based on keyword scoring.
4. The prompt is structured combining the CampusCopilot system prompt with the relevant context and chosen language instruction.
5. The backend hits `gemini-2.5-flash` model.
6. JSON containing the `reply` is returned.

### 2. Updating Campus Data
1. Admin user sends `POST /api/admin/update-data` with new JSON body.
2. The `admin.py` blueprint validates the shape of the data.
3. `utils/data_manager.py` secures a thread lock and safely writes the new entry into `campus_data.json`.
4. Relevant Context is immediately accessible for the next chat message.
