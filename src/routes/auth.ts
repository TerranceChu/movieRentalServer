import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API for user authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username and password are required
 *       500:
 *         description: Error registering user
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Username and password are required
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Error logging in
 */
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

    // 获取用户角色 (假设用户文档中有 role 字段)
    const userRole = user.role || 'user'; // 默认角色为普通用户

    // 生成JWT，包含用户ID、用户名和角色
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: userRole },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router;
