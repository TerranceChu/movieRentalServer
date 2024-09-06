"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Movie Rental API', // API的名称
            version: '1.0.0', // 版本号
            description: 'A simple Movie Rental API', // 描述信息
        },
        servers: [
            {
                url: 'http://localhost:3000', // 本地服务器地址
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // 指定包含Swagger注释的文件路径
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
// 设置Swagger中间件
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;
