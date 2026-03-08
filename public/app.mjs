// Gateway functions
async function makeRequest(url, method = "GET", body = null, responseType = "json") {
    try {
        const options = {
            method: method,
            headers: {}
        };

        const token = localStorage.getItem('pomodoro_token');
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        
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
let currentRoomStatus = null; 
let pollInterval = null;
let adminTargetUser = null;

// Lifecycle functions
window.onload = async () => {
    const savedTheme = localStorage.getItem('pomodoro_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    const token = localStorage.getItem('pomodoro_token');
    if (token) {
        const user = await makeRequest("/api/users/me");
        if (user) {
            currentUser = user;
            await showDashboardScreen();
        } else {
            localStorage.removeItem('pomodoro_token');
            await loadView('login');
        }
    } else {
        await loadView('login');
    }
};

// User action functions
async function handleLogin() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!username || !password) return alert("Please enter both username and password");

    const response = await makeRequest("/api/users/login", "POST", { username, password });
    
    if (response) {
        currentUser = response.user;
        localStorage.setItem('pomodoro_token', response.token);
        await showDashboardScreen();
    }
}

async function handleRegister() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!username || !password) return alert("Please enter both username and password");

    const response = await makeRequest("/api/users/register", "POST", { username, password });
    
    if (response) {
        currentUser = response.user;
        localStorage.setItem('pomodoro_token', response.token);
        await showDashboardScreen();
    }
}

async function logoutAccount() {
    await makeRequest("/api/users/logout", "POST");
    localStorage.removeItem('pomodoro_token');
    currentUser = null;
    currentRoomId = null;
    currentRoomStatus = null;
    
    if (pollInterval) clearInterval(pollInterval);
    toggleSettings();
    await loadView('login');
}

function deleteAccount() {
    if (!currentUser) return;
    
    const menu = document.getElementById('settings-menu');
    if (menu) menu.classList.add('hidden');
    
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.add('hidden');
}

async function confirmDeleteAccount() {
    if (!currentUser) return;

    await makeRequest("/api/users/me", "DELETE");
    
    localStorage.removeItem('pomodoro_token');
    currentUser = null;
    currentRoomId = null;
    currentRoomStatus = null;
    
    closeDeleteModal();
    
    if (pollInterval) clearInterval(pollInterval);
    
    await loadView('login');
}

async function createSession() {
    if (!currentUser) return;

    const roomName = document.getElementById('setting-room-name').value || `${currentUser.username}'s Room`;
    const workTime = parseInt(document.getElementById('setting-work-time').value) || 25;
    const breakTime = parseInt(document.getElementById('setting-break-time').value) || 5;
    const longBreakTime = parseInt(document.getElementById('setting-long-break-time').value) || 15;
    const targetSets = parseInt(document.getElementById('setting-target-sets').value) || 4;
    const autoStart = document.getElementById('setting-auto-start').checked;
    const showCode = document.getElementById('setting-show-code').checked;
    const debugMode = document.getElementById('setting-debug').checked;

    closeCreateRoomModal();

    const room = await makeRequest("/api/sessions", "POST", { 
        settings: {
            roomName: roomName,
            workTime: workTime,
            breakTime: breakTime,
            longBreakTime: longBreakTime,
            targetSets: targetSets,
            autoStart: autoStart,
            showCode: showCode,
            debugMode: debugMode
        }
    });
    
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
    const room = await makeRequest(`/api/sessions/${code}/join`, "POST");
    
    if (room) {
        currentRoomId = room.id;
        await showRoomScreen();
        startPolling();
    }
}

async function leaveSession() {
    if (!currentRoomId || !currentUser) return;

    await makeRequest(`/api/sessions/${currentRoomId}/leave`, "POST");
    currentRoomId = null;
    currentRoomStatus = null;
    
    if (pollInterval) clearInterval(pollInterval);
    await showDashboardScreen();
}

async function endSession() {
    if (!currentRoomId) return;

    await makeRequest(`/api/sessions/${currentRoomId}`, "DELETE");
    currentRoomId = null;
    currentRoomStatus = null;
    
    if (pollInterval) clearInterval(pollInterval);
    await showDashboardScreen();
}

function sendTimerAction(action) {
    if (!currentRoomId || !currentRoomStatus) return;

    if (action === 'start') {
        currentRoomStatus.timer.state = 'work';
        currentRoomStatus.timer.isPaused = false;
    } else if (action === 'pause') {
        currentRoomStatus.timer.isPaused = true;
    } else if (action === 'resume') {
        currentRoomStatus.timer.isPaused = false;
    } else if (action === 'stop') {
        currentRoomStatus.timer.state = 'idle';
        currentRoomStatus.timer.isPaused = false;
        currentRoomStatus.timer.remaining = currentRoomStatus.settings.workTime * 60;
    }

    renderRoom(currentRoomStatus);

    makeRequest(`/api/sessions/${currentRoomId}/action`, "POST", { action });
}

function copyRoomCode() {
    if (!currentRoomId) return;
    navigator.clipboard.writeText(currentRoomId).then(() => {
        alert("Room code copied to clipboard!");
    });
}

// Settings functions
function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('pomodoro_theme', isDark ? 'dark' : 'light');
    toggleSettings();
}

function changeDisplayName() {
    if (!currentUser) return;
    const newName = prompt("Enter new display name:", currentUser.username);
    if (!newName || newName.trim() === "") return;

    const finalName = newName.trim();
    currentUser.username = finalName;
    
    if (currentRoomStatus && currentRoomStatus.users) {
        const userIndex = currentRoomStatus.users.findIndex(u => u.userId === currentUser.userId);
        if (userIndex !== -1) currentRoomStatus.users[userIndex].username = finalName;
        renderRoom(currentRoomStatus);
    } else if (!currentRoomId) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.innerText = `Welcome, ${currentUser.username}`;
    }
    
    toggleSettings();
    makeRequest("/api/users/me", "PATCH", { username: finalName });
}

function changePassword() {
    if (!currentUser) return;
    const newPassword = prompt("Enter a new password:");
    if (!newPassword || newPassword.trim() === "") return;

    toggleSettings();
    makeRequest("/api/users/me", "PATCH", { password: newPassword }).then(res => {
        if (res) alert("Password updated successfully.");
    });
}

function triggerColorPicker() {
    const picker = document.getElementById('name-color-picker');
    if (picker) {
        picker.click();
    }
    toggleSettings();
}

function changeDisplayColor(event) {
    if (!currentUser) return;
    const newColor = event.target.value;

    currentUser.color = newColor;
    
    if (currentRoomStatus && currentRoomStatus.users) {
        const userIndex = currentRoomStatus.users.findIndex(u => u.userId === currentUser.userId);
        if (userIndex !== -1) currentRoomStatus.users[userIndex].color = newColor;
        renderRoom(currentRoomStatus);
    }

    makeRequest("/api/users/me", "PATCH", { color: newColor });
}

function openCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
    if (modal) {
        const nameInput = document.getElementById('setting-room-name');
        if (nameInput && currentUser) {
            nameInput.value = `${currentUser.username}'s Room`;
        }
        modal.classList.remove('hidden');
    }
}

function closeCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
    if (modal) modal.classList.add('hidden');
}

// Task management functions
function openTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        document.getElementById('task-name').value = '';
        document.getElementById('task-desc').value = '';
        modal.classList.remove('hidden');
    }
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('hidden');
}

function createTask() {
    if (!currentRoomId || !currentUser) return;

    const name = document.getElementById('task-name').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    
    if (!name) return alert("Task name is required");

    const newTask = {
        name: name,
        description: desc,
        userId: currentUser.userId,
        username: currentUser.username,
        color: currentUser.color,
        createdAt: new Date().toISOString()
    };

    closeTaskModal();

    if (currentRoomStatus) {
        if (!currentRoomStatus.tasks) currentRoomStatus.tasks = [];
        currentRoomStatus.tasks.push({ ...newTask, id: 'temp', completed: false });
        renderRoom(currentRoomStatus);
    }

    makeRequest(`/api/sessions/${currentRoomId}/tasks`, "POST", newTask);
}

function completeTask(taskId) {
    if (!currentRoomId || !currentRoomStatus) return;

    if (currentRoomStatus.tasks) {
        const task = currentRoomStatus.tasks.find(t => t.id === taskId);
        if (task && task.userId === currentUser.userId) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            renderRoom(currentRoomStatus);
            makeRequest(`/api/sessions/${currentRoomId}/tasks/${taskId}`, "PATCH");
        }
    }
}

// Admin functions
function handleUserClick(targetUserId, targetUserName) {
    if (!currentRoomStatus) return;

    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => card.classList.remove('highlight'));
    
    const userCards = document.querySelectorAll(`.task-card[data-user="${targetUserId}"]`);
    userCards.forEach(card => card.classList.add('highlight'));

    if (currentUser.userId === currentRoomStatus.host.userId && targetUserId !== currentUser.userId) {
        adminTargetUser = targetUserId;
        document.getElementById('admin-target-name').innerText = targetUserName;
        document.getElementById('admin-modal').classList.remove('hidden');
    }
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
    adminTargetUser = null;
}

function adminAction(action) {
    if (!currentRoomId || !currentUser || !adminTargetUser) return;
    
    makeRequest(`/api/sessions/${currentRoomId}/admin`, "POST", {
        targetId: adminTargetUser,
        action: action
    });
    
    closeAdminModal();
}

function toggleRoomLock() {
    if (!currentRoomId || !currentUser || !currentRoomStatus) return;
    if (currentUser.userId !== currentRoomStatus.host.userId) return;

    currentRoomStatus.isLocked = !currentRoomStatus.isLocked;
    renderRoom(currentRoomStatus);
    
    makeRequest(`/api/sessions/${currentRoomId}/lock`, "POST");
}

async function addFakeUser() {
    if (!currentRoomId) return;
    
    const randomId = Math.floor(Math.random() * 1000);
    const fakeName = `TestUser_${randomId}`;
    
    const response = await makeRequest("/api/users/register", "POST", { username: fakeName, password: "password" });
    
    if (response) {
        localStorage.setItem('pomodoro_token', response.token);
        await makeRequest(`/api/sessions/${currentRoomId}/join`, "POST");
        updateRoomStatus(); 
    }
}

// Polling functions
async function updateRoomStatus() {
    if (!currentRoomId) return;

    const status = await makeRequest(`/api/sessions/${currentRoomId}`, "GET");
    
    if (status) {
        currentRoomStatus = status; 
        renderRoom(status);
    } else {
        if (pollInterval) clearInterval(pollInterval);
        currentRoomId = null;
        currentRoomStatus = null;
        await showDashboardScreen();
        alert("Session has ended or you were disconnected.");
    }
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(updateRoomStatus, 1000);
    updateRoomStatus(); 
}

// Navigation functions
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

// Format functions
function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    const roomNameDisplay = document.getElementById('room-name-display');
    const roomCodeDisplay = document.getElementById('room-code-display');
    const roomCodeSubtitle = document.getElementById('room-code-subtitle');
    const lockBtn = document.getElementById('lock-btn');
    const hostEndBtn = document.getElementById('host-end-btn');
    
    const timerDisplay = document.getElementById('timer-display');
    const statusDisplay = document.getElementById('status-display');
    const primaryBtn = document.getElementById('primary-timer-btn');
    const namesContainer = document.getElementById('floating-names-container');
    const debugBtn = document.getElementById('debug-fake-user-btn');

    if (roomNameDisplay) roomNameDisplay.innerText = status.settings.roomName;
    if (roomCodeDisplay) roomCodeDisplay.innerText = status.id;
    
    if (roomCodeSubtitle) {
        if (status.settings.showCode) {
            roomCodeSubtitle.classList.remove('hidden');
        } else {
            roomCodeSubtitle.classList.add('hidden');
        }
    }

    if (currentUser && status.host.userId === currentUser.userId) {
        if (lockBtn) {
            lockBtn.classList.remove('hidden');
            lockBtn.innerText = status.isLocked ? '🔒' : '🔓';
        }
        if (hostEndBtn) hostEndBtn.classList.remove('hidden');
    } else {
        if (lockBtn) lockBtn.classList.add('hidden');
        if (hostEndBtn) hostEndBtn.classList.add('hidden');
    }

    if (debugBtn) {
        if (status.settings.debugMode) {
            debugBtn.classList.remove('hidden');
        } else {
            debugBtn.classList.add('hidden');
        }
    }
    
    const minutes = Math.floor(status.timer.remaining / 60);
    const seconds = status.timer.remaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timerDisplay) timerDisplay.innerText = timeString;
    if (statusDisplay) statusDisplay.innerText = status.timer.state.toUpperCase();

    if (primaryBtn) {
        if (status.timer.state === 'idle' || status.timer.state === 'finished') {
            primaryBtn.innerHTML = 'Start';
            primaryBtn.onclick = () => sendTimerAction('start');
        } else if (status.timer.isPaused) {
            primaryBtn.innerHTML = '&#9654;'; 
            primaryBtn.onclick = () => sendTimerAction('resume');
        } else {
            primaryBtn.innerHTML = '&#10074;&#10074;'; 
            primaryBtn.onclick = () => sendTimerAction('pause');
        }
    }

    if (namesContainer && status.users) {
        const currentUsersStr = JSON.stringify(status.users.map(u => ({ n: u.username, c: u.color })).sort((a,b) => a.n.localeCompare(b.n)));
        
        if (namesContainer.dataset.users !== currentUsersStr) {
            namesContainer.dataset.users = currentUsersStr;
            namesContainer.innerHTML = '';
            
            const numUsers = status.users.length;
            const radius = 46; 
            
            status.users.forEach((user, index) => {
                const angle = (index / numUsers) * (2 * Math.PI);
                
                const x = 50 + (radius * Math.cos(angle));
                const y = 50 + (radius * Math.sin(angle));

                const nameEl = document.createElement('div');
                nameEl.className = 'floating-name';
                nameEl.innerText = user.username;
                nameEl.style.left = `${x}%`;
                nameEl.style.top = `${y}%`;

                if (user.color) {
                    nameEl.style.backgroundColor = user.color;
                    nameEl.style.boxShadow = `0 4px 10px ${user.color}50`;
                    nameEl.style.color = '#FFFFFF';
                    nameEl.classList.add('has-custom-color');
                }

                nameEl.onclick = () => handleUserClick(user.userId, user.username);

                nameEl.style.setProperty('--dir-x', index % 2 === 0 ? 1 : -1);
                nameEl.style.setProperty('--dir-y', index % 3 === 0 ? -1 : 1);
                nameEl.style.animationDuration = `${8 + (index % 4) * 2}s`;

                namesContainer.appendChild(nameEl);
            });
        }
    }

    const tasksContainer = document.getElementById('tasks-container');
    const tasksGrid = document.getElementById('tasks-grid');

    if (tasksContainer && tasksGrid && status.tasks) {
        if (status.tasks.length > 0) {
            const tasksHTML = status.tasks.map(task => {
                const customClass = task.color ? 'has-custom-color' : '';
                const customStyle = task.color ? `style="border-top: 4px solid ${task.color};"` : '';
                
                return `
                <div class="task-card ${task.completed ? 'completed' : ''} ${customClass}" data-user="${task.userId}" ${customStyle}>
                    <div class="task-user">${task.username}</div>
                    <h4 class="task-name">${task.name}</h4>
                    ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
                    ${!task.completed && task.userId === currentUser.userId ? `<button class="task-complete-btn" onclick="completeTask('${task.id}')">Complete</button>` : ''}
                    
                    <div class="task-meta">
                        <span>${formatTime(task.createdAt)}</span>
                        <span>${task.completed ? `✓ ${formatTime(task.completedAt)}` : ''}</span>
                    </div>
                </div>
                `;
            }).join('');

            if (tasksGrid.innerHTML !== tasksHTML) {
                tasksGrid.innerHTML = tasksHTML;
            }
        } else {
            tasksGrid.innerHTML = '<p style="color: var(--text-muted); font-size: 0.95rem; grid-column: 1 / -1; text-align: center; margin: 1rem 0;">No tasks added yet. Click the + to add your first task!</p>';
        }
    }
}

// Global scope bindings
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logoutAccount = logoutAccount;
window.deleteAccount = deleteAccount;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteAccount = confirmDeleteAccount;
window.createSession = createSession;
window.joinRoom = joinRoom;
window.leaveSession = leaveSession;
window.endSession = endSession;
window.sendTimerAction = sendTimerAction;
window.copyRoomCode = copyRoomCode;
window.openCreateRoomModal = openCreateRoomModal;
window.closeCreateRoomModal = closeCreateRoomModal;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.createTask = createTask;
window.completeTask = completeTask;
window.handleUserClick = handleUserClick;
window.closeAdminModal = closeAdminModal;
window.adminAction = adminAction;
window.toggleRoomLock = toggleRoomLock;
window.toggleSettings = toggleSettings;
window.toggleTheme = toggleTheme;
window.changeDisplayName = changeDisplayName;
window.changePassword = changePassword;
window.triggerColorPicker = triggerColorPicker;
window.changeDisplayColor = changeDisplayColor;
window.loadPolicy = loadPolicy;
window.goHome = goHome;
window.addFakeUser = addFakeUser;