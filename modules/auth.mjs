import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { showDashboardScreen, loadView, toggleSettings, closeDeleteModal, renderRoom, showToast, showCustomPrompt } from './ui.mjs';
import { t } from '/lang/client_i18n.mjs';
import { sanitizeString } from './sanitize.mjs';

// authentication functions
export async function handleLogin(username, password) {
    if (!username || !password) return showToast(t("Please enter both username and password"), true);

    const safeUsername = sanitizeString(username);

    const response = await makeRequest("/api/users/login", "POST", { username: safeUsername, password: password });
    
    if (response) {
        state.currentUser = response.user;
        await showDashboardScreen();
    }
}

// authentication functions
export async function handleRegister(username, password, hasConsented) {
    if (!username || !password) return showToast(t("Please enter both username and password"), true);
    if (!hasConsented) return showToast(t("You must agree to the Terms of Service and Privacy Policy to create an account."), true);

    const safeUsername = sanitizeString(username);

    const response = await makeRequest("/api/users/register", "POST", { username: safeUsername, password: password });
    
    if (response) {
        state.currentUser = response.user;
        await showDashboardScreen();
    }
}

// account lifecycle functions
export async function logoutAccount() {
    await makeRequest("/api/users/logout", "POST");
    
    state.currentUser = null;
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    
    if (state.eventSource) state.eventSource.close();
    toggleSettings();
    await loadView('login');
}

// account lifecycle functions
export function deleteAccount() {
    if (!state.currentUser) return;
    
    const menu = document.getElementById('settings-menu');
    if (menu) menu.classList.add('hidden');
    
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.remove('hidden');
}

// account lifecycle functions
export async function confirmDeleteAccount() {
    if (!state.currentUser) return;

    await makeRequest("/api/users/me", "DELETE");
    
    state.currentUser = null;
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    
    closeDeleteModal();
    
    if (state.eventSource) state.eventSource.close();
    
    await loadView('login');
}

// profile settings functions
export async function changeDisplayName() {
    if (!state.currentUser) return;
    const newName = await showCustomPrompt(t("Enter new display name:"), state.currentUser.username);
    if (!newName || newName.trim() === "") return;

    const finalName = sanitizeString(newName.trim());
    state.currentUser.username = finalName;
    
    if (state.currentRoomStatus) {
        if (state.currentRoomStatus.users) {
            const userIndex = state.currentRoomStatus.users.findIndex(u => u.userId === state.currentUser.userId);
            if (userIndex !== -1) state.currentRoomStatus.users[userIndex].username = finalName;
        }
        
        if (state.currentRoomStatus.tasks) {
            for (let task of state.currentRoomStatus.tasks) {
                if (task.userId === state.currentUser.userId) {
                    task.username = finalName;
                }
            }
        }
        
        renderRoom(state.currentRoomStatus);
    } else if (!state.currentRoomId) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.innerText = `Welcome, ${state.currentUser.username}`;
    }
    
    toggleSettings();
    makeRequest("/api/users/me", "PATCH", { username: finalName });
}

// profile settings functions
export async function changePassword() {
    if (!state.currentUser) return;
    const newPassword = await showCustomPrompt(t("Enter a new password:"));
    if (!newPassword || newPassword.trim() === "") return;

    toggleSettings();
    makeRequest("/api/users/me", "PATCH", { password: newPassword.trim() }).then(res => {
        if (res) showToast(t("Password updated successfully."));
    });
}

// profile settings functions
export function changeDisplayColor(eventOrValue) {
    if (!state.currentUser) return;
    
    const rawColor = (eventOrValue && eventOrValue.target) ? eventOrValue.target.value : eventOrValue;
    if (!rawColor) return;

    const newColor = sanitizeString(rawColor);

    state.currentUser.color = newColor;
    
    if (state.currentRoomStatus) {
        if (state.currentRoomStatus.users) {
            const userIndex = state.currentRoomStatus.users.findIndex(u => u.userId === state.currentUser.userId);
            if (userIndex !== -1) state.currentRoomStatus.users[userIndex].color = newColor;
        }
        
        if (state.currentRoomStatus.tasks) {
            for (let task of state.currentRoomStatus.tasks) {
                if (task.userId === state.currentUser.userId) {
                    task.color = newColor;
                }
            }
        }
        
        renderRoom(state.currentRoomStatus);
    }

    makeRequest("/api/users/me", "PATCH", { color: newColor });
}