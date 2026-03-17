import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { loadView, showDashboardScreen, renderRoom, closeCreateRoomModal, closeTaskModal, closeAdminModal, showToast } from './ui.mjs';
import { t } from '/lang/client_i18n.mjs';
import { sanitizeString } from './sanitize.mjs';

// connection functions
export function startSSE() {
    if (state.eventSource) {
        state.eventSource.close();
    }

    let isUnloading = false;
        window.addEventListener('beforeunload', () => {
        isUnloading = true;
    });
    
    state.eventSource = new EventSource(`/api/sessions/${state.currentRoomId}/events`);

    state.eventSource.onmessage = async (event) => {
        const status = JSON.parse(event.data);
        
        const isStillInRoom = status.users.some(u => u.userId === state.currentUser.userId);
        
        if (!isStillInRoom) {
            state.eventSource.close();
            state.currentRoomId = null;
            state.currentRoomStatus = null;
            sessionStorage.removeItem('pomodoroRoom');
            
            await showDashboardScreen();
            showToast(t("You have been removed from the session."), true);
            return;
        }

        state.currentRoomStatus = status;
        renderRoom(status);
    };

    state.eventSource.onerror = async () => {
        if (isUnloading) return; 

        state.eventSource.close();
        state.currentRoomId = null;
        state.currentRoomStatus = null;
        sessionStorage.removeItem('pomodoroRoom');
        
        await showDashboardScreen();
        showToast(t("Session has ended or you were disconnected."), true);
    };
}

// room action functions
export async function createSession() {
    if (!state.currentUser) return;

    const rawRoomName = document.getElementById('setting-room-name').value || `${state.currentUser.username}${t("'s Room")}`;
    
    const settings = {
        workTime:       parseInt(document.getElementById('setting-work').value),
        breakTime:      parseInt(document.getElementById('setting-break').value),
        longBreakTime:  parseInt(document.getElementById('setting-long').value),
        targetSets:     parseInt(document.getElementById('setting-sets').value),
        autoStart:      document.getElementById('setting-autostart').checked,
        roomName:       sanitizeString(rawRoomName),
        showCode:       document.getElementById('setting-show-code')?.checked || false,
        debugMode:      document.getElementById('setting-debug')?.checked || false
    };

    const room = await makeRequest("/api/sessions", "POST", { settings });
    
    if (room) {
        state.currentRoomId = room.id;
        sessionStorage.setItem('pomodoroRoom', room.id);
        closeCreateRoomModal();
        const loaded = await loadView('room');
        if (loaded) startSSE();
    }
}

// room action functions
export async function joinRoom() {
    const roomIdInput = document.getElementById('roomCodeInput');
    
    if (!roomIdInput) return;

    const roomId = sanitizeString(roomIdInput.value.trim().toUpperCase());

    if (!roomId) return;

    const room = await makeRequest(`/api/sessions/${roomId}/join`, "POST");
    
    if (room) {
        state.currentRoomId = room.id;
        sessionStorage.setItem('pomodoroRoom', room.id);
        const loaded = await loadView('room');
        if (loaded) startSSE();
    }
}

// room action functions
export async function leaveSession() {
    if (!state.currentRoomId || !state.currentUser) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}/leave`, "POST");
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    sessionStorage.removeItem('pomodoroRoom');
    
    if (state.eventSource) state.eventSource.close();
    await showDashboardScreen();
}

// room action functions
export async function endSession() {
    if (!state.currentRoomId) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}`, "DELETE");
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    sessionStorage.removeItem('pomodoroRoom');
    
    if (state.eventSource) state.eventSource.close();
    await showDashboardScreen();
}

// timer action functions
export function sendTimerAction(action) {
    if (!state.currentRoomId) return;
    makeRequest(`/api/sessions/${state.currentRoomId}/action`, "POST", { action: sanitizeString(action) });
}

// ui action functions
export function copyRoomCode() {
    if (state.currentRoomId) {
        navigator.clipboard.writeText(state.currentRoomId);
        showToast(t("Room code copied!"));
    }
}

// task functions
export async function createTask() {
    if (!state.currentRoomId) return;

    const taskName = sanitizeString(document.getElementById('task-name').value);
    const taskDesc = sanitizeString(document.getElementById('task-desc').value);

    if (!taskName) return;

    await makeRequest(`/api/sessions/${state.currentRoomId}/tasks`, "POST", {
        name: taskName,
        description: taskDesc
    });

    closeTaskModal();
}

// task functions
export async function completeTask(taskId) {
    if (!state.currentRoomId) return;
    await makeRequest(`/api/sessions/${state.currentRoomId}/tasks/${taskId}`, "PATCH");
}

// admin functions
export function handleUserClick(targetUserId, targetUserName) {
    if (!state.currentUser || !state.currentRoomStatus) return;

    if (state.currentUser.userId === state.currentRoomStatus.host.userId && state.currentUser.userId !== targetUserId) {
        state.adminTargetUser = targetUserId;
        const safeTargetUserName = sanitizeString(targetUserName);
        document.getElementById('admin-target-name').innerText = safeTargetUserName;
        document.getElementById('admin-modal').classList.remove('hidden');
    }
}

// admin functions
export function adminAction(action) {
    if (!state.currentRoomId || !state.currentUser || !state.adminTargetUser) return;
    
    makeRequest(`/api/sessions/${state.currentRoomId}/admin`, "POST", {
        targetId: state.adminTargetUser,
        action: sanitizeString(action)
    });
    
    closeAdminModal();
}

// admin functions
export function toggleRoomLock() {
    if (!state.currentRoomId || !state.currentUser || !state.currentRoomStatus) return;
    if (state.currentUser.userId !== state.currentRoomStatus.host.userId) return;

    makeRequest(`/api/sessions/${state.currentRoomId}/lock`, "POST");
}

// debug functions
export async function addFakeUser() {
    if (!state.currentRoomId) return;
    await makeRequest(`/api/sessions/${state.currentRoomId}/debug/fake-user`, "POST");
}

// navigation functions
export async function goHome() {
    if (state.currentUser) {
        if (state.currentRoomId) {
            await loadView('room');
            startSSE();
        } else {
            await showDashboardScreen();
        }
    } else {
        await loadView('login');
    }
}