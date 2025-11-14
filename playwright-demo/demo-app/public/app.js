let currentUser = null;
let currentToken = null;

const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskForm = document.getElementById('add-task-form');
const newTaskForm = document.getElementById('new-task-form');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const tasksList = document.getElementById('tasks-list');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            currentToken = data.token;
            showDashboard();
        } else {
            loginError.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        loginError.textContent = 'An error occurred. Please try again.';
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    currentToken = null;
    loginPage.classList.add('active');
    dashboardPage.classList.remove('active');
    loginForm.reset();
    loginError.textContent = '';
});

addTaskBtn.addEventListener('click', () => {
    addTaskForm.style.display = 'block';
    document.getElementById('task-title').focus();
});

cancelTaskBtn.addEventListener('click', () => {
    addTaskForm.style.display = 'none';
    newTaskForm.reset();
});

newTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value;
    
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, userId: currentUser.id })
        });
        
        if (response.ok) {
            addTaskForm.style.display = 'none';
            newTaskForm.reset();
            loadTasks();
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

async function showDashboard() {
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');
    userInfo.textContent = `Welcome, ${currentUser.username} (${currentUser.role})`;
    loadTasks();
}

async function loadTasks() {
    try {
        const response = await fetch('/api/todos');
        const todos = await response.json();
        
        const userTodos = todos.filter(t => t.userId === currentUser.id);
        
        updateStats(userTodos);
        renderTasks(userTodos);
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksList.innerHTML = '<p class="error-message">Failed to load tasks</p>';
    }
}

function updateStats(todos) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
}

function renderTasks(todos) {
    if (todos.length === 0) {
        tasksList.innerHTML = '<p class="loading">No tasks yet. Add your first task!</p>';
        return;
    }
    
    tasksList.innerHTML = todos.map(todo => `
        <div class="task-item ${todo.completed ? 'completed' : ''}" data-task-id="${todo.id}">
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTask(${todo.id}, this.checked)">
                <span class="task-title">${escapeHtml(todo.title)}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-danger" onclick="deleteTask(${todo.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
