const mongoose = require('mongoose');

/**
 * 혜택 카테고리(BenefitCategory) 스키마
 * - 카드별 혜택 종류를 정의 (예: 커피 할인, 교통 캐시백 등)
 * - monthlyLimit: 해당 혜택의 월간 최대 한도 금액
 * - discountRate: 할인율(%) - 해당 카테고리 결제 시 적용되는 비율
 */
const benefitCategorySchema = new mongoose.Schema({
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
  categoryName: {
    type: String,
    required: [true, '카테고리 이름은 필수입니다.'],
    trim: true,
  },
  // 할인 유형: "discount" (즉시 할인) 또는 "cashback" (캐시백)
  discountType: {
    type: String,
    enum: ['discount', 'cashback'],
    default: 'discount',
  },
  // 할인율 (퍼센트)
  discountRate: {
    type: Number,
    default: 0,
  },
  // 월 한도 금액 (원) - 이 금액까지만 혜택 적용
  monthlyLimit: {
    type: Number,
    required: [true, '월 한도 금액은 필수입니다.'],
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BenefitCategory', benefitCategorySchema);
