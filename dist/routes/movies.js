"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const movieService_1 = require("../services/movieService");
const joi_1 = __importDefault(require("joi"));
const upload_1 = __importDefault(require("../utils/upload"));
const movieService_2 = require("../services/movieService");
const authMiddleware_1 = require("../utils/authMiddleware");
const router = (0, express_1.Router)();
// 定义电影数据的验证规则
const movieSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    year: joi_1.default.number().integer().min(1888).required(),
    genre: joi_1.default.string().required(),
    rating: joi_1.default.number().min(0).max(10).required(),
    status: joi_1.default.string().valid('available', 'pending', 'offline').required()
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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movies = yield (0, movieService_1.getAllMovies)();
        res.json(movies);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
}));
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
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieId = req.params.id;
    if (!mongodb_1.ObjectId.isValid(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID format' });
    }
    try {
        const movie = yield (0, movieService_1.getMovieById)(movieId);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
}));
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
router.post('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = movieSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const result = yield (0, movieService_1.addMovie)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add movie' });
    }
}));
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
router.put('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieId = req.params.id;
    if (!mongodb_1.ObjectId.isValid(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID format' });
    }
    const { error } = movieSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const result = yield (0, movieService_1.updateMovie)(movieId, req.body);
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update movie' });
    }
}));
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
router.delete('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieId = req.params.id;
    if (!mongodb_1.ObjectId.isValid(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID format' });
    }
    try {
        const result = yield (0, movieService_1.deleteMovie)(movieId);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json({ message: 'Movie deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete movie' });
    }
}));
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
router.post('/:id/upload', authMiddleware_1.authenticateJWT, upload_1.default.single('poster'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieId = req.params.id;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = yield (0, movieService_2.addMoviePosterToMovie)(movieId, req.file.path);
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.status(200).json({ message: 'Poster uploaded successfully', path: req.file.path });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload poster' });
    }
}));
exports.default = router;
