const mongoose = require('mongoose');

/**
 * 혜택 사용 기록(BenefitUsage) 스키마
 * - 실제로 혜택을 받은 내역을 기록
 * - amount: 실제 결제 금액
 * - benefitAmount: 혜택(할인/캐시백) 금액 — 이 값이 월 한도에서 차감됨
 * - date: 사용 날짜 (월별 필터링에 사용)
 */
const benefitUsageSchema = new mongoose.Schema({
  benefitCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BenefitCategory',
    required: true,
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // 실제 결제 금액
  amount: {
    type: Number,
    required: [true, '결제 금액은 필수입니다.'],
  },
  // 혜택(할인/캐시백) 금액 — 잔여 한도 계산에 사용
  benefitAmount: {
    type: Number,
    required: [true, '혜택 금액은 필수입니다.'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  memo: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BenefitUsage', benefitUsageSchema);
