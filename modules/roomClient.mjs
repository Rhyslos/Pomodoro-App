import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { loadView, showDashboardScreen, renderRoom, closeCreateRoomModal, closeTaskModal, closeAdminModal } from './ui.mjs';
import { t } from '/Lang/client_i18n.mjs';

// polling functions
export async function updateRoomStatus() {
    if (!state.currentRoomId) return;

    const status = await makeRequest(`/api/sessions/${state.currentRoomId}`, "GET");
    
    if (status) {
        state.currentRoomStatus = status; 
        renderRoom(status);
    } else {
        if (state.pollInterval) clearInterval(state.pollInterval);
        state.currentRoomId = null;
        state.currentRoomStatus = null;
        await showDashboardScreen();
        alert(t("Session has ended or you were disconnected."));
    }
}

export function startPolling() {
    if (state.pollInterval) clearInterval(state.pollInterval);
    state.pollInterval = setInterval(updateRoomStatus, 1000);
    updateRoomStatus(); 
}

// user action functions
export async function createSession() {
    if (!state.currentUser) return;

    const roomName = document.getElementById('setting-room-name').value || `${state.currentUser.username}'s Room`;
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
        state.currentRoomId = room.roomId;
        const loaded = await loadView('room');
        if (loaded) startPolling();
    }
}

export async function joinRoom() {
    if (!state.currentUser) return;
    
    const codeInput = document.getElementById('roomCodeInput');
    if (!codeInput || !codeInput.value) return alert(t("Please enter a room code"));
    
    const code = codeInput.value.trim().toUpperCase();
    const room = await makeRequest(`/api/sessions/${code}/join`, "POST");
    
    if (room) {
        state.currentRoomId = room.id;
        const loaded = await loadView('room');
        if (loaded) startPolling();
    }
}

export async function leaveSession() {
    if (!state.currentRoomId || !state.currentUser) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}/leave`, "POST");
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    
    if (state.pollInterval) clearInterval(state.pollInterval);
    await showDashboardScreen();
}

export async function endSession() {
    if (!state.currentRoomId) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}`, "DELETE");
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    
    if (state.pollInterval) clearInterval(state.pollInterval);
    await showDashboardScreen();
}

export function sendTimerAction(action) {
    if (!state.currentRoomId || !state.currentRoomStatus) return;

    if (action === 'start') {
        state.currentRoomStatus.timer.state = 'work';
        state.currentRoomStatus.timer.isPaused = false;
    } else if (action === 'pause') {
        state.currentRoomStatus.timer.isPaused = true;
    } else if (action === 'resume') {
        state.currentRoomStatus.timer.isPaused = false;
    } else if (action === 'stop') {
        state.currentRoomStatus.timer.state = 'idle';
        state.currentRoomStatus.timer.isPaused = false;
        state.currentRoomStatus.timer.remaining = state.currentRoomStatus.settings.workTime * 60;
    }

    renderRoom(state.currentRoomStatus);

    makeRequest(`/api/sessions/${state.currentRoomId}/action`, "POST", { action });
}

export function copyRoomCode() {
    if (!state.currentRoomId) return;
    navigator.clipboard.writeText(state.currentRoomId).then(() => {
        alert(t("Room code copied to clipboard!"));
    });
}

// task management functions
export function createTask() {
    if (!state.currentRoomId || !state.currentUser) return;

    const name = document.getElementById('task-name').value.trim();
    const desc = document.getElementById('task-desc').value.trim();
    
    if (!name) return alert(t("Task name is required"));

    const newTask = {
        name: name,
        description: desc,
        userId: state.currentUser.userId,
        username: state.currentUser.username,
        color: state.currentUser.color,
        createdAt: new Date().toISOString()
    };

    closeTaskModal();

    if (state.currentRoomStatus) {
        if (!state.currentRoomStatus.tasks) state.currentRoomStatus.tasks = [];
        state.currentRoomStatus.tasks.push({ ...newTask, id: 'temp', completed: false });
        renderRoom(state.currentRoomStatus);
    }

    makeRequest(`/api/sessions/${state.currentRoomId}/tasks`, "POST", newTask);
}

export function completeTask(taskId) {
    if (!state.currentRoomId || !state.currentRoomStatus) return;

    if (state.currentRoomStatus.tasks) {
        const task = state.currentRoomStatus.tasks.find(t => t.id === taskId);
        if (task && task.userId === state.currentUser.userId) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            renderRoom(state.currentRoomStatus);
            makeRequest(`/api/sessions/${state.currentRoomId}/tasks/${taskId}`, "PATCH");
        }
    }
}

// admin functions
export function handleUserClick(targetUserId, targetUserName) {
    if (!state.currentRoomStatus) return;

    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => card.classList.remove('highlight'));
    
    const userCards = document.querySelectorAll(`.task-card[data-user="${targetUserId}"]`);
    userCards.forEach(card => card.classList.add('highlight'));

    if (state.currentUser.userId === state.currentRoomStatus.host.userId && targetUserId !== state.currentUser.userId) {
        state.adminTargetUser = targetUserId;
        document.getElementById('admin-target-name').innerText = targetUserName;
        document.getElementById('admin-modal').classList.remove('hidden');
    }
}

export function adminAction(action) {
    if (!state.currentRoomId || !state.currentUser || !state.adminTargetUser) return;
    
    makeRequest(`/api/sessions/${state.currentRoomId}/admin`, "POST", {
        targetId: state.adminTargetUser,
        action: action
    });
    
    closeAdminModal();
}

export function toggleRoomLock() {
    if (!state.currentRoomId || !state.currentUser || !state.currentRoomStatus) return;
    if (state.currentUser.userId !== state.currentRoomStatus.host.userId) return;

    state.currentRoomStatus.isLocked = !state.currentRoomStatus.isLocked;
    renderRoom(state.currentRoomStatus);
    
    makeRequest(`/api/sessions/${state.currentRoomId}/lock`, "POST");
}

export async function addFakeUser() {
    if (!state.currentRoomId) return;
    
    const randomId = Math.floor(Math.random() * 1000);
    const fakeName = `TestUser_${randomId}`;
    
    const response = await makeRequest("/api/users/register", "POST", { username: fakeName, password: "password" });
    
    if (response) {
        const originalToken = localStorage.getItem('pomodoro_token');
        localStorage.setItem('pomodoro_token', response.token);
        await makeRequest(`/api/sessions/${state.currentRoomId}/join`, "POST");
        localStorage.setItem('pomodoro_token', originalToken);
        updateRoomStatus(); 
    }
}

// navigation functions
export async function goHome() {
    if (state.currentUser) {
        if (state.currentRoomId) {
            const loaded = await loadView('room');
            if (loaded) updateRoomStatus();
        } else {
            await showDashboardScreen();
        }
    } else {
        await loadView('login');
    }
}