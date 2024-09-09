import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { MongoClient } from 'mongodb';
import { setDatabase } from './services/applicationService'; // 將應用服務設置到數據庫中
import { setDatabase as setMovieDatabase } from './services/movieService'; // 如果需要同時設置電影服務

import applicationsRouter from './routes/applications'; // 申請的路由
import moviesRouter from './routes/movies'; // 如果已經有電影的路由
import authRouter from './routes/auth'; // 授權路由
import userRouter from './routes/user';

import { setupSwagger } from './utils/swagger'; // Swagger文檔設置

// 加載環境變量
dotenv.config();

// 創建Express應用
const app = express();

// 使用CORS中間件來允許跨域請求
app.use(cors());

// 使用body-parser中間件來解析JSON請求體
app.use(bodyParser.json());

// 設置端口號，從環境變量中讀取
const port = process.env.PORT || 3000;

// 從環境變量中獲取MongoDB Atlas的連接字符串
const mongoUri = process.env.MONGODB_URI || '';

// 連接到MongoDB Atlas
MongoClient.connect(mongoUri)
  .then(client => {
    // 連接成功後，選擇一個數據庫來使用
    const db = client.db('movieRental'); // 這裡的 'movieRental' 是數據庫名稱，你可以根據需要修改
    setDatabase(db); // 設置數據庫對象到應用服務層
    setMovieDatabase(db); // 如果電影服務需要，也設置數據庫對象
    app.locals.db = db; // 将 db 存储在 app.locals 中，供其他模塊使用
    console.log('Connected to Database');
  })
  .catch(error => console.error('Failed to connect to the database', error));

// 設置應用的路由
app.use('/api/applications', applicationsRouter); // 申請相關的API路由
app.use('/api/movies', moviesRouter); // 電影相關的API路由，如果需要
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter); // 授權相關的API路由

// 初始化Swagger文檔
setupSwagger(app);

// 基本測試路由
app.get('/', (req, res) => {
  res.send('Welcome to the Movie Rental API');
});

// 啟動服務器，僅在非測試環境下
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger API docs available at http://localhost:${port}/api-docs`);
  });
}

export { app };
