import request from 'supertest';
import { app } from '../index'; // 引入 Express 應用
import { MongoClient } from 'mongodb';
import path from 'path'; // 用於處理文件路徑

let db: any;
let token: string;
let applicationId: string;
let client: MongoClient;
let server: any;
let io: any;

beforeAll(async () => {
    client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    db = client.db('movieRentalTest');
    app.locals.db = db;
  
    // 使用隨機端口
    server = app.listen(0, () => console.log('Test server running on random port'));
    io = require('socket.io')(server);
  
    await request(app).post('/api/auth/register').send({
      username: 'testuser',
      password: 'testpassword',
      role: 'user',
    });
  
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
  
    token = loginRes.body.token;
  });
  
  afterAll(async () => {
    await db.dropDatabase();      // 刪除測試數據庫
    await client.close();         // 關閉 MongoClient 連接
    await new Promise((resolve) => io.close(resolve));  // 等待 WebSocket 連接關閉
    await new Promise((resolve) => server.close(resolve));  // 等待 HTTP 伺服器關閉
  });

describe('Applications API', () => {

  // 測試創建新申請
  it('should create a new application', async () => {
    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: 'John Doe',
        applicantEmail: 'john@example.com',
        description: 'This is a test application.',
      });
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('insertedId'); // 更改為檢查 insertedId
    applicationId = response.body.insertedId; // 保存 insertedId
  });

  // 測試創建申請時的驗證錯誤
  it('should return validation error if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        applicantName: '',
        applicantEmail: 'invalid-email',
        description: '',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // 測試獲取所有申請
  it('should get all applications', async () => {
    const response = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  // 測試獲取用戶自己的申請
  it('should get applications by the logged-in user', async () => {
    const response = await request(app)
      .get('/api/applications/user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0]).toHaveProperty('applicantName', 'John Doe');
  });

  // 測試更新申請狀態
  it('should update application status', async () => {
    expect(applicationId).toBeDefined(); // 檢查 applicationId 是否已定義
    const response = await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'accepted' });
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Application status updated successfully');
  });

  // 測試文件上傳
  it('should upload an image for an application', async () => {
    expect(applicationId).toBeDefined(); // 檢查 applicationId 是否已定義
    const response = await request(app)
      .post(`/api/applications/${applicationId}/upload`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, 'sample-image.jpg')); // 上傳測試圖像
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Image uploaded successfully');
    expect(response.body).toHaveProperty('path');
  });
});
