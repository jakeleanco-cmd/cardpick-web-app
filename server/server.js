const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 환경변수 로드
dotenv.config();

// Express 앱 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
connectDB();

// API 라우트 등록
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/usages', require('./routes/usages'));

// 헬스체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
});

// 서버 시작 (Vercel 환경이 아닐 때만 listen)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 CardPick 서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

// Vercel Serverless Function을 위해 app 반환
module.exports = app;
