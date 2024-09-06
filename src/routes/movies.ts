import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getAllMovies, getMovieById, addMovie, updateMovie, deleteMovie } from '../services/movieService';
import Joi from 'joi';
import upload from '../utils/upload';
import { addMoviePosterPath } from '../services/movieService';
import { addMoviePosterToMovie } from '../services/movieService';  
import { authenticateJWT } from '../utils/authMiddleware';

const router = Router();

// 定义电影数据的验证规则
const movieSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1888).required(),
  genre: Joi.string().required(),
  rating: Joi.number().min(0).max(10).required(),
  status: Joi.string().valid('available', 'pending', 'offline').required()
});

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: API for managing movies
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Retrieve a list of movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: A list of movies.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie data
 *       404:
 *         description: Movie not found
 */
router.get('/:id', async (req, res) => {
  const movieId = req.params.id;
  
  if (!ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID format' });
  }

  try {
    const movie = await getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Add a new movie
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - year
 *               - genre
 *               - rating
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: integer
 *               genre:
 *                 type: string
 *               rating:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, pending, offline]
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Invalid input data
 */
// 添加新電影的路由，僅允許已驗證的用戶訪問
router.post('/', authenticateJWT, async (req, res) => {
  const { error } = movieSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const result = await addMovie(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Update a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               year:
 *                 type: integer
 *               genre:
 *                 type: string
 *               rating:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, pending, offline]
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Invalid movie ID format or invalid data
 *       404:
 *         description: Movie not found
 */
// 更新電影的路由，僅允許已驗證的用戶訪問
router.put('/:id', authenticateJWT, async (req, res) => {
  const movieId = req.params.id;

  if (!ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID format' });
  }

  const { error } = movieSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const result = await updateMovie(movieId, req.body);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Delete a movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie ID
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       400:
 *         description: Invalid movie ID format
 *       404:
 *         description: Movie not found
 */
// 刪除電影路由，僅允許已驗證的用戶訪問
router.delete('/:id', authenticateJWT, async (req, res) => {
  const movieId = req.params.id;

  if (!ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID format' });
  }

  try {
    const result = await deleteMovie(movieId);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

/**
 * @swagger
 * /api/movies/{id}/upload:
 *   post:
 *     summary: Upload a movie poster and associate it with a movie
 *     tags: [Movies]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie ID
 *       - in: formData
 *         name: poster
 *         type: file
 *         description: The movie poster to upload
 *     responses:
 *       200:
 *         description: Poster uploaded successfully and associated with the movie
 */
// 上傳圖片的路由，僅允許已驗證的用戶訪問
router.post('/:id/upload', authenticateJWT, upload.single('poster'), async (req, res) => {
  const movieId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await addMoviePosterToMovie(movieId, req.file.path);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({ message: 'Poster uploaded successfully', path: req.file.path });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload poster' });
  }
});

export default router;
