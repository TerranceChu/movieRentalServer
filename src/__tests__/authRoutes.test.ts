import request from 'supertest';
import { app } from '../index'; // 引入 Express 应用
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient;
let server: any;

beforeAll(async () => {
  client = await MongoClient.connect(process.env.MONGODB_URI || '', {});
  const db = client.db('movieRental');
  app.locals.db = db;

  server = app.listen(4000); // 使用测试专用端口
});

afterAll(async () => {
  await client.close();
  server.close();
});

describe('User Authentication API Endpoints', () => {

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser2', password: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('userId');
  });

  it('should not register a user with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser2' }); // Missing password

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Username and password are required');
  });

  it('should login a user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser2', password: 'password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser2', password: 'wrongpassword' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
