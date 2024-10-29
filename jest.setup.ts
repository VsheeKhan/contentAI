// __tests__/setup/setupTestDB.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
const app = "http://localhost:3000";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await request(app)
    .post('/api/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
    });

  // Log in the user and store the token
  const loginResponse = await request(app)
    .post('/api/login')
    .send({
      email: 'test@example.com',
      password: 'TestPassword123',
    });
    global.authToken = loginResponse.body.token;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
