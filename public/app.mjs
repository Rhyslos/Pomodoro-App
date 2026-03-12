// module imports
import './modules/userWidget.mjs';
import { makeRequest } from './modules/network.mjs';
import { state } from './modules/state.mjs';
import { loadView, showDashboardScreen, toggleSettings, triggerColorPicker, openCreateRoomModal, closeCreateRoomModal, openTaskModal, closeTaskModal, closeAdminModal, closeDeleteModal, toggleTheme } from './modules/ui.mjs';
import { startPolling, createSession, joinRoom, leaveSession, endSession, sendTimerAction, copyRoomCode, createTask, completeTask, handleUserClick, adminAction, toggleRoomLock, addFakeUser } from './modules/roomClient.mjs';
import { handleLogin, handleRegister, logoutAccount, deleteAccount, confirmDeleteAccount, changeDisplayName, changePassword, changeDisplayColor } from './modules/auth.mjs';
import { setLanguage } from '/lang/client_i18n.mjs';

// initialization functions
async function initApp() {
    console.log("App initializing..."); // Let's add a breadcrumb!
    const token = localStorage.getItem('pomodoro_token');
    
    if (token) {
        const user = await makeRequest('/api/users/me', 'GET');
        
        if (user) {
            state.currentUser = user;
            
            const savedRoom = sessionStorage.getItem('pomodoro_room');
            if (savedRoom) {
                state.currentRoomId = savedRoom;
                const loaded = await loadView('room');
                if (loaded) {
                    startPolling();
                    return; 
                }
            }
            
            await showDashboardScreen();
            return;
        } else {
            localStorage.removeItem('pomodoro_token');
            sessionStorage.removeItem('pomodoro_room');
        }
    }
    
    await loadView('login');
}

// Call the function immediately!
initApp();

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

// auth bindings
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.logoutAccount = logoutAccount;
window.deleteAccount = deleteAccount;
window.confirmDeleteAccount = confirmDeleteAccount;
window.changeDisplayName = changeDisplayName;
window.changePassword = changePassword;
window.changeDisplayColor = changeDisplayColor;