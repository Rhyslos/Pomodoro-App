import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { loadView, showDashboardScreen, renderRoom, closeCreateRoomModal, closeTaskModal, closeAdminModal } from './ui.mjs';
import { t } from '/lang/client_i18n.mjs';
import { sanitizeString } from './sanitize.mjs';

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

    const rawRoomName = document.getElementById('setting-room-name').value || `${state.currentUser.username}${t("'s Room")}`;
    const roomName = sanitizeString(rawRoomName);
    
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
        state.currentRoomId = room.id;
        sessionStorage.setItem('pomodoro_room', room.id);
        const loaded = await loadView('room');
        if (loaded) startPolling();
    }
}

export async function joinRoom() {
    if (!state.currentUser) return;
    
    const codeInput = document.getElementById('roomCodeInput');
    if (!codeInput || !codeInput.value) return alert(t("Please enter a room code"));
    
    const code = sanitizeString(codeInput.value.trim().toUpperCase());
    const room = await makeRequest(`/api/sessions/${code}/join`, "POST");
    
    if (room) {
        state.currentRoomId = room.id;
        sessionStorage.setItem('pomodoro_room', room.id);
        const loaded = await loadView('room');
        if (loaded) startPolling();
    }
}

export async function leaveSession() {
    if (!state.currentRoomId || !state.currentUser) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}/leave`, "POST");
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    sessionStorage.removeItem('pomodoro_room');
    
    if (state.pollInterval) clearInterval(state.pollInterval);
    await showDashboardScreen();
}

export async function endSession() {
    if (!state.currentRoomId) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}`, "DELETE");
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    sessionStorage.removeItem('pomodoro_room');
    
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

    makeRequest(`/api/sessions/${state.currentRoomId}/action`, "POST", { action: sanitizeString(action) });
}

export function copyRoomCode() {
    if (!state.currentRoomId) return;
    navigator.clipboard.writeText(state.currentRoomId).then(() => {
        alert(t("Room code copied to clipboard!"));
    });
}

// task management functions
export async function createTask() {
    if (!state.currentRoomId || !state.currentUser) return;

    const rawName = document.getElementById('task-name').value.trim();
    const rawDesc = document.getElementById('task-desc').value.trim();
    
    if (!rawName) return alert(t("Task name is required"));

    const name = sanitizeString(rawName);
    const desc = sanitizeString(rawDesc);

    const newTask = {
        name: name,
        description: desc,
        userId: state.currentUser.userId,
        username: sanitizeString(state.currentUser.username),
        color: state.currentUser.color ? sanitizeString(state.currentUser.color) : null,
        createdAt: new Date().toISOString()
    };

    closeTaskModal();

    const createdTask = await makeRequest(`/api/sessions/${state.currentRoomId}/tasks`, "POST", newTask);

    if (createdTask && state.currentRoomStatus) {
        if (!state.currentRoomStatus.tasks) state.currentRoomStatus.tasks = [];
        state.currentRoomStatus.tasks.push(createdTask);
        renderRoom(state.currentRoomStatus);
    }
}

export function completeTask(taskId) {
    if (!state.currentRoomId || !state.currentRoomStatus) return;

    if (state.currentRoomStatus.tasks) {
        const safeTaskId = sanitizeString(taskId);
        const task = state.currentRoomStatus.tasks.find(t => t.id === safeTaskId);
        if (task && task.userId === state.currentUser.userId) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            renderRoom(state.currentRoomStatus);
            makeRequest(`/api/sessions/${state.currentRoomId}/tasks/${safeTaskId}`, "PATCH");
        }
    }
}

// admin functions
export function handleUserClick(targetUserId, targetUserName) {
    if (!state.currentRoomStatus) return;

    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => card.classList.remove('highlight'));
    
    const safeTargetUserId = sanitizeString(targetUserId);
    const safeTargetUserName = sanitizeString(targetUserName);

    const userCards = document.querySelectorAll(`.task-card[data-user="${safeTargetUserId}"]`);
    userCards.forEach(card => card.classList.add('highlight'));

    if (state.currentUser.userId === state.currentRoomStatus.host.userId && safeTargetUserId !== state.currentUser.userId) {
        state.adminTargetUser = safeTargetUserId;
        document.getElementById('admin-target-name').innerText = safeTargetUserName;
        document.getElementById('admin-modal').classList.remove('hidden');
    }
}

export function adminAction(action) {
    if (!state.currentRoomId || !state.currentUser || !state.adminTargetUser) return;
    
    makeRequest(`/api/sessions/${state.currentRoomId}/admin`, "POST", {
        targetId: state.adminTargetUser,
        action: sanitizeString(action)
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

// debug functions
export async function addFakeUser() {
    if (!state.currentRoomId) return;
    
    const response = await makeRequest(`/api/sessions/${state.currentRoomId}/debug/fake-user`, "POST");
    
    if (response) {
        updateRoomStatus(); 
    }
}

// navigation functions
export async function goHome() {
    if (state.currentUser) {
        if (state.currentRoomId) {
            await loadView('room');
            startPolling();
        } else {
            await showDashboardScreen();
        }
    } else {
        await loadView('login');
    }
}