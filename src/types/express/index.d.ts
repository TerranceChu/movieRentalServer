import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // 這裡你可以根據需求設置user的具體類型
    }
  }
}
