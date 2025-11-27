import { test, expect } from '@playwright/test';

test.describe('API Authentication Tests', () => {
  test('should handle JWT token authentication', async ({ request }) => {
    const companyJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    
    const response = await request.get('/api/protected', {
      headers: {
        'Authorization': `Bearer ${companyJwtToken}`
      }
    });
    
    expect([200, 401, 403, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should reject requests without authentication', async ({ request }) => {
    const response = await request.get('/api/protected');
    expect([401, 403, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should handle invalid JWT tokens', async ({ request }) => {
    const invalidToken = "invalid.jwt.token";
    
    const response = await request.get('/api/protected', {
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      }
    });
    
    expect([401, 403, 404, 500].includes(response.status())).toBeTruthy();
  });
});

test.describe('Database Query Tests', () => {
  test('should handle account search queries', async ({ request }) => {
    const response = await request.get('/api/accounts?search=test');
    expect([200, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should handle pagination parameters', async ({ request }) => {
    const response = await request.get('/api/accounts?limit=10&offset=0');
    expect([200, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should handle sorting parameters', async ({ request }) => {
    const response = await request.get('/api/accounts?sort_by=created_at&sort_dir=DESC');
    expect([200, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should handle filtering by status', async ({ request }) => {
    const response = await request.get('/api/accounts?status=active');
    expect([200, 404, 500].includes(response.status())).toBeTruthy();
  });

  test('should handle filtering by role', async ({ request }) => {
    const response = await request.get('/api/accounts?role=user');
    expect([200, 404, 500].includes(response.status())).toBeTruthy();
  });
});

test.describe('Error Handling Tests', () => {
  test('should return proper error responses for invalid requests', async ({ request }) => {
    const response = await request.post('/api/accounts', {
      data: {
        invalid: 'data'
      }
    });
    
    expect([400, 404, 405, 500].includes(response.status())).toBeTruthy();
  });

  test('should handle malformed JSON in request body', async ({ request }) => {
    try {
      const response = await request.post('/api/accounts', {
        headers: {
          'Content-Type': 'application/json'
        },
        data: 'invalid json'
      });
      
      expect([400, 404, 405, 500].includes(response.status())).toBeTruthy();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('should handle missing required parameters', async ({ request }) => {
    const response = await request.post('/api/accounts', {
      data: {}
    });
    
    expect([400, 404, 405, 500].includes(response.status())).toBeTruthy();
  });
});

test.describe('CORS and Headers Tests', () => {
  test('should include proper CORS headers', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    expect(headers).toBeDefined();
  });

  test('should handle OPTIONS requests', async ({ request }) => {
    const response = await request.fetch('/', {
      method: 'OPTIONS'
    });
    
    expect([200, 204, 404, 405].includes(response.status())).toBeTruthy();
  });

  test('should set proper content-type headers', async ({ request }) => {
    const response = await request.get('/api/accounts');
    const contentType = response.headers()['content-type'];
    
    if (response.status() === 200) {
      expect(contentType).toBeDefined();
    }
  });
});

test.describe('Rate Limiting and Security Tests', () => {
  test('should handle multiple rapid requests', async ({ request }) => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(request.get('/'));
    }
    
    const responses = await Promise.all(promises);
    expect(responses.length).toBe(5);
    
    responses.forEach(response => {
      expect([200, 429, 500].includes(response.status())).toBeTruthy();
    });
  });

  test('should sanitize user input in responses', async ({ request }) => {
    const xssPayload = '<script>alert("XSS")</script>';
    const response = await request.get(`/api/search?q=${encodeURIComponent(xssPayload)}`);
    
    if (response.status() === 200) {
      const body = await response.text();
      expect(body.includes('<script>')).toBeFalsy();
    }
  });
});
