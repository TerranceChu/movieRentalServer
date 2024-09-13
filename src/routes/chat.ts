import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../utils/authMiddleware';
import {
  getChatById,
  createChat, 
  getPendingChats,
  acceptChat,
  addMessageToChat
} from '../services/chatService';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API for managing chat functionality
 */

/**
 * @swagger
 * /api/chats/start:
 *   post:
 *     summary: Start a new chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatId:
 *                   type: string
 *       400:
 *         description: Message is required
 *       500:
 *         description: Failed to start chat
 */
router.post('/start', authenticateJWT, async (req: any, res: Response) => {
  const { message } = req.body;
  const userId = req.user?.userId;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await createChat(userId, message);
    res.status(201).json({ chatId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start chat' });
  }
});

/**
 * @swagger
 * /api/chats/pending:
 *   get:
 *     summary: Get all pending chats for employees
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of pending chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       403:
 *         description: Access denied (only employees can view pending chats)
 *       500:
 *         description: Failed to fetch chats
 */
router.get('/pending', authenticateJWT, async (req: any, res: Response) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const chats = await getPendingChats();
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

/**
 * @swagger
 * /api/chats/{id}/accept:
 *   post:
 *     summary: Accept a chat (for employees)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat accepted
 *       500:
 *         description: Failed to accept chat
 */
router.post('/:id/accept', authenticateJWT, async (req: any, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.userId;

  try {
    const result = await acceptChat(id, adminId);
    res.status(200).json({ message: 'Chat accepted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept chat' });
  }
});

/**
 * @swagger
 * /api/chats/{id}/message:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Message is required
 *       500:
 *         description: Failed to send message
 */
router.post('/:id/message', authenticateJWT, async (req: any, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const sender = req.user.role === 'employee' ? 'employee' : 'user';

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    await addMessageToChat(id, sender, message);
    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get chat details by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sender:
 *                         type: string
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Failed to fetch chat
 */
router.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const chat = await getChatById(req.params.id);
    res.status(200).json(chat);
  } catch (error) {
    res.status(404).json({ error: 'Chat not found' });
  }
});

export default router;
