import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Rental API',          // 项目名称
      version: '1.0.0',                   // 版本号
      description: 'API for managing movies, user authentication, and application processes.',  // 项目描述
      contact: {
        name: 'API Support',              // 联系人名称
        url: 'http://www.example.com',    // 网站
        email: 'support@example.com',     // 联系邮件
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',     // API服务器地址
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {                     // 使用Bearer Auth进行JWT认证
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],                   // 将Bearer Auth应用于所有受保护的路由
      },
    ],
  },
  apis: ['./src/routes/*.ts'],            // API路由文件路径，自动生成文档
};

const swaggerSpec = swaggerJsdoc(options);

// 初始化并配置Swagger文档
export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 提供API文档的JSON格式
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
