const express = require('express');
const BenefitCategory = require('../models/BenefitCategory');
const BenefitUsage = require('../models/BenefitUsage');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/benefits
 * 혜택 카테고리 목록 조회
 * - cardId 쿼리 파라미터로 특정 카드의 혜택만 필터링 가능
 * - cardId가 없으면 사용자의 모든 혜택 카테고리 반환
 */
router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.cardId) {
      filter.cardId = req.query.cardId;
    }

    const benefits = await BenefitCategory.find(filter)
      .populate('cardId', 'name company color')
      .sort({ createdAt: -1 });

    res.json(benefits);
  } catch (error) {
    res.status(500).json({ message: '혜택 카테고리 조회 실패', error: error.message });
  }
});

/**
 * POST /api/benefits
 * 혜택 카테고리 등록
 */
router.post('/', async (req, res) => {
  try {
    const { cardId, categoryName, discountType, discountRate, monthlyLimit, description } = req.body;

    const benefit = await BenefitCategory.create({
      cardId,
      userId: req.user.id,
      categoryName,
      discountType: discountType || 'discount',
      discountRate: discountRate || 0,
      monthlyLimit,
      description: description || '',
    });

    // 카드 정보를 포함하여 응답
    const populated = await benefit.populate('cardId', 'name company color');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: '혜택 카테고리 등록 실패', error: error.message });
  }
});

/**
 * PUT /api/benefits/:id
 * 혜택 카테고리 수정
 */
router.put('/:id', async (req, res) => {
  try {
    const benefit = await BenefitCategory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!benefit) {
      return res.status(404).json({ message: '혜택 카테고리를 찾을 수 없습니다.' });
    }

    const { categoryName, discountType, discountRate, monthlyLimit, description } = req.body;

    if (categoryName !== undefined) benefit.categoryName = categoryName;
    if (discountType !== undefined) benefit.discountType = discountType;
    if (discountRate !== undefined) benefit.discountRate = discountRate;
    if (monthlyLimit !== undefined) benefit.monthlyLimit = monthlyLimit;
    if (description !== undefined) benefit.description = description;

    await benefit.save();
    const populated = await benefit.populate('cardId', 'name company color');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: '혜택 카테고리 수정 실패', error: error.message });
  }
});

/**
 * DELETE /api/benefits/:id
 * 혜택 카테고리 삭제
 * - 해당 카테고리의 사용 기록도 함께 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const benefit = await BenefitCategory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!benefit) {
      return res.status(404).json({ message: '혜택 카테고리를 찾을 수 없습니다.' });
    }

    // 연관 사용 기록 삭제
    await BenefitUsage.deleteMany({ benefitCategoryId: benefit._id });
    await BenefitCategory.deleteOne({ _id: benefit._id });

    res.json({ message: '혜택 카테고리가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '혜택 카테고리 삭제 실패', error: error.message });
  }
});

module.exports = router;
