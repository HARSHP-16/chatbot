# Backend Architecture

## Overview
The backend is built with Python and Flask. It uses `Flask-CORS` for cross-origin management from our frontend and `google-generativeai` to converse with the Gemini models.

## Folder Structure
- `/app.py` - Flask entry point, loads environment variables and registers the application routes.
- `/routes` - Contains the Flask Blueprints representing groups of APIs (e.g., `chat_routes.py`).

## Core Workflows

### 1. Processing a Chat Message
1. User sends `POST /api/chat` request from the frontend with `message` and `language` in JSON.
2. The `chat_routes.py` blueprint handles the route.
3. The prompt is structured combining the CampusCopilot system prompt with the chosen language instruction.
4. The backend hits `gemini-2.5-flash` model.
5. JSON containing the `reply` is returned.
