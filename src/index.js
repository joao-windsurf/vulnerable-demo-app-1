import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aikido Demo App</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.7.1/css/bulma.min.css">
    </head>
    <body>
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <strong>Aikido Demo</strong>
          </a>
        </div>
        <div class="navbar-menu">
          <div class="navbar-end">
            <div class="navbar-item">
              <div class="buttons">
                <a class="button is-primary" href="/login">
                  <strong>Login</strong>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <section class="section">
        <div class="container">
          <h1 class="title">Welcome to Aikido Demo Application</h1>
          <p class="subtitle">A demonstration application for security testing</p>
          
          <div class="content">
            <h2>Features</h2>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/profile">User Profile</a></li>
              <li><a href="/settings">Settings</a></li>
            </ul>
          </div>

          <div class="box">
            <h3 class="title is-4">Sample Form</h3>
            <form id="sampleForm">
              <div class="field">
                <label class="label">Email</label>
                <div class="control">
                  <input class="input" type="email" name="email" placeholder="e.g. user@example.com">
                </div>
              </div>
              
              <div class="field">
                <label class="label">Name</label>
                <div class="control">
                  <input class="input" type="text" name="name" placeholder="Your name">
                </div>
              </div>
              
              <div class="field">
                <label class="label">Message</label>
                <div class="control">
                  <textarea class="textarea" name="message" placeholder="Your message"></textarea>
                </div>
              </div>
              
              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" name="subscribe">
                    Subscribe to newsletter
                  </label>
                </div>
              </div>
              
              <div class="field">
                <label class="label">Priority</label>
                <div class="control">
                  <div class="select">
                    <select name="priority">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="field">
                <div class="control">
                  <label class="radio">
                    <input type="radio" name="type" value="bug">
                    Bug Report
                  </label>
                  <label class="radio">
                    <input type="radio" name="type" value="feature">
                    Feature Request
                  </label>
                </div>
              </div>
              
              <div class="field is-grouped">
                <div class="control">
                  <button class="button is-link" type="submit">Submit</button>
                </div>
                <div class="control">
                  <button class="button is-light" type="reset">Reset</button>
                </div>
              </div>
            </form>
          </div>

          <div class="box">
            <h3 class="title is-4">Data Visualization</h3>
            <canvas id="myChart" width="400" height="200"></canvas>
          </div>
        </div>
      </section>

      <script src="https://cdn.jsdelivr.net/npm/chart.js@2.7.2/dist/Chart.min.js"></script>
      <script>
        const ctx = document.getElementById('myChart');
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
              datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            }
          });
        }

        document.getElementById('sampleForm').addEventListener('submit', function(e) {
          e.preventDefault();
          alert('Form submitted successfully!');
        });
      </script>
    </body>
    </html>
  `);
});

app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Aikido Demo</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.7.1/css/bulma.min.css">
    </head>
    <body>
      <section class="hero is-primary is-fullheight">
        <div class="hero-body">
          <div class="container">
            <div class="columns is-centered">
              <div class="column is-5-tablet is-4-desktop is-3-widescreen">
                <div class="box">
                  <h1 class="title">Login</h1>
                  <p class="subtitle">Sign in to your account</p>
                  <p>This is a mock login page for testing purposes.</p>
                  <br>
                  <a href="/" class="button is-primary is-fullwidth">Back to Home</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </body>
    </html>
  `);
});

app.get('/dashboard', (req, res) => {
  res.send('<h1>Dashboard</h1><p>Welcome to your dashboard</p><a href="/">Home</a>');
});

app.get('/profile', (req, res) => {
  res.send('<h1>User Profile</h1><p>Your profile information</p><a href="/">Home</a>');
});

app.get('/settings', (req, res) => {
  res.send('<h1>Settings</h1><p>Application settings</p><a href="/">Home</a>');
});

app.get('/authenticate', (req, res) => {
  res.json({ auth: 'mock-auth-token', channel_data: '{"user_id":"test-user"}' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
