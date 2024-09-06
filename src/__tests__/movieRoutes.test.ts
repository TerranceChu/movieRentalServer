import request from 'supertest';
import { app } from '../index'; // 引入 Express 應用
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import dotenv from 'dotenv';

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

describe('Movie API - Upload and associate poster with movie', () => {
  let movieIdForPoster: string;

  beforeAll(async () => {
    // 在測試開始時創建一部電影
    const newMovie = {
      title: 'Test Movie for Poster',
      year: 2021,
      genre: 'Action',
      rating: 8.5,
      status: 'available'
    };
    const res = await request(app)
      .post('/api/movies')
      .send(newMovie);
    
    movieIdForPoster = res.body.insertedId;  // 保存電影的ID供後續測試使用
  });

  it('should upload a poster and associate it with the movie', async () => {
    const res = await request(app)
      .post(`/api/movies/${movieIdForPoster}/upload`)
      .attach('poster', path.resolve(__dirname, 'sample-image.jpg'));  // 本地樣本圖片

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Poster uploaded successfully');
    expect(res.body).toHaveProperty('path');

    // 檢查數據庫是否更新了電影的圖片路徑
    const movie = await app.locals.db.collection('movies').findOne({ _id: new ObjectId(movieIdForPoster) });
    expect(movie).toHaveProperty('posterPath', res.body.path);
  });

  afterAll(async () => {
    // 測試結束後刪除電影
    await app.locals.db.collection('movies').deleteOne({ _id: new ObjectId(movieIdForPoster) });
  });
});
