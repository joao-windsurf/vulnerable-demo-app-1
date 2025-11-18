import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aikido Demo App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
        }
        .feature {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #007bff;
        }
        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
        button:hover {
          background: #0056b3;
        }
        #status {
          margin-top: 20px;
          padding: 10px;
          background: #e9ecef;
          border-radius: 4px;
        }
        .login-form {
          margin: 20px 0;
        }
        input {
          padding: 8px;
          margin: 5px 0;
          width: 100%;
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Aikido Demo Application</h1>
        <p>Welcome to the Aikido security demonstration application.</p>
        
        <div class="feature">
          <h2>Authentication</h2>
          <div class="login-form">
            <input type="text" id="username" placeholder="Username" value="testuser">
            <input type="password" id="password" placeholder="Password" value="password123">
            <button onclick="login()">Login</button>
            <button onclick="logout()">Logout</button>
          </div>
        </div>
        
        <div class="feature">
          <h2>API Features</h2>
          <button onclick="fetchData()">Fetch Data</button>
          <button onclick="testAuth0()">Test Auth0</button>
          <button onclick="testSentry()">Test Sentry</button>
          <button onclick="testPusher()">Test Pusher</button>
        </div>
        
        <div id="status">
          <strong>Status:</strong> <span id="statusText">Ready</span>
        </div>
      </div>
      
      <script>
        function updateStatus(message) {
          document.getElementById('statusText').textContent = message;
        }
        
        async function login() {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            updateStatus(data.message || 'Login successful');
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
          } catch (error) {
            updateStatus('Login failed: ' + error.message);
          }
        }
        
        function logout() {
          localStorage.removeItem('token');
          updateStatus('Logged out successfully');
        }
        
        async function fetchData() {
          try {
            const response = await fetch('/api/data');
            const data = await response.json();
            updateStatus('Data fetched: ' + JSON.stringify(data));
          } catch (error) {
            updateStatus('Fetch failed: ' + error.message);
          }
        }
        
        async function testAuth0() {
          updateStatus('Auth0 integration tested');
        }
        
        async function testSentry() {
          try {
            const response = await fetch('/api/sentry-test');
            const data = await response.json();
            updateStatus('Sentry test: ' + JSON.stringify(data));
          } catch (error) {
            updateStatus('Sentry test failed: ' + error.message);
          }
        }
        
        async function testPusher() {
          try {
            const response = await fetch('/api/pusher-test');
            const data = await response.json();
            updateStatus('Pusher test: ' + JSON.stringify(data));
          } catch (error) {
            updateStatus('Pusher test failed: ' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username && password) {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: { username, role: 'user' }
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Username and password required' 
    });
  }
});

app.get('/api/data', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Item 1', description: 'First item' },
      { id: 2, name: 'Item 2', description: 'Second item' },
      { id: 3, name: 'Item 3', description: 'Third item' }
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/sentry-test', (req, res) => {
  res.json({ 
    message: 'Sentry integration is configured',
    dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0'
  });
});

app.get('/api/pusher-test', (req, res) => {
  res.json({ 
    message: 'Pusher integration is configured',
    key: 'edfjk5ffe67926a756t9'
  });
});

app.post('/authenticate', (req, res) => {
  res.json({
    auth: 'mock-auth-token',
    channel_data: JSON.stringify({ user_id: 'test-user' })
  });
});

app.get('/api/accounts', (req, res) => {
  const { search, status, role } = req.query;
  res.json({
    accounts: [
      { id: 1, email: 'user1@example.com', status: 'active', role: 'user' },
      { id: 2, email: 'user2@example.com', status: 'active', role: 'admin' },
      { id: 3, email: 'user3@example.com', status: 'inactive', role: 'user' }
    ].filter(account => {
      if (search && !account.email.includes(search)) return false;
      if (status && account.status !== status) return false;
      if (role && account.role !== role) return false;
      return true;
    })
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
