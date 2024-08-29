import { Router } from 'express';

const router = Router();

// 測試MongoDB連接，並從數據庫中獲取電影列表
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const movies = await db.collection('movies').find().toArray();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

export default router;
