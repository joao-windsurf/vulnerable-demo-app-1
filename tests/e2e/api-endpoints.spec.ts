import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeTruthy();
  });

  test('should login via API with valid credentials', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {
        username: 'testuser',
        password: 'password123'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login successful');
    expect(data.token).toBeTruthy();
    expect(data.user.username).toBe('testuser');
    expect(data.user.role).toBe('user');
  });

  test('should reject login without credentials', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe('Username and password required');
  });

  test('should fetch data from API', async ({ request }) => {
    const response = await request.get('/api/data');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.items).toHaveLength(3);
    expect(data.items[0].name).toBe('Item 1');
    expect(data.items[1].name).toBe('Item 2');
    expect(data.items[2].name).toBe('Item 3');
    expect(data.timestamp).toBeTruthy();
  });

  test('should return Sentry configuration', async ({ request }) => {
    const response = await request.get('/api/sentry-test');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.message).toBe('Sentry integration is configured');
    expect(data.dsn).toBe('https://examplePublicKey@o0.ingest.sentry.io/0');
  });

  test('should return Pusher configuration', async ({ request }) => {
    const response = await request.get('/api/pusher-test');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.message).toBe('Pusher integration is configured');
    expect(data.key).toBe('edfjk5ffe67926a756t9');
  });

  test('should handle Pusher authentication endpoint', async ({ request }) => {
    const response = await request.post('/authenticate', {
      data: {
        socket_id: 'test-socket-id',
        channel_name: 'test-channel'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.auth).toBe('mock-auth-token');
    expect(data.channel_data).toBeTruthy();
  });

  test('should filter accounts by search parameter', async ({ request }) => {
    const response = await request.get('/api/accounts?search=user1');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.accounts).toHaveLength(1);
    expect(data.accounts[0].email).toBe('user1@example.com');
  });

  test('should filter accounts by status', async ({ request }) => {
    const response = await request.get('/api/accounts?status=active');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.accounts.length).toBeGreaterThan(0);
    data.accounts.forEach((account: any) => {
      expect(account.status).toBe('active');
    });
  });

  test('should filter accounts by role', async ({ request }) => {
    const response = await request.get('/api/accounts?role=admin');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.accounts).toHaveLength(1);
    expect(data.accounts[0].role).toBe('admin');
  });

  test('should return 404 for unknown routes', async ({ request }) => {
    const response = await request.get('/api/unknown-endpoint');
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.error).toBe('Not found');
  });
});
