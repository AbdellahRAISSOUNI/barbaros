import { NextResponse } from 'next/server';

/**
 * API endpoint to render a simple UI for testing the seeding functionality
 */
export async function GET() {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Database Seeding Test</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      button {
        padding: 10px 15px;
        margin: 10px;
        cursor: pointer;
      }
      pre {
        background-color: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
        overflow: auto;
        max-height: 400px;
      }
      .success { color: green; }
      .error { color: red; }
      .section {
        margin-top: 30px;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      input {
        padding: 8px;
        margin: 5px;
        width: 200px;
      }
    </style>
  </head>
  <body>
    <h1>Database Seeding Test</h1>
    
    <div class="section">
      <h2>Database Operations</h2>
      <button id="checkStatus">Check Database Status</button>
      <button id="seedDatabase">Seed Database</button>
      <button id="clearDatabase">Clear Database</button>
      <button id="testData">Test Data Retrieval</button>
    </div>
    
    <div class="section">
      <h2>Admin Login Test</h2>
      <p>Default admin: admin@barbaros.com / admin123</p>
      <div>
        <input type="email" id="email" placeholder="Email" value="admin@barbaros.com">
        <input type="password" id="password" placeholder="Password" value="admin123">
        <button id="testLogin">Test Login</button>
      </div>
    </div>
    
    <h2>Result:</h2>
    <pre id="result">Click a button to perform an action...</pre>
    
    <script>
      document.getElementById('checkStatus').addEventListener('click', async () => {
        const result = document.getElementById('result');
        result.innerHTML = 'Checking database status...';
        try {
          const response = await fetch('/api/db-status');
          const data = await response.json();
          result.innerHTML = JSON.stringify(data, null, 2);
          result.className = data.success ? 'success' : 'error';
        } catch (error) {
          result.innerHTML = 'Error: ' + error.message;
          result.className = 'error';
        }
      });
      
      document.getElementById('seedDatabase').addEventListener('click', async () => {
        const result = document.getElementById('result');
        result.innerHTML = 'Seeding database...';
        try {
          const response = await fetch('/api/seed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ force: true }),
          });
          const data = await response.json();
          result.innerHTML = JSON.stringify(data, null, 2);
          result.className = data.success ? 'success' : 'error';
        } catch (error) {
          result.innerHTML = 'Error: ' + error.message;
          result.className = 'error';
        }
      });
      
      document.getElementById('clearDatabase').addEventListener('click', async () => {
        const result = document.getElementById('result');
        result.innerHTML = 'Clearing database...';
        try {
          const response = await fetch('/api/seed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'clear', force: true }),
          });
          const data = await response.json();
          result.innerHTML = JSON.stringify(data, null, 2);
          result.className = data.success ? 'success' : 'error';
        } catch (error) {
          result.innerHTML = 'Error: ' + error.message;
          result.className = 'error';
        }
      });
      
      document.getElementById('testData').addEventListener('click', async () => {
        const result = document.getElementById('result');
        result.innerHTML = 'Testing data retrieval...';
        try {
          const response = await fetch('/api/test-db');
          const data = await response.json();
          result.innerHTML = JSON.stringify(data, null, 2);
          result.className = data.success ? 'success' : 'error';
        } catch (error) {
          result.innerHTML = 'Error: ' + error.message;
          result.className = 'error';
        }
      });
      
      document.getElementById('testLogin').addEventListener('click', async () => {
        const result = document.getElementById('result');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        result.innerHTML = 'Testing admin login...';
        try {
          const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          result.innerHTML = JSON.stringify(data, null, 2);
          result.className = data.success ? 'success' : 'error';
        } catch (error) {
          result.innerHTML = 'Error: ' + error.message;
          result.className = 'error';
        }
      });
    </script>
  </body>
  </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 