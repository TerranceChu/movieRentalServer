"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const movieService_1 = require("./services/movieService");
const movies_1 = __importDefault(require("./routes/movies"));
const swagger_1 = require("./utils/swagger");
const auth_1 = __importDefault(require("./routes/auth"));
// 加載環境變量
dotenv_1.default.config();
// 創建Express應用
const app = (0, express_1.default)();
exports.app = app;
// 使用CORS中間件以允許跨域請求
app.use((0, cors_1.default)());
// 使用body-parser中間件來解析JSON請求體
app.use(body_parser_1.default.json());
// 設置端口號，從環境變量中讀取
const port = process.env.PORT || 3000;
// 全局變量來存儲數據庫連接
let db;
// 從環境變量中獲取MongoDB Atlas的連接字符串
const mongoUri = process.env.MONGODB_URI || '';
// 連接到MongoDB Atlas
mongodb_1.MongoClient.connect(mongoUri)
    .then(client => {
    // 連接成功後，選擇一個數據庫來使用
    const db = client.db('movieRental'); // 這裡的 'movieRental' 是數據庫名稱，你可以根據需要修改
    (0, movieService_1.setDatabase)(db); // 設置數據庫對象到服務層
    app.locals.db = db; // 将 db 存储在 app.locals 中
    console.log('Connected to Database');
})
    .catch(error => console.error('Failed to connect to the database', error));
// 使用 '/api/movies' 路由
app.use('/api/movies', movies_1.default);
// 註冊路由
app.use('/api/auth', auth_1.default);
// 設置基本的測試路由
app.get('/', (req, res) => {
    res.send('Welcome to the Movie Rental API');
});
// 初始化Swagger文档
(0, swagger_1.setupSwagger)(app);
// 只有在非測試環境下才啟動伺服器
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
        console.log(`Swagger API docs available at http://localhost:${port}/api-docs`);
    });
}
