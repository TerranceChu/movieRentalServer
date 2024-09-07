import { Router } from 'express';
import Joi from 'joi';
import { createApplication, getAllApplications } from '../services/applicationService';
import { authenticateJWT } from '../utils/authMiddleware';

const router = Router();

// 申請的驗證模式
const applicationSchema = Joi.object({
  applicantName: Joi.string().required(),
  applicantEmail: Joi.string().email().required(),
  description: Joi.string().required(),
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

export default router;
