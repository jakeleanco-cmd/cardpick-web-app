const mongoose = require('mongoose');

/**
 * 사용자(User) 스키마
 * - 이메일 기반 회원가입/로그인을 위한 모델
 * - 비밀번호는 라우트에서 bcrypt로 해싱 후 저장
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일은 필수입니다.'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다.'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.'],
  },
  name: {
    type: String,
    required: [true, '이름은 필수입니다.'],
    trim: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
});

module.exports = mongoose.model('User', userSchema);
