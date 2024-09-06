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
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
// 註冊新用戶
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        // 檢查用戶是否已存在
        const user = yield req.app.locals.db.collection('users').findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // 加密密碼
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // 儲存用戶信息
        const result = yield req.app.locals.db.collection('users').insertOne({
            username,
            password: hashedPassword,
        });
        res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
}));
// 用戶登錄
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        // 查找用戶
        const user = yield req.app.locals.db.collection('users').findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // 驗證密碼
        const validPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // 生成JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
}));
exports.default = router;
