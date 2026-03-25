import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { t } from '/lang/client_i18n.mjs';

// formatting functions
export function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// view functions
export async function loadView(viewName) {
    const html = await makeRequest(`/api/views/${viewName}`, "GET", null, "text");

    if (html) {
        const container = document.getElementById('app-container');

        if (container) {
            container.innerHTML = html;
            translatePage();
            return true;
        }
    }
    return false;
}

// view functions
export async function showDashboardScreen() {
    const loaded = await loadView('dashboard');
    
    if (loaded && state.currentUser) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) {
            welcomeMsg.innerText = `${t('Welcome,')} ${state.currentUser.username}`;
        }
        
        translatePage();
    }
}

// timer functions
let localTimerInterval = null;

export function startLocalTimer(status) {
    if (localTimerInterval) clearInterval(localTimerInterval);

    const timerDisplay = document.getElementById('timer-display');
    if (!timerDisplay) return;

    const localStartTime = Date.now();
    const initialRemaining = status.timer.remaining;

    localTimerInterval = setInterval(() => {
        let currentRemaining = initialRemaining;

        if (status.timer.state !== 'idle' && !status.timer.isPaused) {
            const elapsedSeconds = Math.floor((Date.now() - localStartTime) / 1000);
            currentRemaining = Math.max(0, initialRemaining - elapsedSeconds);
        }

        const minutes = Math.floor(currentRemaining / 60);
        const seconds = currentRemaining % 60;
        timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (currentRemaining <= 0 && status.timer.state !== 'idle') {
            clearInterval(localTimerInterval);
        }
    }, 250);
}

// rendering functions
export function renderRoom(status) {
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

    if (state.currentUser && status.host.userId === state.currentUser.userId) {
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

    startLocalTimer(status);
    
    if (statusDisplay) {
        statusDisplay.innerText = t(status.timer.state.toUpperCase()) || status.timer.state.toUpperCase();
    }

    if (primaryBtn) {
        if (status.timer.state === 'idle' || status.timer.state === 'finished') {
            primaryBtn.innerHTML = t('Start');
            primaryBtn.onclick = () => window.sendTimerAction('start');
        } else if (status.timer.isPaused) {
            primaryBtn.innerHTML = '&#9654;'; 
            primaryBtn.onclick = () => window.sendTimerAction('resume');
        } else {
            primaryBtn.innerHTML = '&#10074;&#10074;'; 
            primaryBtn.onclick = () => window.sendTimerAction('pause');
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

                nameEl.onclick = () => window.handleUserClick(user.userId, user.username);

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
            tasksGrid.innerHTML = ''; 

            status.tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = `task-card ${task.completed ? 'completed' : ''} ${task.color ? 'has-custom-color' : ''}`;
                card.dataset.user = task.userId;
                
                if (task.color) {
                    card.style.borderTop = `4px solid ${task.color}`;
                }

                const userDiv = document.createElement('div');
                userDiv.className = 'task-user';
                userDiv.innerText = task.username;
                card.appendChild(userDiv);

                const nameH4 = document.createElement('h4');
                nameH4.className = 'task-name';
                nameH4.innerText = task.name;
                card.appendChild(nameH4);

                if (task.description) {
                    const descP = document.createElement('p');
                    descP.className = 'task-desc';
                    descP.innerText = task.description;
                    card.appendChild(descP);
                }

                if (!task.completed && task.userId === state.currentUser.userId) {
                    const completeBtn = document.createElement('button');
                    completeBtn.className = 'task-complete-btn';
                    completeBtn.innerText = t('Complete');
                    completeBtn.onclick = () => window.completeTask(task.id);
                    card.appendChild(completeBtn);
                }

                const metaDiv = document.createElement('div');
                metaDiv.className = 'task-meta';

                const timeSpan = document.createElement('span');
                timeSpan.innerText = formatTime(task.createdAt);
                metaDiv.appendChild(timeSpan);

                const completedSpan = document.createElement('span');
                completedSpan.innerText = task.completed ? `✓ ${formatTime(task.completedAt)}` : '';
                metaDiv.appendChild(completedSpan);

                card.appendChild(metaDiv);
                tasksGrid.appendChild(card);
            });
        } else {
            tasksGrid.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem; grid-column: 1 / -1; text-align: center; margin: 1rem 0;">${t('No tasks added yet. Click the + to add your first task!')}</p>`;
        }
    }
}

// styling functions
export function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}
// styling functions
export function initializeTheme() {
    const savedTheme = localStorage.getItem('pomodoro_theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// styling functions
export function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('pomodoro_theme', isDark ? 'dark' : 'light');
    toggleSettings();
}

// styling functions
export function triggerColorPicker() {
    const picker = document.getElementById('name-color-picker');
    if (picker) {
        picker.click();
    }
    toggleSettings();
}

// modal functions
export function openCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
    if (modal) {
        const nameInput = document.getElementById('setting-room-name');
        if (nameInput && state.currentUser) {
            nameInput.value = `${state.currentUser.username}${t("'s Room")}`;
        }
        modal.classList.remove('hidden');
    }
}

// modal functions
export function closeCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
    if (modal) modal.classList.add('hidden');
}

// modal functions
export function closeDeleteModal() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.add('hidden');
}

// modal functions
export function openTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        document.getElementById('task-name').value = '';
        document.getElementById('task-desc').value = '';
        modal.classList.remove('hidden');
    }
}

// modal functions
export function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('hidden');
}

// modal functions
export function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
    state.adminTargetUser = null;
}

// view functions
export async function loadPolicy(policyType) {
    if (state.pollInterval) clearInterval(state.pollInterval);
    await loadView(policyType);
}

// localization functions
export function translatePage() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        el.innerText = t(key);
    });

    document.querySelectorAll('[data-t-placeholder]').forEach(el => {
        const key = el.getAttribute('data-t-placeholder');
        el.placeholder = t(key);
    });
}

// notification functions
let offlineBanner = null;
let isCurrentlyOffline = false;

export function toggleOfflineBanner(isOffline) {
    if (!offlineBanner) {
        offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        document.body.appendChild(offlineBanner);
    }

    const appContainer = document.getElementById('app-container');

    if (isOffline) {
        if (isCurrentlyOffline) return; 
        isCurrentlyOffline = true;

        offlineBanner.innerText = t("You are currently offline. The application requires an internet connection to function.");
        offlineBanner.classList.add('visible');
        if (appContainer) {
            appContainer.style.pointerEvents = 'none';
            appContainer.style.opacity = '0.5';
        }
    } else {
        if (!isCurrentlyOffline) return; 
        isCurrentlyOffline = false;

        offlineBanner.classList.remove('visible');
        if (appContainer) {
            appContainer.style.pointerEvents = 'auto';
            appContainer.style.opacity = '1';
        }
        showToast(t("You are back online!"));
    }
}

// notification functions
export function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className = 'toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = isError ? '#e74c3c' : '#2ecc71';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.fontFamily = 'inherit';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// prompt functions
export function showCustomPrompt(message, defaultValue = "") {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; 
        overlay.style.left = '0'; 
        overlay.style.width = '100%'; 
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex'; 
        overlay.style.justifyContent = 'center'; 
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000';

        const box = document.createElement('div');
        box.style.backgroundColor = 'var(--bg-color, #ffffff)';
        box.style.color = 'var(--text-color, #333333)';
        box.style.padding = '24px'; 
        box.style.borderRadius = '12px'; 
        box.style.minWidth = '320px';
        box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        box.style.fontFamily = 'inherit';

        const msg = document.createElement('p'); 
        msg.innerText = message; 
        msg.style.marginBottom = '16px';
        msg.style.fontWeight = '500';

        const input = document.createElement('input'); 
        input.type = 'text'; 
        input.value = defaultValue; 
        input.style.width = '100%'; 
        input.style.marginBottom = '24px'; 
        input.style.padding = '10px';
        input.style.borderRadius = '6px';
        input.style.border = '1px solid #ccc';
        input.style.boxSizing = 'border-box';

        const btnContainer = document.createElement('div'); 
        btnContainer.style.display = 'flex'; 
        btnContainer.style.justifyContent = 'flex-end'; 
        btnContainer.style.gap = '12px';

        const cancelBtn = document.createElement('button'); 
        cancelBtn.innerText = t('Cancel') || 'Cancel';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.cursor = 'pointer';

        const confirmBtn = document.createElement('button'); 
        confirmBtn.innerText = 'OK';
        confirmBtn.style.padding = '8px 16px';
        confirmBtn.style.border = 'none';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.backgroundColor = '#2ecc71';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.cursor = 'pointer';

        const cleanup = () => document.body.removeChild(overlay);

        cancelBtn.onclick = () => { cleanup(); resolve(null); };
        confirmBtn.onclick = () => { cleanup(); resolve(input.value); };

        btnContainer.appendChild(cancelBtn); 
        btnContainer.appendChild(confirmBtn);
        
        box.appendChild(msg); 
        box.appendChild(input); 
        box.appendChild(btnContainer);
        overlay.appendChild(box); 
        
        document.body.appendChild(overlay);
        input.focus();
    });
}