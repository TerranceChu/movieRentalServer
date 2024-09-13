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

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: API for managing applications
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicantName
 *               - applicantEmail
 *               - description
 *             properties:
 *               applicantName:
 *                 type: string
 *               applicantEmail:
 *                 type: string
 *                 format: email
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 applicantName:
 *                   type: string
 *                 applicantEmail:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to create application
 */
router.post('/', authenticateJWT, async (req: Request, res: Response) => {
  const { error } = applicationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const user = (req as any).user;
    const applicationData = {
      ...req.body,
      userId: user.userId,
    };

    const result = await createApplication(applicationData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application' });
  }
});

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   applicantName:
 *                     type: string
 *                   applicantEmail:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [new, pending, accepted, rejected]
 *       500:
 *         description: Failed to fetch applications
 */
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const applications = await getAllApplications();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * @swagger
 * /api/applications/user:
 *   get:
 *     summary: Get all applications for the logged-in user
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   applicantName:
 *                     type: string
 *                   applicantEmail:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [new, pending, accepted, rejected]
 *       400:
 *         description: User ID not found in token
 *       500:
 *         description: Failed to fetch user applications
 */
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

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Update the status of an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, pending, accepted, rejected]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       404:
 *         description: Application not found
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to update application status
 */
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

/**
 * @swagger
 * /api/applications/{id}/upload:
 *   post:
 *     summary: Upload an image for an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to upload image
 */
router.post('/:id/upload', authenticateJWT, upload.single('image'), async (req: Request, res: Response) => {
  const applicationId = req.params.id;
  
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
