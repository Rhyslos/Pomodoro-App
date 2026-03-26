# Collaborative Pomodoro App

A real-time, multiplayer Pomodoro timer application designed for study groups, remote teams, and accountability partners.

## 🚀 Key Features

### User Account & Profile Management
* **Secure Authentication:** User registration and login utilizing secure password hashing (scrypt) and salting.
* **Profile Customization:** Users can update their display names and choose custom profile colors to uniquely identify themselves in group sessions.
* **Persistent Sessions:** Token-based authentication keeps users logged in across page reloads.
* **Account Control:** Users can change passwords or securely delete their accounts and associated data.

### Real-Time Multiplayer Rooms
* **Room Creation & Joining:** Users can create custom rooms or join existing ones using a unique 6-character alphanumeric room code (e.g., `ABC-DEF`).
* **Live Synchronization:** Utilizes Server-Sent Events (SSE) to broadcast state changes (timer updates, user joins/leaves, task updates) to all connected clients instantly with low overhead.
* **Capacity Limit:** Rooms support up to 16 simultaneous participants to maintain focused environments.

### Advanced Pomodoro Timer
* **Customizable Intervals:** Hosts can define custom durations for Work phases, Short Breaks, and Long Breaks.
* **Set Tracking:** Configurable "Target Sets" allow the timer to automatically trigger a long break after a specified number of work cycles.
* **Auto-Start & Manual Controls:** Hosts can toggle auto-start functionality or manually play, pause, and stop the timer for the entire room.
* **Client-Side Interpolation:** The frontend elegantly handles timer countdowns locally while periodically syncing with the server's absolute timestamps to prevent network latency issues.

### Collaborative Task Management
* **Shared Task List:** Participants can create tasks with titles and descriptions that appear in the room's shared to-do list.
* **Live Tracking:** Tasks are visually tagged with the creator's custom profile color.
* **Completion State:** Users can mark tasks as completed, triggering real-time UI updates (including completion timestamps) for everyone in the room.

### Host & Admin Controls
* **Room Locking:** The host can lock the room to prevent new users from joining, even if they have the room code.
* **Participant Management:** Hosts can kick disruptive users (temporary removal) or ban them (permanent removal from the specific session).
* **Host Transfer:** The current host can promote another participant to host status, transferring all administrative and timer controls.

### Internationalization (i18n)
* **Multi-Language Support:** The application fully supports English (`en`), Norwegian (`no`), and Korean (`ko`).
* **Dynamic Translation:** Language preferences are saved locally and sent via the `Accept-Language` header, allowing both the client UI and server error messages to respond in the user's preferred language.

---

## 🛠 Tech Stack & Architecture

### Frontend (Client)
* **Vanilla JavaScript (ES Modules):** Modular architecture (`app.mjs`, `roomClient.mjs`, `ui.mjs`, `auth.mjs`) for clean separation of concerns.
* **Web Components:** Utilizes custom HTML elements (e.g., `<user-widget>`) for encapsulated, reusable UI components.
* **Dynamic Views:** HTML views are fetched dynamically from the server and injected into the DOM to create a Single Page Application (SPA) feel without heavy frameworks.
* **State Management:** A centralized `state.mjs` object tracks the current user, active room ID, and EventSource connections.

### Backend (Server)
* **Node.js & Express:** Handles API routing, static file serving, and middleware processing.
* **PostgreSQL:** Primary database managed via a custom `PostgresAdapter` class, storing user credentials and metadata.
* **In-Memory Session Manager:** Active rooms and timers live in the server's memory (`sessionManager.mjs`) for lightning-fast state updates and SSE broadcasting.
* **Security Middleware:** Includes cookie parsing, authentication route protection (`requireAuth`), and rate-limiting (`authRateLimiter`) to prevent brute-force login attempts.

---

## ⚙️ Setup & Installation

### Prerequisites
* Node.js (v16+ recommended)
* PostgreSQL Server

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=8080
DATABASE_URL=postgresql://username:password@localhost:5432/pomodorodb
```

### Installation:
1. Clone the repository.
2. Install dependencies.
   - npm install
3. Start the server:
   - node server.mjs
`Note: The PostgresAdapter will automatically create the required users table upon the first successful database connection.`
