// Gateway functions
async function makeRequest(url, method = "GET", body = null) {
    try {
        const options = {
            method: method,
            headers: { "Content-Type": "application/json" }
        };
        
        if (body && method !== "GET") {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Request failed");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        alert("Error: " + error.message);
        return null;
    }
}

// State variables
let currentUser = null;
let currentRoomId = null;
let pollInterval = null;

const screens = {
    login: document.getElementById('login-screen'),
    room: document.getElementById('room-screen')
};

// User action functions
async function handleLogin() {
    const username = document.getElementById('usernameInput').value;
    if (!username) return alert("Please enter a username");

    const user = await makeRequest("/api/users", "POST", { username });
    
    if (user) {
        currentUser = user;
        
        document.getElementById('welcome-msg').innerText = `Welcome, ${user.username}`;
        screens.login.classList.add('hidden');
        screens.room.classList.remove('hidden');
    }
}

async function createSession() {
    if (!currentUser) return;

    const room = await makeRequest("/api/sessions", "POST", { hostId: currentUser.userId });
    
    if (room) {
        currentRoomId = room.roomId;
        startPolling();
    }
}

async function sendTimerAction(action) {
    if (!currentRoomId) return;
    await makeRequest(`/api/sessions/${currentRoomId}/action`, "POST", { action });
}

// Polling functions
async function updateRoomStatus() {
    if (!currentRoomId) return;

    const status = await makeRequest(`/api/sessions/${currentRoomId}`, "GET");
    
    if (status) {
        renderRoom(status);
    }
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(updateRoomStatus, 1000);
    updateRoomStatus(); 
}

// Render functions
function renderRoom(status) {
    document.getElementById('room-code-display').innerText = status.id;
    
    const minutes = Math.floor(status.timer.remaining / 60);
    const seconds = status.timer.remaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-display').innerText = timeString;
    document.getElementById('status-display').innerText = status.timer.state.toUpperCase();
}

// Global scope bindings
window.handleLogin = handleLogin;
window.createSession = createSession;
window.sendTimerAction = sendTimerAction;