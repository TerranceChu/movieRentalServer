import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

import { MongoClient } from 'mongodb';
import { setDatabase } from './services/applicationService'; // 将应用服务设置到数据库中
import { setDatabase as setMovieDatabase } from './services/movieService'; // 如果需要同时设置电影服务
import { setDatabase as setChatDatabase, addMessageToChat } from './services/chatService'; // 导入 addMessageToChat


import applicationsRouter from './routes/applications'; // 申请的路由
import moviesRouter from './routes/movies'; // 如果已经有电影的路由
import authRouter from './routes/auth'; // 授权路由
import userRouter from './routes/user';
import chatRouter from './routes/chat'; // 引入聊天相关的路由

import { setupSwagger } from './utils/swagger'; // Swagger文档设置

// 引入 socket.io 和 http 模块
import { Server } from 'socket.io';
import http from 'http'; 

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 使用CORS中间件来允许跨域请求
app.use(cors());

// 使用body-parser中间件来解析JSON请求体
app.use(bodyParser.json());

// 设置端口号，从环境变量中读取
const port = process.env.PORT || 3000;

// 创建 http 服务器
const server = http.createServer(app);

// 初始化 socket.io 服务器并附加到 http 服务器上
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // 设置允许的前端 URL
    methods: ["GET", "POST"]
  }
});

// WebSocket 连接处理
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 监听用户加入聊天房间
  socket.on('joinChat', (chatId) => {
    socket.join(chatId); // 用户加入特定的聊天房间
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // 监听消息发送事件
  socket.on('sendMessage', async (data) => {
    const { chatId, message, sender } = data;
    
    // 将消息存储到 MongoDB 中
    try {
      await addMessageToChat(chatId, sender, message);
      
      // 广播消息到该聊天房间的所有用户
      io.to(chatId).emit('newMessage', { sender, message, timestamp: new Date() });
    } catch (error) {
      console.error('Error saving message to DB:', error);
    }
  });

  // 监听用户断开连接
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// 从环境变量中获取MongoDB Atlas的连接字符串
const mongoUri = process.env.MONGODB_URI || '';

// 连接到MongoDB Atlas
MongoClient.connect(mongoUri)
  .then(client => {
    // 连接成功后，选择一个数据库来使用
    const db = client.db('movieRental'); // 这里的 'movieRental' 是数据库名称，你可以根据需要修改
    setDatabase(db); // 设置数据库对象到应用服务层
    setMovieDatabase(db); // 如果电影服务需要，也设置数据库对象
    setChatDatabase(db);
    app.locals.db = db; // 将 db 存储在 app.locals 中，供其他模块使用
    console.log('Connected to Database');
  })
  .catch(error => console.error('Failed to connect to the database', error));

// 设置应用的路由
app.use('/api/applications', applicationsRouter); // 申请相关的API路由
app.use('/api/movies', moviesRouter); // 电影相关的API路由，如果需要
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter); // 授权相关的API路由
app.use('/api/chats', chatRouter); // 添加聊天功能的API路由
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 初始化Swagger文档
setupSwagger(app);

// 基本测试路由
app.get('/', (req, res) => {
  res.send('Welcome to the Movie Rental API');
});

// 启动服务器，仅在非测试环境下
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger API docs available at http://localhost:${port}/api-docs`);
  });
}

export { app };
