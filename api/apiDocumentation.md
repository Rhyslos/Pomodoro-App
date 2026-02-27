# Pomodoro App Documentation

## 1. Privacy Policy

---

## 3. API Documentation

Base URL: `http://localhost:8080/api`

This API manages the lifecycle and state of collaborative Pomodoro timer rooms, as well as temporary user profile rendering. 

### User Endpoints

#### Create User
Creates a new temporary user profile with a unique ID and Friend Code.

- **Endpoint:** `POST /users`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "String"
}
```

**Response (201 Created):**
```json
{
  "userId": "uuid-string",
  "friendCode": "XXXX-XXX-XXXX",
  "username": "String",
  "createdAt": "ISO-Date-String"
}
```

#### Get User
Retrieves details for a specific user to verify active connection.

- **Endpoint:** `GET /users/:userId`

**Response (200 OK):**
```json
{
  "userId": "uuid-string",
  "friendCode": "XXXX-XXX-XXXX",
  "username": "String",
  "createdAt": "ISO-Date-String"
}
```

**Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

#### Delete User
Deletes the temporary user profile from the active server memory.

- **Endpoint:** `DELETE /users/:userId`

**Response (200 OK):**
```json
{
  "message": "User deleted"
}
```

---

### Session Endpoints

#### Create a Session
Scaffolds a new Pomodoro room and initializes the timer state.

- **Endpoint:** `POST /sessions`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "hostId": "uuid-string"
}
```

**Response (201 Created):**
```json
{
  "roomId": "ABC-123"
}
```

#### Get Session Status
Retrieves the current real-time state of a room, including timer countdowns, current phase (work/break), and participants.

- **Endpoint:** `GET /sessions/:roomId`

**Response (200 OK):**
```json
{
  "id": "ABC-123",
  "host": { 
    "userId": "uuid-string", 
    "username": "String" 
  },
  "users": [ 
    { 
      "userId": "uuid-string", 
      "username": "String" 
    } 
  ],
  "timer": {
    "state": "idle | work | break | finished",
    "remaining": 1500,
    "currentSet": 0,
    "targetSets": 4,
    "task": "Study Group"
  },
  "settings": {
    "workTime": 25,
    "breakTime": 5,
    "task": "Study Group",
    "targetSets": 4
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Room not found"
}
```

#### End a Session
Terminates an active room, compiles the session history metrics, and removes it from active memory.

- **Endpoint:** `DELETE /sessions/:roomId`

**Response (200 OK):**
```json
{
  "message": "Session ended"
}
```

#### Send Timer Action
Manipulates the timer state or updates the room settings for all connected clients.

- **Endpoint:** `POST /sessions/:roomId/action`
- **Content-Type:** `application/json`

**Supported Actions:** `start`, `stop`, `settings`

**1. Start Timer**
```json
{
  "action": "start"
}
```

**2. Stop/Pause Timer**
```json
{
  "action": "stop"
}
```

**3. Update Settings**
```json
{
  "action": "settings",
  "payload": {
    "workTime": 30,
    "breakTime": 10,
    "targetSets": 4,
    "task": "New Task Name"
  }
}
```

**Response (200 OK):** Returns the updated Session Status object.