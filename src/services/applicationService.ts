import { Db, ObjectId } from 'mongodb';

let db: Db;

// 設置數據庫連接
export const setDatabase = (database: Db) => {
  db = database;
};

// 創建新申請
export const createApplication = async (application: any) => {
  try {
    const result = await db.collection('applications').insertOne({
      ...application,
      status: 'new', // 默認狀態為 new
      createdAt: new Date(),
      userId: application.userId
    });
    return result;
  } catch (error) {
    console.error('Failed to create application:', error);
    throw new Error('Failed to create application');
  }
};

// 獲取所有申請
export const getAllApplications = async (filter = {}) => {
  try {
    const applications = await db.collection('applications').find(filter).toArray();
    return applications;
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    throw new Error('Failed to fetch applications');
  }
};

// 根据用户邮箱获取申请
export const getApplicationsByEmail = async (email: string) => {
  try {
    const applications = await db.collection('applications').find({ applicantEmail: email }).toArray();
    return applications;
  } catch (error) {
    console.error('Failed to fetch applications by email:', error);
    throw new Error('Failed to fetch applications');
  }
};

// 更新申請狀態
export const updateApplicationStatus = async (id: string, status: string) => {
  try {
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );
    if (result.matchedCount === 0) {
      return null;
    }
    return result;
  } catch (error) {
    console.error(`Failed to update application status for ID ${id}:`, error);
    throw new Error('Failed to update application status');
  }
};

// 更新申請圖片
export const updateApplicationWithImage = async (id: string, imagePath: string) => {
  try {
    const result = await db.collection('applications').updateOne(
      { _id: new ObjectId(id) },
      { $set: { imagePath } }
    );
    if (result.matchedCount === 0) {
      return null;
    }
    return result;
  } catch (error) {
    console.error(`Failed to update application with image for ID ${id}:`, error);
    throw new Error('Failed to update application with image');
  }
};

// 獲取單個申請
// 根据 userId 获取申请
export const getApplicationsByUserId = async (userId: string) => {
  try {
    const applications = await db.collection('applications').find({ userId }).toArray();
    return applications;
  } catch (error) {
    console.error('Failed to fetch applications by userId:', error);
    throw new Error('Failed to fetch applications by userId');
  }
};

