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

## Admin Data Endpoint

### `POST /admin/update-data`
Endpoint to dynamically push new contextual campus information to the JSON store used by the AI Model.

- **Request Body (JSON):** 
```json
{
  "question": "library timing on weekends",
  "answer": "9 AM to 5 PM",
  "category": "library",
  "updated_at": "2026-04-04"
}
```

- **Successful Response (201 Created):** 
```json
{ 
  "message": "Entry added successfully" 
}
```

- **Error Response (400 Bad Request):**
```json
{
  "error": "Duplicate entry: question already exists"
}
```
