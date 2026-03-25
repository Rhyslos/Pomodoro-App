# Pomodoro API Documentation

Base URL: `http://localhost:8080/api`

This API manages user authentication, collaborative Pomodoro timer rooms via Server-Sent Events (SSE), real-time task synchronization, and session lifecycle management.

### Authentication & Headers

- **Cookies:** All protected routes require a valid HTTP-Only cookie named `pomodoro_token`. This is set automatically upon successful registration or login.
- **Language:** Localization is supported via the `Accept-Language` header (e.g., `en`, `no`).
- **Data Sanitization:** All incoming JSON payloads are automatically sanitized on the server to prevent injection attacks.

---

### System / View Endpoints

#### Get HTML View
Fetches the raw HTML template for a specific view to be injected into the client's DOM.

- **Endpoint:** `GET /views/:viewName`

**Response (200 OK):** *(Returns raw HTML text)*

**Response (400 Bad Request):**
    
    "Invalid view name"

---

### User Endpoints

#### Register User
Creates a new user account and sets the authentication cookie.

- **Endpoint:** `POST /users/register`
- **Content-Type:** `application/json`

**Request Body:**

    {
      "username": "String",
      "password": "String"
    }

**Response (201 Created):**

    {
      "user": {
        "userId": "uuid-string",
        "username": "String",
        "color": "#HEXCODE",
        "createdAt": "ISO-Date-String"
      }
    }

**Error Responses:**
- `400 Bad Request`: `{ "error": "Missing fields" }`
- `409 Conflict`: `{ "error": "Username taken" }`

#### Login User
Authenticates an existing user and sets the authentication cookie.

- **Endpoint:** `POST /users/login`
- **Content-Type:** `application/json`

**Request Body:**

    {
      "username": "String",
      "password": "String"
    }

**Response (200 OK):** *(Same as Register response)*

**Error Responses:**
- `401 Unauthorized`: `{ "error": "Invalid credentials" }`

#### Logout User
Invalidates the current session and clears the authentication cookie.

- **Endpoint:** `POST /users/logout`

**Response (200 OK):**

    {
      "message": "Logged out"
    }

#### Get Current User
Retrieves the profile of the currently authenticated user.

- **Endpoint:** `GET /users/me`

**Response (200 OK):** *(Returns User Object)*

#### Update Current User
Updates profile settings (e.g., username, display color). 
*Note: Changes are instantly synchronized and broadcasted across all active rooms the user is participating in, without requiring them to rejoin.*

- **Endpoint:** `PATCH /users/me`
- **Content-Type:** `application/json`

**Request Body (Partial updates accepted):**

    {
      "username": "NewName",
      "color": "#00FF00"
    }

**Response (200 OK):** *(Returns Updated User Object)*

**Error Responses:**
- `404 Not Found`: `{ "error": "User not found" }`

#### Delete Current User
Permanently deletes the user account and clears the authentication cookie.

- **Endpoint:** `DELETE /users/me`

**Response (200 OK):**

    {
      "message": "Account deleted"
    }

---

### Session (Room) Endpoints

*Note: All endpoints requiring `:roomId` will return a `404 Not Found: { "error": "Room not found" }` if the session does not exist.*

#### Create a Session
Scaffolds a new Pomodoro room, assigns the creator as the host, and initializes the state.

- **Endpoint:** `POST /sessions`
- **Content-Type:** `application/json`

**Request Body:**

    {
      "settings": {
        "workTime": 25,
        "breakTime": 5,
        "longBreakTime": 15,
        "targetSets": 4,
        "task": "Study Group"
      }
    }

**Response (201 Created):** *(Returns complete Room Status object)*

#### Get Session Status
Retrieves the current state of a room. User must be a member of the room to view it.

- **Endpoint:** `GET /sessions/:roomId`

**Response (200 OK):**

    {
      "id": "ABC-123",
      "host": { 
        "userId": "uuid-string", 
        "username": "String",
        "color": "#HEXCODE"
      },
      "users": [ 
        { 
          "userId": "uuid-string", 
          "username": "String",
          "color": "#HEXCODE"
        } 
      ],
      "isLocked": false,
      "tasks": [],
      "settings": {
        "workTime": 25,
        "breakTime": 5,
        "longBreakTime": 15,
        "targetSets": 4,
        "autoStart": false,
        "task": "Study Group",
        "roomName": "User's Room",
        "showCode": false,
        "debugMode": false
      },
      "timer": {
        "state": "idle | work | break | longBreak",
        "remaining": 1500,
        "isPaused": false,
        "currentSet": 0,
        "targetSets": 4,
        "task": "Study Group"
      }
    }

**Error Responses:**
- `403 Forbidden`: `{ "error": "Unauthorized" }` *(If user is not a member of the room)*

#### Real-Time Event Stream (SSE)
Establishes a persistent Server-Sent Events connection. The server broadcasts updates automatically whenever the room state changes.

- **Endpoint:** `GET /sessions/:roomId/events`
- **Headers:** `Accept: text/event-stream`

#### Join a Session
Adds the user to the room's participant list (if the room is not locked or full).

- **Endpoint:** `POST /sessions/:roomId/join`

**Response (200 OK):** *(Returns complete Room Status object)*

**Error Responses:**
- `403 Forbidden`: `{ "error": "Room is locked or full" }`

#### Leave a Session
Removes the user from the room and severs their SSE connection.

- **Endpoint:** `POST /sessions/:roomId/leave`

**Response (200 OK):**

    {
      "message": "Left room"
    }

#### End a Session (Host Only)
Forcefully disconnects all participants and deletes the room from active memory.

- **Endpoint:** `DELETE /sessions/:roomId`

**Response (200 OK):**

    {
      "message": "Session ended"
    }

**Error Responses:**
- `403 Forbidden`: `{ "error": "Unauthorized" }` *(If user is not the host)*

---

### Action & Task Endpoints

#### Send Timer Action (Host Only)
Manipulates the timer state or updates the room settings.

- **Endpoint:** `POST /sessions/:roomId/action`
- **Content-Type:** `application/json`

**Supported Actions:** `start`, `pause`, `resume`, `stop`, `settings`

**Request Body Example (Action):**

    {
      "action": "start"
    }

**Request Body Example (Settings Update):**

    {
      "action": "settings",
      "payload": {
        "workTime": 30,
        "targetSets": 5
      }
    }

**Response (200 OK):** *(Returns complete Room Status object)*

**Error Responses:**
- `403 Forbidden`: `{ "error": "Unauthorized" }` *(If user is not the host)*

#### Create a Task
Adds a new shared task to the room's task board.

- **Endpoint:** `POST /sessions/:roomId/tasks`
- **Content-Type:** `application/json`

**Request Body:**

    {
      "name": "Read Chapter 1",
      "description": "Pages 1-25"
    }

**Response (201 Created):** *(Returns created Task object)*

#### Complete a Task
Marks a specific task as completed. Can only be triggered by the user who created the task.

- **Endpoint:** `PATCH /sessions/:roomId/tasks/:taskId`

**Response (200 OK):**

    {
      "message": "Task completed"
    }

**Error Responses:**
- `403 Forbidden`: `{ "error": "Unauthorized" }` *(If user did not create the task)*
- `404 Not Found`: `{ "error": "Task not found" }`

---

### Admin & Debug Endpoints

#### Toggle Room Lock (Host Only)
Prevents or allows new users from joining the session via the room code.

- **Endpoint:** `POST /sessions/:roomId/lock`

**Response (200 OK):**

    {
      "message": "Lock toggled"
    }

**Error Responses:**
- `403 Forbidden`: `{ "error": "Unauthorized" }` *(If user is not the host)*

#### Execute Admin Action (Host Only)
Manage participants in the room.

- **Endpoint:** `POST /sessions/:roomId/admin`
- **Content-Type:** `application/json`

**Supported Actions:** `kick` (temporary removal), `ban` (permanent removal), `promote` (transfer host privileges).

**Request Body:**

    {
      "targetId": "uuid-string-of-target",
      "action": "kick"
    }

**Response (200 OK):**

    {
      "message": "Admin action executed"
    }

**Error Responses:**
- `403 Forbidden`: `{ "error": "Unauthorized" }` *(If user is not the host)*

#### Inject Fake User (Debug Mode Only)
Generates a bot user and forces it to join the room for UI testing purposes. Requires `debugMode` to be true in room settings.

- **Endpoint:** `POST /sessions/:roomId/debug/fake-user`

**Response (201 Created):**

    {
      "message": "Fake user injected"
    }

**Error Responses:**
- `403 Forbidden`: `{ "error": "Debug mode is disabled" }`