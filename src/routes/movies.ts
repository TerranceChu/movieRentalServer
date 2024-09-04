import { Router } from 'express';
import { getAllMovies, getMovieById, addMovie, updateMovie, deleteMovie } from '../services/movieService';

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

// 獲取所有電影
router.get('/', async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// 根據ID獲取單個電影
router.get('/:id', async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// 添加新電影
router.post('/', async (req, res) => {
  try {
    const result = await addMovie(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

// 更新電影信息
router.put('/:id', async (req, res) => {
  try {
    const result = await updateMovie(req.params.id, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// 刪除電影
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteMovie(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

export default router;
