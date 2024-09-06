import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const router = express.Router();

// 註冊新用戶
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // 檢查用戶是否已存在
    const user = await req.app.locals.db.collection('users').findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 儲存用戶信息
    const result = await req.app.locals.db.collection('users').insertOne({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// 用戶登錄
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // 查找用戶
    const user = await req.app.locals.db.collection('users').findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 驗證密碼
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 生成JWT
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;
