# Database Schema (MongoDB)

Currently, the AI features natively support real-time single query. 
To add memory or persist user data, PyMongo should be integrated later into `app.py`.

## Proposed Collections

### `users`
```json
{
  "_id": "ObjectId",
  "name": "String",
  "role": "student | faculty"
}
```

### `events`
```json
{
  "_id": "ObjectId",
  "title": "String",
  "date": "ISODate"
}
```
