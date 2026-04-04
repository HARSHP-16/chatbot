# CampusCopilot API Documentation

Base URL: `http://127.0.0.1:5000/api`

## Core Chat Endpoint

### `POST /chat`
Core endpoint to process user messages via Gemini API and return contextual text responses.

- **Request Body (JSON):** 
```json
{ 
  "message": "Where is the ML lab?", 
  "language": "en" 
}
```

- **Successful Response (200 OK):** 
```json
{ 
  "reply": "The ML lab is on the second floor, Room 204." 
}
```

- **Error Response (400 / 500):**
```json
{
  "error": "Message is required"
}
```
