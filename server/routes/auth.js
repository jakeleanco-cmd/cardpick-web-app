const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * JWT 토큰 생성 헬퍼
 * - 사용자 ID를 payload에 담아 7일 유효 토큰 생성
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * POST /api/auth/register
 * 회원가입
 * - 이메일 중복 체크 후, 비밀번호 해싱하여 저장
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }

    // 비밀번호 해싱 (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * POST /api/auth/login
 * 로그인
 * - 이메일로 사용자 찾고, 비밀번호 비교 후 JWT 발급
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.', error: error.message });
  }
});

/**
 * GET /api/auth/me
 * 현재 로그인된 사용자 정보 조회
 * - JWT 미들웨어를 통과한 요청만 접근 가능
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * PUT /api/auth/profile
 * 회원 정보 수정 (이름, 비밀번호)
 * - 현재 로그인된 사용자(authMiddleware)만 가능
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 이름 업데이트
    if (name) user.name = name;

    // 비밀번호 업데이트 (제공된 경우에만)
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({
      message: '회원 정보가 성공적으로 수정되었습니다.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '회원 정보 수정 중 오류가 발생했습니다.', error: error.message });
  }
});

module.exports = router;
