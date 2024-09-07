import { Db, ObjectId } from 'mongodb';

// 設置一個全局變量來保存數據庫對象
let db: Db;

// 這個函數允許在index.ts中設置數據庫連接
export const setDatabase = (database: Db) => {
  db = database;
};

// 獲取所有電影
export const getAllMovies = async () => {
  try {
    const movies = await db.collection('movies').find().toArray();
    return movies;
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    throw new Error('Failed to fetch movies');
  }
};

// 獲取單個電影根據ID
export const getMovieById = async (id: string) => {
  try {
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(id) });
    if (!movie) {
      throw new Error('Movie not found');
    }
    return movie;
  } catch (error) {
    console.error(`Failed to fetch movie with ID ${id}:`, error);
    throw new Error('Failed to fetch movie');
  }
};

// 添加新電影
export const addMovie = async (movie: any) => {
  try {
    const result = await db.collection('movies').insertOne(movie);
    return result;
  } catch (error) {
    console.error('Failed to add new movie:', error);
    throw new Error('Failed to add movie');
  }
};

// 更新電影信息
export const updateMovie = async (id: string, updatedMovie: any) => {
  try {
    const result = await db.collection('movies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedMovie }
    );
    if (result.matchedCount === 0) {
      throw new Error('Movie not found');
    }
    return result;
  } catch (error) {
    console.error(`Failed to update movie with ID ${id}:`, error);
    throw new Error('Failed to update movie');
  }
};

// 刪除電影
export const deleteMovie = async (id: string) => {
  try {
    const result = await db.collection('movies').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new Error('Movie not found');
    }
    return result;
  } catch (error) {
    console.error(`Failed to delete movie with ID ${id}:`, error);
    throw new Error('Failed to delete movie');
  }
};

// 儲存圖片路徑到 MongoDB 的 "posters" 集合中
export const addMoviePosterPath = async (path: string) => {
  try {
    const poster = {
      posterPath: path,
      uploadedAt: new Date(),
    };
    const result = await db.collection('posters').insertOne(poster);
    return result;
  } catch (error) {
    console.error('Failed to add poster path:', error);
    throw new Error('Failed to add poster path');
  }
};

// 更新電影資料中的 posterPath 字段，將上傳的圖片路徑與電影關聯
export const addMoviePosterToMovie = async (movieId: string, path: string) => {
  try {
    const result = await db.collection('movies').updateOne(
      { _id: new ObjectId(movieId) },
      { $set: { posterPath: path } }
    );
    if (result.matchedCount === 0) {
      throw new Error('Movie not found');
    }
    return result;
  } catch (error) {
    console.error(`Failed to associate poster with movie ID ${movieId}:`, error);
    throw new Error('Failed to associate poster with movie');
  }
};
