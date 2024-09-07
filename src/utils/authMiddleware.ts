import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      if ('user' in req) {
        req.user = user; // 確認 user 屬性存在並賦值
      } else {
        console.error('user property does not exist on Request object');
      }
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization token is required' });
  }
};
