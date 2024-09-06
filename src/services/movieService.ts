// src/services/movieService.ts
import { Db, ObjectId } from 'mongodb';

// 設置一個全局變量來保存數據庫對象
let db: Db;

// 這個函數允許在index.ts中設置數據庫連接
export const setDatabase = (database: Db) => {
  db = database;
};

// 獲取所有電影
export const getAllMovies = async () => {
  return await db.collection('movies').find().toArray();
};

// 獲取單個電影根據ID
export const getMovieById = async (id: string) => {
  const ObjectId = require('mongodb').ObjectId;
  return await db.collection('movies').findOne({ _id: new ObjectId(id) });
};

// 添加新電影
export const addMovie = async (movie: any) => {
  return await db.collection('movies').insertOne(movie);
};

// 更新電影信息
export const updateMovie = async (id: string, updatedMovie: any) => {
  const ObjectId = require('mongodb').ObjectId;
  return await db.collection('movies').updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedMovie }
  );
};

// 刪除電影
export const deleteMovie = async (id: string) => {
  const ObjectId = require('mongodb').ObjectId;
  return await db.collection('movies').deleteOne({ _id: new ObjectId(id) });
};

// 將圖片路徑添加到指定電影中
export const addMoviePosterPath = async (movieId: string, path: string) => {
  const result = await db.collection('movies').updateOne(
    { _id: new ObjectId(movieId) }, // 根據電影ID進行查找
    { $set: { posterPath: path } }  // 更新圖片路徑
  );
  return result;
};
