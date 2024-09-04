import request from 'supertest';
import { app } from '../index'; // 引入 server
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

let client: MongoClient;
let movieId: string;
let server: any; // 用於存儲伺服器實例

beforeAll(async () => {
  // 建立 MongoDB Atlas 的連接
  client = await MongoClient.connect(process.env.MONGODB_URI || '', {});
  const db = client.db('movieRental');
  app.locals.db = db;

  // 啟動伺服器
  server = app.listen(4000); // 使用測試專用端口
});

afterAll(async () => {
  await client.close(); // 測試結束後關閉數據庫連接
  server.close(); // 測試結束後關閉伺服器
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
      .send(newMovie);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('insertedId');  // 確認是否有 insertedId
    movieId = res.body.insertedId; // 儲存 insertedId 以便後續測試使用
  });

  it('should fetch the newly added movie by ID', async () => {
    const res = await request(app).get(`/api/movies/${movieId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', new ObjectId(movieId).toString());  // 確認 ID 一致性
  });

  it('should update the movie by ID', async () => {
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

  it('should delete the movie by ID', async () => {
    const res = await request(app).delete(`/api/movies/${movieId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Movie deleted successfully');
  });
});