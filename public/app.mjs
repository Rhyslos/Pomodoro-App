import './modules/userWidget.mjs';
import { makeRequest } from './modules/network.mjs';
import { state } from './modules/state.mjs';
import { loadView, showDashboardScreen, toggleSettings, toggleTheme, triggerColorPicker, openCreateRoomModal, closeCreateRoomModal, closeDeleteModal, openTaskModal, closeTaskModal, closeAdminModal, loadPolicy } from './modules/ui.mjs';
import { handleLogin, handleRegister, logoutAccount, deleteAccount, confirmDeleteAccount, changeDisplayName, changePassword, changeDisplayColor } from './modules/auth.mjs';
import { createSession, joinRoom, leaveSession, endSession, sendTimerAction, copyRoomCode, createTask, completeTask, handleUserClick, adminAction, toggleRoomLock, addFakeUser, goHome } from './modules/roomClient.mjs';
import { setLanguage } from '/Lang/client_i18n.mjs';
// lifecycle functions
window.onload = async () => {
    const savedTheme = localStorage.getItem('pomodoro_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    const token = localStorage.getItem('pomodoro_token');
    if (token) {
        const user = await makeRequest("/api/users/me");
        if (user) {
            state.currentUser = user;
            await showDashboardScreen();
        } else {
            localStorage.removeItem('pomodoro_token');
            await loadView('login');
        }
    } else {
        await loadView('login');
    }
};

// global scope bindings
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
window.changeLanguage = (lang) => {
    setLanguage(lang);
};