import request from 'supertest';
import { app } from '../index';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient;
let token: string;
let movieId: string;
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

  server = app.listen(4001);
});

afterAll(async () => {
  await client.close();
  server.close();
});

describe('Movie API Endpoints', () => {

  it('should add a new movie', async () => {
    const newMovie = {
      title: 'Test Movie',
      year: 2021,
      genre: 'Action',
      rating: 8.5,
      status: 'available'
    };

    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${token}`)
      .send(newMovie);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('insertedId');
    movieId = res.body.insertedId;
  });

  it('should not add a movie without authorization', async () => {
    const newMovie = {
      title: 'Unauthorized Movie',
      year: 2022,
      genre: 'Comedy',
      rating: 7.5,
      status: 'available'
    };

    const res = await request(app)
      .post('/api/movies')
      .send(newMovie);

    expect(res.statusCode).toEqual(401);
  });

  it('should fetch a movie by ID', async () => {
    const res = await request(app)
      .get(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', movieId);
  });

  it('should update a movie', async () => {
    const updatedMovie = {
      title: 'Updated Test Movie',
      year: 2021,
      genre: 'Action',
      rating: 9.0,
      status: 'available'
    };

    const res = await request(app)
      .put(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedMovie);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Movie updated successfully');
  });

  it('should delete a movie', async () => {
    const res = await request(app)
      .delete(`/api/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Movie deleted successfully');
  });
});
