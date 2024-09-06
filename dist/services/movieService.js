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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMoviePosterToMovie = exports.addMoviePosterPath = exports.deleteMovie = exports.updateMovie = exports.addMovie = exports.getMovieById = exports.getAllMovies = exports.setDatabase = void 0;
// src/services/movieService.ts
const mongodb_1 = require("mongodb");
// 設置一個全局變量來保存數據庫對象
let db;
// 這個函數允許在index.ts中設置數據庫連接
const setDatabase = (database) => {
    db = database;
};
exports.setDatabase = setDatabase;
// 獲取所有電影
const getAllMovies = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield db.collection('movies').find().toArray();
});
exports.getAllMovies = getAllMovies;
// 獲取單個電影根據ID
const getMovieById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const ObjectId = require('mongodb').ObjectId;
    return yield db.collection('movies').findOne({ _id: new ObjectId(id) });
});
exports.getMovieById = getMovieById;
// 添加新電影
const addMovie = (movie) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db.collection('movies').insertOne(movie);
});
exports.addMovie = addMovie;
// 更新電影信息
const updateMovie = (id, updatedMovie) => __awaiter(void 0, void 0, void 0, function* () {
    const ObjectId = require('mongodb').ObjectId;
    return yield db.collection('movies').updateOne({ _id: new ObjectId(id) }, { $set: updatedMovie });
});
exports.updateMovie = updateMovie;
// 刪除電影
const deleteMovie = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const ObjectId = require('mongodb').ObjectId;
    return yield db.collection('movies').deleteOne({ _id: new ObjectId(id) });
});
exports.deleteMovie = deleteMovie;
// 儲存圖片路徑到 MongoDB 的 "posters" 集合中
const addMoviePosterPath = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const poster = {
        posterPath: path,
        uploadedAt: new Date(),
    };
    return yield db.collection('posters').insertOne(poster);
});
exports.addMoviePosterPath = addMoviePosterPath;
// 更新電影資料中的 posterPath 字段，將上傳的圖片路徑與電影關聯
const addMoviePosterToMovie = (movieId, path) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield db.collection('movies').updateOne({ _id: new mongodb_1.ObjectId(movieId) }, // 查找指定ID的電影
    { $set: { posterPath: path } } // 更新圖片路徑
    );
    return result;
});
exports.addMoviePosterToMovie = addMoviePosterToMovie;
