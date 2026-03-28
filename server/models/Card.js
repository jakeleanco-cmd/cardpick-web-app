const mongoose = require('mongoose');

/**
 * 신용카드(Card) 스키마
 * - 사용자가 보유한 신용카드 정보를 저장
 * - isMinSpendingMet: 전월 실적 충족 여부 (false면 해당 카드 혜택 비활성화)
 * - color: 대시보드에서 카드를 구분하기 위한 UI 컬러
 */
const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, '카드 이름은 필수입니다.'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, '카드사는 필수입니다.'],
    trim: true,
  },
  annualFee: {
    type: Number,
    default: 0,
  },
  // 전월 실적 기준 금액 (원)
  minSpending: {
    type: Number,
    default: 0,
  },
  // 전월 실적 충족 여부 - 미달 시 모든 혜택 비활성화 표시
  isMinSpendingMet: {
    type: Boolean,
    default: true,
  },
  // UI에서 카드를 구분하기 위한 컬러코드 (예: "#6C5CE7")
  color: {
    type: String,
    default: '#6C5CE7',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Card', cardSchema);
