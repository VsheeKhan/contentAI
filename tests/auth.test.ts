// tests/auth.test.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { testApiHandler } from 'next-test-api-route-handler';
import type { NextApiHandler } from 'next';
import registerHandler from '../pages/api/register';
import loginHandler from '../pages/api/login';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth API - Register and Login', () => {
  const userData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };

  it('registers a user with valid data', async () => {
    await testApiHandler({
      handler: registerHandler as NextApiHandler, // Cast handler as NextApiHandler
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const json = await res.json();
        expect(res.status).toBe(201);
        expect(json).toHaveProperty('message', 'User registered successfully');
      },
    });
  });

  it('fails registration if email already exists', async () => {
    await testApiHandler({
      handler: registerHandler as NextApiHandler,
      test: async ({ fetch }) => {
        await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const json = await res.json();
        expect(res.status).toBe(409);
        expect(json).toHaveProperty('error', 'Email already in use');
      },
    });
  });

  it('logs in a registered user with valid credentials', async () => {
    await testApiHandler({
      handler: registerHandler as NextApiHandler,
      test: async ({ fetch }) => {
        await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      },
    });

    await testApiHandler({
      handler: loginHandler as NextApiHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email, password: userData.password }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json).toHaveProperty('message', 'Login successful');
      },
    });
  });

  it('rejects login with incorrect password', async () => {
    await testApiHandler({
      handler: registerHandler as NextApiHandler,
      test: async ({ fetch }) => {
        await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      },
    });

    await testApiHandler({
      handler: loginHandler as NextApiHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email, password: 'wrongpassword' }),
        });
        const json = await res.json();
        expect(res.status).toBe(401);
        expect(json).toHaveProperty('error', 'Invalid credentials');
      },
    });
  });
});
