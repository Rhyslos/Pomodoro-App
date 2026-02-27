// Gateway functions
async function makeRequest(url, method = "GET", body = null, responseType = "json") {
    try {
        const options = {
            method: method,
            headers: {}
        };
        
        if (body && method !== "GET") {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Request failed");
        }

        if (responseType === "text") {
            return await response.text();
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

// Lifecycle functions
window.onload = async () => {
    const savedUser = localStorage.getItem('pomodoro_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        const userExists = await makeRequest(`/api/users/${currentUser.userId}`);
        if (!userExists) {
            await makeRequest("/api/users/restore", "POST", currentUser);
        }
        
        await showDashboardScreen();
    } else {
        await loadView('login');
    }
};

// User action functions
async function handleLogin() {
    const username = document.getElementById('usernameInput').value;
    if (!username) return alert("Please enter a username");

    const user = await makeRequest("/api/users", "POST", { username });
    
    if (user) {
        currentUser = user;
        localStorage.setItem('pomodoro_user', JSON.stringify(user));
        await showDashboardScreen();
    }
}

async function deleteAccount() {
    if (!currentUser) return;

    await makeRequest(`/api/users/${currentUser.userId}`, "DELETE");
    
    localStorage.removeItem('pomodoro_user');
    currentUser = null;
    currentRoomId = null;
    
    if (pollInterval) clearInterval(pollInterval);
    
    await loadView('login');
}

async function createSession() {
    if (!currentUser) return;

    const room = await makeRequest("/api/sessions", "POST", { hostId: currentUser.userId });
    
    if (room) {
        currentRoomId = room.roomId;
        await showRoomScreen();
        startPolling();
    }
}

async function joinRoom() {
    if (!currentUser) return;
    
    const codeInput = document.getElementById('roomCodeInput');
    if (!codeInput || !codeInput.value) return alert("Please enter a room code");
    
    const code = codeInput.value.trim().toUpperCase();
    const room = await makeRequest(`/api/sessions/${code}/join`, "POST", { userId: currentUser.userId });
    
    if (room) {
        currentRoomId = room.id;
        await showRoomScreen();
        startPolling();
    }
}

async function leaveSession() {
    if (!currentRoomId || !currentUser) return;

    await makeRequest(`/api/sessions/${currentRoomId}/leave`, "POST", { userId: currentUser.userId });
    currentRoomId = null;
    
    if (pollInterval) clearInterval(pollInterval);
    await showDashboardScreen();
}

async function endSession() {
    if (!currentRoomId) return;

    await makeRequest(`/api/sessions/${currentRoomId}`, "DELETE");
    currentRoomId = null;
    
    if (pollInterval) clearInterval(pollInterval);
    await showDashboardScreen();
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
    } else {
        if (pollInterval) clearInterval(pollInterval);
        currentRoomId = null;
        await showDashboardScreen();
        alert("Session has ended.");
    }
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(updateRoomStatus, 1000);
    updateRoomStatus(); 
}

// Navigation functions
function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

async function loadPolicy(policyType) {
    if (pollInterval) clearInterval(pollInterval);
    await loadView(policyType);
}

async function goHome() {
    if (currentUser) {
        if (currentRoomId) {
            await showRoomScreen();
        } else {
            await showDashboardScreen();
        }
    } else {
        await loadView('login');
    }
}

// Render functions
async function loadView(viewName) {
    const html = await makeRequest(`/api/views/${viewName}`, "GET", null, "text");
    if (html) {
        const container = document.getElementById('app-container');
        if (container) container.innerHTML = html;
        return true;
    }
    return false;
}

async function showDashboardScreen() {
    const loaded = await loadView('dashboard');
    if (loaded) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) {
            welcomeMsg.innerText = `Welcome, ${currentUser.username}`;
        }
    }
}

async function showRoomScreen() {
    const loaded = await loadView('room');
    if (loaded && currentRoomId) {
        updateRoomStatus();
    }
}

function renderRoom(status) {
    const roomDisplay = document.getElementById('room-code-display');
    const timerDisplay = document.getElementById('timer-display');
    const statusDisplay = document.getElementById('status-display');

    if (roomDisplay) roomDisplay.innerText = status.id;
    
    const minutes = Math.floor(status.timer.remaining / 60);
    const seconds = status.timer.remaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timerDisplay) timerDisplay.innerText = timeString;
    if (statusDisplay) statusDisplay.innerText = status.timer.state.toUpperCase();
}

// Global scope bindings
window.handleLogin = handleLogin;
window.deleteAccount = deleteAccount;
window.createSession = createSession;
window.joinRoom = joinRoom;
window.leaveSession = leaveSession;
window.endSession = endSession;
window.sendTimerAction = sendTimerAction;
window.toggleSettings = toggleSettings;
window.loadPolicy = loadPolicy;
window.goHome = goHome;