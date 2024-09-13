import express from 'express';
import { authenticateJWT } from '../utils/authMiddleware';
import jwt, { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户管理相关的 API
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 获取当前登录用户的信息
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: 返回当前用户的用户名和邮箱信息。该请求需要 JWT 认证。
 *     responses:
 *       200:
 *         description: 返回当前用户的信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: 用户名
 *                 email:
 *                   type: string
 *                   description: 用户邮箱
 *       401:
 *         description: 未授权，用户未登录或令牌无效
 *       500:
 *         description: 服务器错误
 */
router.get('/me', authenticateJWT, (req: any, res) => {
  try {
    
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({
      username: (user as JwtPayload).username,  
      email: (user as JwtPayload).email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user information' });
  }
});

export default router;
