apiDocumentation.md
Markdown
# API Documentation

Base URL: `http://localhost:8080/api`

## User Endpoints

### Create User
Creates a new user profile with a unique ID and Friend Code.

- **Endpoint:** `POST /users`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "String"
}
Response (201 Created):

JSON
{
  "userId": "uuid-string",
  "friendCode": "XXXX-XXX-XXXX",
  "username": "String",
  "createdAt": "ISO-Date-String"
}
Get User
Retrieves details for a specific user.

Endpoint: GET /users/:userId

Response (200 OK):

JSON
{
  "userId": "uuid-string",
  "friendCode": "XXXX-XXX-XXXX",
  "username": "String",
  "createdAt": "ISO-Date-String"
}
Response (404 Not Found):

JSON
{
  "error": "User not found"
}
Session Endpoints
Create Session
Creates a new Pomodoro room hosted by a specific user.

Endpoint: POST /sessions

Content-Type: application/json

Request Body:

JSON
{
  "hostId": "uuid-string"
}
Response (201 Created):

JSON
{
  "roomId": "ABC-123"
}
Get Session Status
Retrieves the current state of a room, including timer status, participants, and settings.

Endpoint: GET /sessions/:roomId

Response (200 OK):

JSON
{
  "id": "ABC-123",
  "host": { ...userObject },
  "users": [ ...userObjects ],
  "timer": {
    "state": "idle" | "work" | "break",
    "remaining": Integer (seconds),
    "currentSet": Integer,
    "targetSets": Integer,
    "task": "String"
  },
  "settings": {
    "workTime": 25,
    "breakTime": 5,
    "task": "String",
    "targetSets": 4
  }
}
Session Actions
Sends a command to control the timer or update room settings.

Endpoint: POST /sessions/:roomId/action

Content-Type: application/json

Supported Actions: start, stop, settings

1. Start Timer
Request Body:

JSON
{
  "action": "start"
}
2. Stop/Pause Timer
Request Body:

JSON
{
  "action": "stop"
}
3. Update Settings
Request Body:

JSON
{
  "action": "settings",
  "payload": {
    "workTime": 30,
    "breakTime": 10,
    "targetSets": 4,
    "task": "New Task Name"
  }
}
Response (200 OK): Returns the updated Session Status object (same structure as GET /sessions/:roomId).