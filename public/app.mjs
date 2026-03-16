// module imports
import './modules/userWidget.mjs';
import { makeRequest } from './modules/network.mjs';
import { state } from './modules/state.mjs';
import { loadView, showDashboardScreen, toggleSettings, triggerColorPicker, openCreateRoomModal, closeCreateRoomModal, openTaskModal, closeTaskModal, closeAdminModal, closeDeleteModal, toggleTheme, loadPolicy } from './modules/ui.mjs';
import { startSSE, createSession, joinRoom, leaveSession, endSession, sendTimerAction, copyRoomCode, createTask, completeTask, handleUserClick, adminAction, toggleRoomLock, addFakeUser, goHome } from './modules/roomClient.mjs';
import { handleLogin, handleRegister, logoutAccount, deleteAccount, confirmDeleteAccount, changeDisplayName, changePassword, changeDisplayColor } from './modules/auth.mjs';
import { setLanguage, loadClientDictionary } from '/lang/client_i18n.mjs';

// initialization functions
async function initApp() {
    await loadClientDictionary();
    
    try {
        const user = await makeRequest('/api/users/me', 'GET');
        
        if (user) {
            state.currentUser = user;
            
            const savedRoom = sessionStorage.getItem('pomodoro_room');
            if (savedRoom) {
                state.currentRoomId = savedRoom;
                const loaded = await loadView('room');
                if (loaded) {
                    startSSE();
                    return; 
                }
            }
            
            await showDashboardScreen();
            return;
        }
    } catch (error) {
        console.log("Not logged in or session expired.");
    }
    
    sessionStorage.removeItem('pomodoro_room');
    await loadView('login');
}

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