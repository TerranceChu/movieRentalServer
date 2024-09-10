import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { 
  createApplication, 
  getAllApplications, 
  getApplicationsByUserId, 
  updateApplicationStatus, 
  updateApplicationWithImage 
} from '../services/applicationService';
import { authenticateJWT } from '../utils/authMiddleware';
import upload from '../utils/upload'; // 引入文件上传工具

const router = Router();

// 申请的验证模式
const applicationSchema = Joi.object({
  applicantName: Joi.string().required(),
  applicantEmail: Joi.string().email().required(),
  description: Joi.string().required(),
});

// 申请状态的验证模式
const statusSchema = Joi.object({
  status: Joi.string().valid('new', 'pending', 'accepted', 'rejected').required(),
});

// POST 路由: 创建新申请
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  const { error } = applicationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // 使用类型断言以确保 userId 是从 JWT 中提取出来的
    const user = (req as any).user;
    const applicationData = {
      ...req.body,
      userId: user.userId, // 从 JWT 中提取的 userId
    };

    const result = await createApplication(applicationData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// GET 路由: 获取所有申请
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const applications = await getAllApplications();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET 路由: 获取当前登录用户的所有申请
router.get('/user', authenticateJWT, async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user || !user.userId) {
    return res.status(400).json({ error: 'User ID not found in token' });
  }

  try {
    const applications = await getApplicationsByUserId(user.userId);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user applications' });
  }
});

// PUT 路由: 更新申请状态
router.put('/:id/status', authenticateJWT, async (req: Request, res: Response) => {
  const { error } = statusSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const updatedApplication = await updateApplicationStatus(req.params.id, req.body.status);
    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// POST 路由: 上传申请图片
router.post('/:id/upload', authenticateJWT, upload.single('image'), async (req: Request, res: Response) => {
  const applicationId = req.params.id;
  
  // 类型断言 req.file 为 Express.Multer.File 类型
  const file = req.file as Express.Multer.File;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const updatedApplication = await updateApplicationWithImage(applicationId, file.path);
    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(200).json({ message: 'Image uploaded successfully', path: file.path });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image', details: error });
  }
});

export default router;
