import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../utils/authMiddleware';
import {
    getChatById,
  createChat,         // 确保导入 createChat
  getPendingChats,     // 确保导入 getPendingChats
  acceptChat,          // 确保导入 acceptChat
  addMessageToChat     // 确保导入 addMessageToChat
} from '../services/chatService';  // 从 chatService.ts 文件中导入

const router = Router();

// 用户发起聊天
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

// 获取所有待处理的聊天（管理员）
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

// 管理员承接聊天
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

// 用户或管理员发送消息
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

// 获取指定聊天的详细信息
router.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const chat = await getChatById(req.params.id);
      res.status(200).json(chat);
    } catch (error) {
      res.status(404).json({ error: 'Chat not found' });
    }
  });

export default router;
