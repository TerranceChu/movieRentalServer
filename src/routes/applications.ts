import { Router } from 'express';
import Joi from 'joi';
import { createApplication, getAllApplications, updateApplicationStatus, updateApplicationWithImage } from '../services/applicationService';
import { authenticateJWT } from '../utils/authMiddleware';
import upload from '../utils/upload'; // 引入文件上傳工具

const router = Router();

// 申請的驗證模式
const applicationSchema = Joi.object({
  applicantName: Joi.string().required(),
  applicantEmail: Joi.string().email().required(),
  description: Joi.string().required(),
});

// 申請狀態的驗證模式
const statusSchema = Joi.object({
  status: Joi.string().valid('new', 'pending', 'accepted', 'rejected').required(),
});

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
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateJWT, async (req, res) => {
  const { error } = applicationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const result = await createApplication(req.body);
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
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   applicantName:
 *                     type: string
 *                   applicantEmail:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const applications = await getAllApplications();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
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
 *         description: The application ID
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
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to update application status
 */
router.put('/:id/status', authenticateJWT, async (req, res) => {
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
 *     summary: Upload an image for the application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The application ID
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
 *         description: Invalid input
 *       404:
 *         description: Application not found
 *       500:
 *         description: Failed to upload image
 */
router.post('/:id/upload', authenticateJWT, upload.single('image'), async (req, res) => {
  const applicationId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const updatedApplication = await updateApplicationWithImage(applicationId, req.file.path);
    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.status(200).json({ message: 'Image uploaded successfully', path: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image', error });
  }
});

export default router;
