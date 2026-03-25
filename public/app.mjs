// module imports
import './modules/userWidget.mjs';
import { makeRequest, initNetworkListeners } from './modules/network.mjs';
import { state } from './modules/state.mjs';
import { loadView, showDashboardScreen, toggleSettings, triggerColorPicker, openCreateRoomModal, closeCreateRoomModal, openTaskModal, closeTaskModal, closeAdminModal, closeDeleteModal, toggleTheme, loadPolicy, toggleOfflineBanner, initializeTheme } from './modules/ui.mjs';
import { startSSE, createSession, joinRoom, leaveSession, endSession, sendTimerAction, copyRoomCode, createTask, completeTask, handleUserClick, adminAction, toggleRoomLock, addFakeUser, goHome } from './modules/roomClient.mjs';
import { handleLogin, handleRegister, logoutAccount, deleteAccount, confirmDeleteAccount, changeDisplayName, changePassword, changeDisplayColor } from './modules/auth.mjs';
import { setLanguage, loadClientDictionary } from '/lang/client_i18n.mjs';

// initialization functions
async function initApp() {
    await loadClientDictionary();
    
    const cachedUser = localStorage.getItem('pomodoro_user');
    if (cachedUser) {
        try {
            state.currentUser = JSON.parse(cachedUser);
        } catch (e) {
            state.currentUser = null;
        }
    }

    let isOffline = false;
    try {
        const user = await makeRequest('/api/users/me', 'GET');
        if (user) {
            state.currentUser = user;
            localStorage.setItem('pomodoro_user', JSON.stringify(user));
            toggleOfflineBanner(false);
        }
    } catch (error) {
        if (error.status === 401) {
            state.currentUser = null;
            localStorage.removeItem('pomodoro_user');
            sessionStorage.removeItem('pomodoroRoom');
            await loadView('login');
            return;
        }
        
        isOffline = true;
        toggleOfflineBanner(true);
    }

    if (state.currentUser) {
        const savedRoom = sessionStorage.getItem('pomodoroRoom');
        if (savedRoom) {
            state.currentRoomId = savedRoom;
            const loaded = await loadView('room');
            if (loaded && !isOffline) {
                startSSE();
            }
        } else {
            await showDashboardScreen();
        }
    } else {
        await loadView('login');
    }
}

// service worker functions
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
        });
    }
}

// execution functions
initApp();
registerServiceWorker();
initNetworkListeners(initApp);
initializeTheme();

// language bindings
window.changeLanguage = setLanguage;

// ui bindings
window.toggleSettings = toggleSettings;
window.triggerColorPicker = triggerColorPicker;
window.openCreateRoomModal = openCreateRoomModal;
window.closeCreateRoomModal = closeCreateRoomModal;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.closeAdminModal = closeAdminModal;
window.closeDeleteModal = closeDeleteModal;
window.toggleTheme = toggleTheme;
window.loadPolicy = loadPolicy; 

// room bindings
window.createSession = createSession;
window.joinRoom = joinRoom;
window.leaveSession = leaveSession;
window.endSession = endSession;
window.sendTimerAction = sendTimerAction;
window.copyRoomCode = copyRoomCode;
window.createTask = createTask;
window.completeTask = completeTask;
window.handleUserClick = handleUserClick;
window.adminAction = adminAction;
window.toggleRoomLock = toggleRoomLock;
window.addFakeUser = addFakeUser;
window.goHome = goHome;

// auth bindings
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logoutAccount = logoutAccount;
window.deleteAccount = deleteAccount;
window.confirmDeleteAccount = confirmDeleteAccount;
window.changeDisplayName = changeDisplayName;
window.changePassword = changePassword;
window.changeDisplayColor = changeDisplayColor;