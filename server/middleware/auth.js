const jwt = require('jsonwebtoken');

/**
 * JWT 인증 미들웨어
 * - Authorization 헤더에서 Bearer 토큰을 추출하여 검증
 * - 검증 성공 시 req.user에 사용자 ID를 주입
 * - 인증 실패 시 401 에러 반환
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Bearer 토큰 형식 확인
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 검증된 사용자 ID를 req.user에 저장
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    // 토큰 만료 또는 유효하지 않은 토큰
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;
