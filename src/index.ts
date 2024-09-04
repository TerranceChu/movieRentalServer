import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { MongoClient } from 'mongodb';
import { setDatabase } from './services/movieService';

import moviesRouter from './routes/movies';

// 加載環境變量
dotenv.config();

// 創建Express應用
const app = express();

// 使用CORS中間件以允許跨域請求
app.use(cors());

// 使用body-parser中間件來解析JSON請求體
app.use(bodyParser.json());

// 設置端口號，從環境變量中讀取
const port = process.env.PORT || 3000;

// 全局變量來存儲數據庫連接
let db: any;

// 從環境變量中獲取MongoDB Atlas的連接字符串
const mongoUri = process.env.MONGODB_URI || '';

// 連接到MongoDB Atlas
MongoClient.connect(mongoUri)
  .then(client => {
    // 連接成功後，選擇一個數據庫來使用
    const db = client.db('movieRental');  // 這裡的 'movieRental' 是數據庫名稱，你可以根據需要修改
    setDatabase(db); // 設置數據庫對象到服務層
    app.locals.db = db;  // 将 db 存储在 app.locals 中
    console.log('Connected to Database');
  })
  .catch(error => console.error('Failed to connect to the database', error));

// 使用 '/api/movies' 路由
app.use('/api/movies', moviesRouter);

// 設置基本的測試路由
app.get('/', (req, res) => {
  res.send('Welcome to the Movie Rental API');
});

// 啟動服務器並監聽指定端口
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
