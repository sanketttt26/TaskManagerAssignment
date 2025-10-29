// API Configuration
const API_BASE_URL = 'http://localhost:4000/api/v1';

// State Management
let currentUser = null;
let authToken = null;

// DOM Elements
const elements = {
    authSection: document.getElementById('authSection'),
    tasksSection: document.getElementById('tasksSection'),
    userInfo: document.getElementById('userInfo'),
    userName: document.getElementById('userName'),
    userRole: document.getElementById('userRole'),
    userAvatar: document.getElementById('userAvatar'),
    
    // Auth
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginFormElement: document.getElementById('loginFormElement'),
    registerFormElement: document.getElementById('registerFormElement'),
    loginError: document.getElementById('loginError'),
    registerError: document.getElementById('registerError'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // Tasks
    taskForm: document.getElementById('taskForm'),
    tasksList: document.getElementById('tasksList'),
    loadingMessage: document.getElementById('loadingMessage'),
    emptyMessage: document.getElementById('emptyMessage'),
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    
    // Admin
    adminSection: document.getElementById('adminSection'),
    viewAllTasksBtn: document.getElementById('viewAllTasksBtn'),
    logoutBtn: document.getElementById('logoutBtn')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        loadUserInfo();
    } else {
        showAuthSection();
    }
    
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Login form
    elements.loginFormElement.addEventListener('submit', handleLogin);
    
    // Register form
    elements.registerFormElement.addEventListener('submit', handleRegister);

    // Live password + confirm password validation
    const pwdInput = document.getElementById('registerPassword');
    const confirmPwdInput = document.getElementById('registerConfirmPassword');
    const submitBtn = document.getElementById('registerSubmitBtn');
    const validateRegisterPasswords = () => {
        const password = pwdInput.value || '';
        const confirmPassword = confirmPwdInput.value || '';
        const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        // Default: enable only when non-empty and valid
        let error = '';
        if (password && !policy.test(password)) {
            error = 'Password must be 8+ chars with uppercase, lowercase, number, and special char';
        } else if (confirmPassword && password !== confirmPassword) {
            error = 'Passwords do not match';
        }

        if (error) {
            elements.registerError.textContent = error;
            elements.registerError.classList.add('show');
            submitBtn.disabled = true;
        } else {
            elements.registerError.textContent = '';
            elements.registerError.classList.remove('show');
            // Only enable if both fields are non-empty and policy is satisfied
            submitBtn.disabled = !(password && confirmPassword && policy.test(password) && password === confirmPassword);
        }
    };
    if (pwdInput && confirmPwdInput && submitBtn) {
        pwdInput.addEventListener('input', validateRegisterPasswords);
        confirmPwdInput.addEventListener('input', validateRegisterPasswords);
        // Initialize state
        validateRegisterPasswords();
    }
    
    // Task form
    elements.taskForm.addEventListener('submit', handleCreateTask);
    
    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Admin button
    elements.viewAllTasksBtn.addEventListener('click', handleViewAllTasks);
}

// Tab Switching
function switchTab(tab) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    if (tab === 'login') {
        elements.loginForm.style.display = 'block';
        elements.registerForm.style.display = 'none';
        elements.loginError.classList.remove('show');
    } else {
        elements.loginForm.style.display = 'none';
        elements.registerForm.style.display = 'block';
        elements.registerError.classList.remove('show');
    }
}

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Handle 204 No Content and empty bodies safely
        if (response.status === 204) {
            return {};
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || 'Something went wrong');
            }
            return { message: text };
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        authToken = response.token;
        localStorage.setItem('authToken', authToken);
        
        currentUser = response.user;
        showNotification('Login successful!', 'success');
        
        showTasksSection();
        await loadUserInfo();
        await loadTasks();
        
        elements.loginError.classList.remove('show');
        elements.loginFormElement.reset();
    } catch (error) {
        elements.loginError.textContent = error.message;
        elements.loginError.classList.add('show');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const role = document.getElementById('registerRole').value;
    
    try {
        // Client-side validations
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordPolicy.test(password)) {
            throw new Error('Password must be 8+ chars with uppercase, lowercase, number, and special char');
        }
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, confirmPassword, role })
        });
        
        authToken = response.token;
        localStorage.setItem('authToken', authToken);
        
        currentUser = response.user;
        showNotification('Registration successful!', 'success');
        
        showTasksSection();
        await loadUserInfo();
        await loadTasks();
        
        elements.registerError.classList.remove('show');
        elements.registerFormElement.reset();
    } catch (error) {
        elements.registerError.textContent = error.message;
        elements.registerError.classList.add('show');
    }
}

async function loadUserInfo() {
    try {
        const response = await apiCall('/auth/me');
        currentUser = response.user;
        
        elements.userName.textContent = currentUser.name;
        elements.userRole.textContent = currentUser.role;
        elements.userRole.classList.toggle('admin', currentUser.role === 'admin');
        
        // Set avatar initials
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        elements.userAvatar.textContent = initials;
        
        elements.userInfo.style.display = 'flex';
        
        // Show admin section if user is admin
        elements.adminSection.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        
    } catch (error) {
        console.error('Failed to load user info:', error);
        handleLogout();
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    
    showNotification('Logged out successfully', 'info');
    showAuthSection();
}

// Task Functions
async function loadTasks() {
    elements.loadingMessage.style.display = 'block';
    elements.emptyMessage.style.display = 'none';
    
    try {
        const response = await apiCall('/tasks');
        const tasks = response.tasks;
        
        displayTasks(tasks);
        updateStats(tasks);
        
    } catch (error) {
        showNotification('Failed to load tasks: ' + error.message, 'error');
    } finally {
        elements.loadingMessage.style.display = 'none';
    }
}

function displayTasks(tasks) {
    if (tasks.length === 0) {
        elements.emptyMessage.style.display = 'block';
        elements.tasksList.innerHTML = '';
        return;
    }
    
    elements.emptyMessage.style.display = 'none';
    
    elements.tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task._id}">
            <div class="task-header">
                <div class="task-icon">${task.completed ? '✅' : '📝'}</div>
                <div class="task-content">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                </div>
            </div>
            <div class="task-meta">
                <span class="task-date">📅 ${formatDate(task.createdAt)}</span>
                <span class="task-status">${task.completed ? '✅ Completed' : '⏳ Pending'}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-success btn-sm" onclick="handleToggleTask('${task._id}', ${task.completed})">
                    ${task.completed ? '↩️ Mark Incomplete' : '✓ Mark Complete'}
                </button>
                <button class="btn btn-secondary btn-sm" onclick="handleEditTask('${task._id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="handleDeleteTask('${task._id}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function updateStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;
    elements.pendingTasks.textContent = pending;
}

async function handleCreateTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    
    try {
        await apiCall('/tasks', {
            method: 'POST',
            body: JSON.stringify({ title, description })
        });
        
        showNotification('Task created successfully!', 'success');
        elements.taskForm.reset();
        await loadTasks();
        
    } catch (error) {
        showNotification('Failed to create task: ' + error.message, 'error');
    }
}

async function handleToggleTask(taskId, currentCompleted) {
    try {
        await apiCall(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed: !currentCompleted })
        });
        
        showNotification('Task updated!', 'success');
        await loadTasks();
        
    } catch (error) {
        showNotification('Failed to update task: ' + error.message, 'error');
    }
}

async function handleEditTask(taskId) {
    try {
        const response = await apiCall(`/tasks/${taskId}`);
        const task = response.task;
        
        const newTitle = prompt('Enter new title:', task.title);
        if (newTitle === null) return;
        
        const newDescription = prompt('Enter new description:', task.description || '');
        
        await apiCall(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ 
                title: newTitle, 
                description: newDescription 
            })
        });
        
        showNotification('Task updated!', 'success');
        await loadTasks();
        
    } catch (error) {
        showNotification('Failed to update task: ' + error.message, 'error');
    }
}

async function handleDeleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await apiCall(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        showNotification('Task deleted!', 'success');
        await loadTasks();
        
    } catch (error) {
        showNotification('Failed to delete task: ' + error.message, 'error');
    }
}

async function handleViewAllTasks() {
    try {
        const response = await apiCall('/tasks/admin/all');
        const tasks = response.tasks;
        
        if (tasks.length === 0) {
            alert('No tasks from all users.');
            return;
        }
        
        let message = 'All Tasks from All Users:\n\n';
        tasks.forEach((task, index) => {
            message += `${index + 1}. ${task.title} (Owner: ${task.owner?.name || 'Unknown'})\n`;
            message += `   ${task.description || 'No description'}\n`;
            message += `   ${task.completed ? '✅ Completed' : '⏳ Pending'}\n\n`;
        });
        
        alert(message);
        
    } catch (error) {
        showNotification('Failed to load all tasks: ' + error.message, 'error');
    }
}

// UI Functions
function showAuthSection() {
    elements.authSection.style.display = 'block';
    elements.tasksSection.style.display = 'none';
    elements.userInfo.style.display = 'none';
}

function showTasksSection() {
    elements.authSection.style.display = 'none';
    elements.tasksSection.style.display = 'block';
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

