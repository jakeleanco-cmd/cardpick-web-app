const mongoose = require('mongoose');

/**
 * MongoDB Atlas 연결 함수
 * - Mongoose를 사용하여 MongoDB에 연결
 * - 연결 실패 시 프로세스 종료하여 빠른 장애 감지
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 연결 실패: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
