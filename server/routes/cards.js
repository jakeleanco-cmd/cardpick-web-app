const express = require('express');
const Card = require('../models/Card');
const BenefitCategory = require('../models/BenefitCategory');
const BenefitUsage = require('../models/BenefitUsage');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 모든 카드 라우트에 인증 필요
router.use(authMiddleware);

/**
 * GET /api/cards
 * 내 카드 목록 조회
 * - 로그인한 사용자의 카드만 반환
 */
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: '카드 목록 조회 실패', error: error.message });
  }
});

/**
 * POST /api/cards
 * 새 카드 등록
 */
router.post('/', async (req, res) => {
  try {
    const { name, company, annualFee, minSpending, isMinSpendingMet, color } = req.body;

    const card = await Card.create({
      userId: req.user.id,
      name,
      company,
      annualFee: annualFee || 0,
      minSpending: minSpending || 0,
      isMinSpendingMet: isMinSpendingMet !== undefined ? isMinSpendingMet : true,
      color: color || '#6C5CE7',
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: '카드 등록 실패', error: error.message });
  }
});

/**
 * PUT /api/cards/:id
 * 카드 정보 수정
 * - 전월 실적 충족 여부 토글도 이 API로 처리
 * - 본인 소유 카드만 수정 가능 (보안)
 */
router.put('/:id', async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user.id });
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    const { name, company, annualFee, minSpending, isMinSpendingMet, color } = req.body;

    // 전달된 필드만 업데이트
    if (name !== undefined) card.name = name;
    if (company !== undefined) card.company = company;
    if (annualFee !== undefined) card.annualFee = annualFee;
    if (minSpending !== undefined) card.minSpending = minSpending;
    if (isMinSpendingMet !== undefined) card.isMinSpendingMet = isMinSpendingMet;
    if (color !== undefined) card.color = color;

    await card.save();
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: '카드 수정 실패', error: error.message });
  }
});

/**
 * DELETE /api/cards/:id
 * 카드 삭제
 * - 연관된 혜택 카테고리와 사용 기록도 함께 삭제 (cascade)
 */
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user.id });
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 연관 데이터 일괄 삭제 (카드에 속한 혜택 카테고리와 사용 기록)
    await BenefitUsage.deleteMany({ cardId: card._id });
    await BenefitCategory.deleteMany({ cardId: card._id });
    await Card.deleteOne({ _id: card._id });

    res.json({ message: '카드가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '카드 삭제 실패', error: error.message });
  }
});

module.exports = router;
