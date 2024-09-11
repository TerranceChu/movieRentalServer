import { Db, ObjectId } from 'mongodb';

let db: Db;

interface ChatDocument {
  _id: ObjectId;
  userId: string;
  adminId: string | null;
  messages: Array<{
    sender: string;
    message: string;
    timestamp: Date;
  }>;
  status: string;
  createdAt: Date;
}

// 设置数据库连接
export const setDatabase = (database: Db) => {
  db = database;
};

// 创建新聊天
export const createChat = async (userId: string, message: string) => {
  try {
    const result = await db.collection('chats').insertOne({
      userId,
      adminId: null, // 初始时没有管理员接手
      status: 'pending',
      messages: [{ sender: 'user', message, timestamp: new Date() }],
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error('Failed to create chat:', error);
    throw new Error('Failed to create chat');
  }
};

// 获取所有待处理的聊天
export const getPendingChats = async () => {
  try {
    const chats = await db.collection<ChatDocument>('chats').find({ status: 'pending' }).toArray();
    return chats;
  } catch (error) {
    console.error('Failed to fetch pending chats:', error);
    throw new Error('Failed to fetch pending chats');
  }
};

// 接受聊天 (管理员承接聊天)
export const acceptChat = async (chatId: string, adminId: string) => {
  try {
    const result = await db.collection<ChatDocument>('chats').updateOne(
      { _id: new ObjectId(chatId), status: 'pending' }, // 确保只处理未接手的聊天
      { $set: { status: 'accepted', adminId } } // 更新状态为 accepted，并记录管理员 ID
    );
    if (result.matchedCount === 0) {
      throw new Error('Chat not found or already accepted');
    }
    return result;
  } catch (error) {
    console.error('Failed to accept chat:', error);
    throw new Error('Failed to accept chat');
  }
};

// 添加消息到聊天
export const addMessageToChat = async (chatId: string, sender: string, message: string) => {
  try {
    const chatCollection = db.collection<ChatDocument>('chats');
    const result = await chatCollection.updateOne(
      { _id: new ObjectId(chatId) },
      {
        $push: {
          messages: {
            sender,
            message,
            timestamp: new Date(),
          },
        },
      }
    );
    if (result.matchedCount === 0) {
      throw new Error('Chat not found');
    }
    return result;
  } catch (error) {
    console.error('Failed to add message to chat:', error);
    throw new Error('Failed to add message to chat');
  }
};

// 获取指定聊天的详细信息
export const getChatById = async (chatId: string) => {
  try {
    const chat = await db.collection<ChatDocument>('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  } catch (error) {
    console.error(`Failed to fetch chat with ID ${chatId}:`, error);
    throw new Error('Failed to fetch chat');
  }
};

// 获取管理员已接受的聊天
export const getAcceptedChatsByAdmin = async (adminId: string) => {
  try {
    const chats = await db.collection<ChatDocument>('chats').find({ adminId, status: 'accepted' }).toArray();
    return chats;
  } catch (error) {
    console.error('Failed to fetch accepted chats for admin:', error);
    throw new Error('Failed to fetch accepted chats');
  }
};
