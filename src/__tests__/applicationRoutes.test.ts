import request from 'supertest';
import { app } from '../index';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient;
let token: string;
let applicationId: string;
let server: any;

beforeAll(async () => {
  client = await MongoClient.connect(process.env.MONGODB_URI || '', {});
  const db = client.db('movieRental');
  app.locals.db = db;

  // Register and login user
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'testuser', password: 'password123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser', password: 'password123' });

  token = res.body.token;

  server = app.listen(4002);
});

afterAll(async () => {
  await client.close();
  server.close();
});

describe('Application API Endpoints', () => {

  it('should create a new application', async () => {
    const newApplication = {
      applicantName: 'John Doe',
      applicantEmail: 'john@example.com',
      description: 'This is a test application'
    };

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(newApplication);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('insertedId');
    applicationId = res.body.insertedId;
  });

  it('should fetch all applications', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should update application status', async () => {
    const updatedStatus = { status: 'pending' };

    const res = await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedStatus);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Application status updated successfully');
  });

  it('should upload an image for the application', async () => {
    const res = await request(app)
      .post(`/api/applications/${applicationId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', 'src/__tests__/sample-image.jpg');  // Ensure this image exists

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Image uploaded successfully');
  });
});
