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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index"); // 引入 Express 應用
const mongodb_1 = require("mongodb");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let client;
let movieId;
let server; // 用於存儲伺服器實例
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // 建立 MongoDB Atlas 的連接
    client = yield mongodb_1.MongoClient.connect(process.env.MONGODB_URI || '', {});
    const db = client.db('movieRental');
    index_1.app.locals.db = db;
    // 啟動伺服器
    server = index_1.app.listen(4000); // 使用測試專用端口
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield client.close(); // 測試結束後關閉數據庫連接
    server.close(); // 測試結束後關閉伺服器
}));
describe('Movie API Endpoints', () => {
    it('should add a new movie', () => __awaiter(void 0, void 0, void 0, function* () {
        const newMovie = {
            title: 'Test Movie',
            year: 2021,
            genre: 'Action',
            rating: 8.5,
            status: 'available'
        };
        const res = yield (0, supertest_1.default)(index_1.app)
            .post('/api/movies')
            .send(newMovie);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('insertedId'); // 確認是否有 insertedId
        movieId = res.body.insertedId; // 儲存 insertedId 以便後續測試使用
    }));
    it('should fetch the newly added movie by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).get(`/api/movies/${movieId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', new mongodb_1.ObjectId(movieId).toString()); // 確認 ID 一致性
    }));
    it('should update the movie by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedMovie = {
            title: 'Updated Movie',
            year: 2022,
            genre: 'Drama',
            rating: 9.0,
            status: 'available'
        };
        const res = yield (0, supertest_1.default)(index_1.app)
            .put(`/api/movies/${movieId}`)
            .send(updatedMovie);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Movie updated successfully');
    }));
    it('should delete the movie by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app).delete(`/api/movies/${movieId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Movie deleted successfully');
    }));
});
describe('Movie API - Upload and associate poster with movie', () => {
    let movieIdForPoster;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // 在測試開始時創建一部電影
        const newMovie = {
            title: 'Test Movie for Poster',
            year: 2021,
            genre: 'Action',
            rating: 8.5,
            status: 'available'
        };
        const res = yield (0, supertest_1.default)(index_1.app)
            .post('/api/movies')
            .send(newMovie);
        movieIdForPoster = res.body.insertedId; // 保存電影的ID供後續測試使用
    }));
    it('should upload a poster and associate it with the movie', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.app)
            .post(`/api/movies/${movieIdForPoster}/upload`)
            .attach('poster', path_1.default.resolve(__dirname, 'sample-image.jpg')); // 本地樣本圖片
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Poster uploaded successfully');
        expect(res.body).toHaveProperty('path');
        // 檢查數據庫是否更新了電影的圖片路徑
        const movie = yield index_1.app.locals.db.collection('movies').findOne({ _id: new mongodb_1.ObjectId(movieIdForPoster) });
        expect(movie).toHaveProperty('posterPath', res.body.path);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // 測試結束後刪除電影
        yield index_1.app.locals.db.collection('movies').deleteOne({ _id: new mongodb_1.ObjectId(movieIdForPoster) });
    }));
});
