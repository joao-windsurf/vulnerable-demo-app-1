const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let users = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', email: 'user@example.com', role: 'user' }
];

let todos = [
  { id: 1, userId: 1, title: 'Complete project documentation', completed: false },
  { id: 2, userId: 1, title: 'Review pull requests', completed: true },
  { id: 3, userId: 2, title: 'Write unit tests', completed: false }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({ 
      success: true, 
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token: `token_${user.id}_${Date.now()}`
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { title, userId } = req.body;
  const newTodo = {
    id: todos.length + 1,
    userId: userId || 1,
    title,
    completed: false
  };
  todos.push(newTodo);
  res.json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const todo = todos.find(t => t.id === parseInt(id));
  
  if (todo) {
    todo.completed = completed;
    res.json(todo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === parseInt(id));
  
  if (index !== -1) {
    todos.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.get('/api/users', (req, res) => {
  res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role })));
});

app.listen(PORT, () => {
  console.log(`Demo app running at http://localhost:${PORT}`);
});
