import express from 'express';
import { authenticateJWT } from '../utils/authMiddleware';
import jwt, { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 获取当前用户的信息
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 当前用户信息
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateJWT, (req: any, res) => {
  try {
    // 断言 req 类型为 CustomRequest，确保能访问 user
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({
      username: (user as JwtPayload).username,  // 如果 user 是 JwtPayload，可以访问它的属性
      email: (user as JwtPayload).email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user information' });
  }
});

export default router;
