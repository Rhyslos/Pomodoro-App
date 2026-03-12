import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { t } from '/lang/client_i18n.mjs';

// format functions
export function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ui functions
export async function loadView(viewName) {
    console.log(`[Step 1] Requesting view: ${viewName}`);
    
    const html = await makeRequest(`/api/views/${viewName}`, "GET", null, "text");
    console.log(`[Step 2] HTML received. Length: ${html ? html.length : 'null'}`);

    if (html) {
        const container = document.getElementById('app-container');
        console.log(`[Step 3] Container found:`, !!container);

        if (container) {
            container.innerHTML = html;
            console.log(`[Step 4] HTML injected into DOM`);
            
            translatePage();
            console.log(`[Step 5] Translation complete`);
            
            return true;
        }
    }
    return false;
}

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

// ui functions
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
    
    const minutes = Math.floor(status.timer.remaining / 60);
    const seconds = status.timer.remaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timerDisplay) timerDisplay.innerText = timeString;
    
    // rendering functions
    if (statusDisplay) {
        statusDisplay.innerText = t(status.timer.state.toUpperCase()) || status.timer.state.toUpperCase();
    }

    // timer functions
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

    // user rendering functions
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

    // task rendering functions
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

// settings functions
export function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

export function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('pomodoro_theme', isDark ? 'dark' : 'light');
    toggleSettings();
}

export function triggerColorPicker() {
    const picker = document.getElementById('name-color-picker');
    if (picker) {
        picker.click();
    }
    toggleSettings();
}

// settings functions
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

export function closeCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
    if (modal) modal.classList.add('hidden');
}

export function closeDeleteModal() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.add('hidden');
}

export function openTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) {
        document.getElementById('task-name').value = '';
        document.getElementById('task-desc').value = '';
        modal.classList.remove('hidden');
    }
}

export function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('hidden');
}

export function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
    state.adminTargetUser = null;
}

// navigation functions
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