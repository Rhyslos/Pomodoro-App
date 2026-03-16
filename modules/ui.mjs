import { makeRequest } from './network.mjs';
import { state } from './state.mjs';
import { t } from '/lang/client_i18n.mjs';

// formatting functions
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        if (welcomeMsg) welcomeMsg.innerText = `${t('Welcome,')} ${state.currentUser.username}`;
        translatePage();
    }
}

// room rendering functions
export function renderRoom(status) {
    if (!status) return;

    // update header and basic info
    const nameDisplay = document.getElementById('room-name-display');
    const codeDisplay = document.getElementById('room-code-display');
    const codeSubtitle = document.getElementById('room-code-subtitle');
    const lockBtn = document.getElementById('lock-btn');

    if (nameDisplay) nameDisplay.innerText = status.settings.roomName;
    if (codeDisplay) codeDisplay.innerText = status.id;
    
    if (codeSubtitle) {
        status.settings.showCode ? codeSubtitle.classList.remove('hidden') : codeSubtitle.classList.add('hidden');
    }

    // host-only UI elements
    if (state.currentUser && status.host.userId === state.currentUser.userId) {
        if (lockBtn) {
            lockBtn.classList.remove('hidden');
            lockBtn.innerText = status.isLocked ? '🔒' : '🔓';
        }
        document.querySelectorAll('.host-only').forEach(el => el.classList.remove('hidden'));
    }

    // update timer and status
    const timerDisplay = document.getElementById('timer-display');
    const statusDisplay = document.getElementById('status-display');
    const primaryBtn = document.getElementById('primary-timer-btn');

    if (timerDisplay) timerDisplay.innerText = formatTime(status.timer.remaining);
    if (statusDisplay) statusDisplay.innerText = t(status.timer.state);

    if (primaryBtn) {
        if (status.timer.state === 'idle' || status.timer.state === 'finished') {
            primaryBtn.innerText = t('Start');
            primaryBtn.onclick = () => window.sendTimerAction('start');
        } else if (status.timer.isPaused) {
            primaryBtn.innerText = t('Resume');
            primaryBtn.onclick = () => window.sendTimerAction('resume');
        } else {
            primaryBtn.innerText = t('Pause');
            primaryBtn.onclick = () => window.sendTimerAction('pause');
        }
    }

    renderFloatingNames(status.users);
    renderTasks(status.tasks);
}

// room rendering functions
function renderFloatingNames(users) {
    const container = document.getElementById('floating-names-container');
    if (!container) return;

    container.innerHTML = '';
    users.forEach((user, index) => {
        const badge = document.createElement('div');
        badge.className = 'user-badge floating-name';
        badge.innerText = user.username;
        badge.style.backgroundColor = user.color || 'var(--name-default)';
        
        // set random directions for the shake animation defined in features.css
        badge.style.setProperty('--dir-x', Math.random() > 0.5 ? 1 : -1);
        badge.style.setProperty('--dir-y', Math.random() > 0.5 ? 1 : -1);
        
        badge.onclick = () => window.handleUserClick(user.userId, user.username);
        container.appendChild(badge);
    });
}

// room rendering functions
function renderTasks(tasks) {
    const grid = document.getElementById('tasks-grid');
    if (!grid) return;

    grid.innerHTML = '';
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.style.borderLeft = `5px solid ${task.color || 'var(--accent-main)'}`;
        
        card.innerHTML = `
            <div class="task-info">
                <h4>${task.name}</h4>
                <p>${task.description || ''}</p>
                <small>${task.username}</small>
            </div>
            ${!task.completed ? `<button onclick="completeTask('${task.id}')" class="task-check-btn">✓</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// modal functions
export function openCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeCreateRoomModal() {
    const modal = document.getElementById('create-room-modal');
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
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.add('hidden');
    state.adminTargetUser = null;
}

export function closeDeleteModal() {
    const modal = document.getElementById('delete-account-modal');
    if (modal) modal.classList.add('hidden');
}

// setting functions
export function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) menu.classList.toggle('hidden');
}

export function triggerColorPicker() {
    const picker = document.getElementById('name-color-picker');
    if (picker) picker.click();
}

export function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('pomodoro_theme', isDark ? 'dark' : 'light');
}

// navigation functions
export async function loadPolicy(policyType) {
    if (state.eventSource) state.eventSource.close();
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

// feedback functions
export function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}