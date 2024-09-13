import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, decoded) => {
      if (err) {
        console.log('Token verification failed:', err);
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      // 将解码后的 JWT 负载赋值给 req.user
      req.user = decoded as JwtPayload;
      console.log('Token decoded successfully:', req.user);

      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization token is required' });
  }
};
