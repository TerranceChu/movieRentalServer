import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

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

const swaggerSpec = swaggerJsdoc(options);

// 设置Swagger中间件
export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
