// __tests__/api/auth/register.test.ts
import request from 'supertest';
const app = 'http://localhost:3000';

describe('POST /api/register', () => {
  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'NewUserPassword123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: 'Test User',
        password: 'TestPassword123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'All fields are required');
  });
});
