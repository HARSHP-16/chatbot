# AI Agent Architecture (Backend)

## Overview
As part of a distributed team effort, this module represents the **AI Layer** of the CampusCopilot backend. It strictly follows a **Retrieval-Augmented Generation (RAG)** approach to ensure responses are safe, context-aware, and immune to hallucination.

## Folder Structure
- `app.py`: Flask entry point, loads environment variables and registers the application routes.
- `routes/`: Contains the Flask Blueprints representing groups of APIs (e.g., `chat_routes.py`, `admin.py`).
- `services/ai_agent.py`: Main entry point exposing `handle_query(user_question, role)`. This is the single AI function teammates should import.
- `services/retrieval.py`: Lightweight JSON keyword search extracting facts from the local dataset.
- `services/ai_service.py`: Wrapper for sending the generated prompt to the `google-generativeai` package.
- `utils/prompt.py`: The core constraint engine specifying AI persona and RAG rules.
- `utils/data_manager.py` (if applicable): Handlers for thread-safe JSON interactions.
- `data/campus_data.json`: The mock structured college data (used temporarily in place of the wider team's database).

## Core Workflows

### 1. Processing a Chat Message (AI Agent API)
1. **Import:** `from services.ai_agent import handle_query` inside the route.
2. **Retrieval**: When a query is called, `retrieval.py` fetches the top 2 highest scoring text blocks from the JSON.
3. **Prompt Construction**: `prompt.py` merges the query, the retrieved data, and the user's role. It applies strict instructions forbidding the AI from using external knowledge.
4. **Generation**: `ai_service.py` sends the prompt to Gemini Flash and returns the mapped answer to the caller.

### 2. Updating Campus Data (Admin API)
1. Admin user sends `POST /api/admin/update-data` with new JSON body.
2. The `admin.py` blueprint validates the shape of the data.
3. `utils/data_manager.py` secures a thread lock and safely writes the new entry into `campus_data.json`.
4. Relevant Context is immediately accessible for the next chat message via the AI Agent.
