import request from 'supertest';
import { app } from '../index'; // 引用Express應用,從 index.ts 導入 app

describe('Movie API Endpoints', () => {
  it('should fetch all movies', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

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
      .send(newMovie);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('should fetch a single movie by ID', async () => {
    const movieId = 'your_test_movie_id'; // 使用有效的測試ID
    const res = await request(app).get(`/api/movies/${movieId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', movieId);
  });

  it('should update a movie by ID', async () => {
    const movieId = 'your_test_movie_id'; // 使用有效的測試ID
    const updatedMovie = {
      title: 'Updated Movie',
      year: 2022,
      genre: 'Drama',
      rating: 9.0,
      status: 'available'
    };
    const res = await request(app)
      .put(`/api/movies/${movieId}`)
      .send(updatedMovie);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Movie updated successfully');
  });

  it('should delete a movie by ID', async () => {
    const movieId = 'your_test_movie_id'; // 使用有效的測試ID
    const res = await request(app).delete(`/api/movies/${movieId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Movie deleted successfully');
  });
});
