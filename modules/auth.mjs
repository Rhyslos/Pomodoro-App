import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { showDashboardScreen, loadView, toggleSettings, closeDeleteModal, renderRoom } from './ui.mjs';

// user action functions
export async function handleLogin() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!username || !password) return alert("Please enter both username and password");

    const response = await makeRequest("/api/users/login", "POST", { username, password });
    
    if (response) {
        state.currentUser = response.user;
        localStorage.setItem('pomodoro_token', response.token);
        await showDashboardScreen();
    }
}

export async function handleRegister() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    const hasConsented = document.getElementById('tos-consent').checked;
    
    if (!username || !password) return alert("Please enter both username and password");
    if (!hasConsented) return alert("You must agree to the Terms of Service and Privacy Policy to create an account.");

    const response = await makeRequest("/api/users/register", "POST", { username, password });
    
    if (response) {
        state.currentUser = response.user;
        localStorage.setItem('pomodoro_token', response.token);
        await showDashboardScreen();
    }
}

export async function logoutAccount() {
    await makeRequest("/api/users/logout", "POST");
    localStorage.removeItem('pomodoro_token');
    state.currentUser = null;
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    
    if (state.pollInterval) clearInterval(state.pollInterval);
    toggleSettings();
    await loadView('login');
}

export function deleteAccount() {
    if (!state.currentUser) return;
    
    const menu = document.getElementById('settings-menu');
    if (menu) menu.classList.add('hidden');
    
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.remove('hidden');
}

export async function confirmDeleteAccount() {
    if (!state.currentUser) return;

    await makeRequest("/api/users/me", "DELETE");
    
    localStorage.removeItem('pomodoro_token');
    state.currentUser = null;
    state.currentRoomId = null;
    state.currentRoomStatus = null;
    
    closeDeleteModal();
    
    if (state.pollInterval) clearInterval(state.pollInterval);
    
    await loadView('login');
}

// settings functions
export function changeDisplayName() {
    if (!state.currentUser) return;
    const newName = prompt("Enter new display name:", state.currentUser.username);
    if (!newName || newName.trim() === "") return;

    const finalName = newName.trim();
    state.currentUser.username = finalName;
    
    if (state.currentRoomStatus && state.currentRoomStatus.users) {
        const userIndex = state.currentRoomStatus.users.findIndex(u => u.userId === state.currentUser.userId);
        if (userIndex !== -1) state.currentRoomStatus.users[userIndex].username = finalName;
        renderRoom(state.currentRoomStatus);
    } else if (!state.currentRoomId) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) welcomeMsg.innerText = `Welcome, ${state.currentUser.username}`;
    }
    
    toggleSettings();
    makeRequest("/api/users/me", "PATCH", { username: finalName });
}

export function changePassword() {
    if (!state.currentUser) return;
    const newPassword = prompt("Enter a new password:");
    if (!newPassword || newPassword.trim() === "") return;

    toggleSettings();
    makeRequest("/api/users/me", "PATCH", { password: newPassword }).then(res => {
        if (res) alert("Password updated successfully.");
    });
}

export function changeDisplayColor(event) {
    if (!state.currentUser) return;
    const newColor = event.target.value;

    state.currentUser.color = newColor;
    
    if (state.currentRoomStatus && state.currentRoomStatus.users) {
        const userIndex = state.currentRoomStatus.users.findIndex(u => u.userId === state.currentUser.userId);
        if (userIndex !== -1) state.currentRoomStatus.users[userIndex].color = newColor;
        renderRoom(state.currentRoomStatus);
    }

    makeRequest("/api/users/me", "PATCH", { color: newColor });
}