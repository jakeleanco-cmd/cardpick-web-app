const express = require('express');
const BenefitUsage = require('../models/BenefitUsage');
const BenefitCategory = require('../models/BenefitCategory');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/usages/dashboard
 * 대시보드 요약 데이터
 * - 카드별 혜택 카테고리별 잔여 한도 계산
 * - 전체 피킹률 계산 (총 혜택 사용액 / 총 한도 × 100)
 * - 전월 실적 미달 카드 표시
 * 
 * ⚠️ 주의: /:id 파라미터 라우트보다 먼저 정의해야 "dashboard"가 id로 잘못 인식되지 않음
 */
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    // 해당 월의 시작과 끝 날짜 (한국 시간 KST 기준 보정)
    const startDate = new Date(Date.UTC(year, month - 1, 1, -9, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, -9, 0, 0, -1));

    // 사용자의 모든 카드 조회
    const cards = await Card.find({ userId: req.user.id });

    // 사용자의 모든 혜택 카테고리 조회
    const benefits = await BenefitCategory.find({ userId: req.user.id });

    // 이번 달 사용 기록 조회
    const usages = await BenefitUsage.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    });

    // 카테고리별 사용 금액 합산
    const usageByCategory = {};
    usages.forEach((usage) => {
      const catId = usage.benefitCategoryId.toString();
      if (!usageByCategory[catId]) {
        usageByCategory[catId] = 0;
      }
      usageByCategory[catId] += usage.benefitAmount;
    });

    // 카드별 데이터 구성
    let totalLimit = 0;
    let totalUsed = 0;

    const cardSummaries = cards.map((card) => {
      const cardBenefits = benefits.filter(
        (b) => b.cardId.toString() === card._id.toString()
      );

      const categories = cardBenefits.map((benefit) => {
        const catId = benefit._id.toString();
        const used = usageByCategory[catId] || 0;
        const remaining = Math.max(0, benefit.monthlyLimit - used);
        const pickingRate = benefit.monthlyLimit > 0
          ? Math.min(100, (used / benefit.monthlyLimit) * 100)
          : 0;

        return {
          _id: benefit._id,
          categoryName: benefit.categoryName,
          discountType: benefit.discountType,
          discountRate: benefit.discountRate,
          monthlyLimit: benefit.monthlyLimit,
          used,
          remaining,
          benefitUsageRate: Math.round(pickingRate * 10) / 10,
        };
      });

      // 카드별 합산
      const cardTotalLimit = categories.reduce((sum, c) => sum + c.monthlyLimit, 0);
      const cardTotalUsed = categories.reduce((sum, c) => sum + Math.min(c.used, c.monthlyLimit), 0);
      
      // 사용율 (%): (혜택 / 한도) * 100
      const cardBenefitUsageRate = cardTotalLimit > 0
        ? Math.round((cardTotalUsed / cardTotalLimit) * 1000) / 10
        : 0;
      
      // 피킹률 (%): ((혜택 - 연회비/12) / 실적기준금액) * 100
      const monthlyAnnualFee = (card.annualFee || 0) / 12;
      const cardRealPickingRate = card.minSpending > 0
        ? Math.round(((cardTotalUsed - monthlyAnnualFee) / card.minSpending) * 1000) / 10
        : 0;

      totalLimit += cardTotalLimit;
      totalUsed += cardTotalUsed;

      return {
        _id: card._id,
        name: card.name,
        company: card.company,
        color: card.color,
        isMinSpendingMet: card.isMinSpendingMet,
        minSpending: card.minSpending,
        cardTotalLimit,
        cardTotalUsed,
        cardBenefitUsageRate,
        cardRealPickingRate,
        categories,
      };
    });

    // 전체 지표 계산
    const overallBenefitUsageRate = totalLimit > 0
      ? Math.round((totalUsed / totalLimit) * 1000) / 10
      : 0;
    
    // 전체 피킹률: 카드별 피킹률의 산술 평균
    const totalPickingRateSum = cardSummaries.reduce((sum, c) => sum + c.cardRealPickingRate, 0);
    const overallRealPickingRate = cardSummaries.length > 0
      ? Math.round((totalPickingRateSum / cardSummaries.length) * 10) / 10
      : 0;

    // 실적 미달 카드 수
    const unmetCards = cards.filter((c) => !c.isMinSpendingMet).length;

    res.json({
      year,
      month,
      totalLimit,
      totalUsed,
      overallBenefitUsageRate,
      overallRealPickingRate,
      unmetCards,
      cardSummaries,
    });
  } catch (error) {
    res.status(500).json({ message: '대시보드 데이터 조회 실패', error: error.message });
  }
});

/**
 * GET /api/usages
 * 사용 기록 조회
 * - month, year 쿼리로 월별 필터링
 * - cardId 쿼리로 카드별 필터링
 * - 기본값: 현재 년/월
 */
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    // 해당 월의 시작과 끝 날짜 (한국 시간 KST 기준 보정)
    // 1일 00:00:00 KST -> UTC로는 전날 15:00:00
    const startDate = new Date(Date.UTC(year, month - 1, 1, -9, 0, 0, 0));
    
    // 다음달 1일 00:00:00 KST 직전 -> UTC로 계산
    const endDate = new Date(Date.UTC(year, month, 1, -9, 0, 0, -1));

    const filter = {
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    };

    if (req.query.cardId) {
      filter.cardId = req.query.cardId;
    }

    const usages = await BenefitUsage.find(filter)
      .populate('benefitCategoryId', 'categoryName discountType')
      .populate('cardId', 'name company color')
      .sort({ date: -1 });

    res.json(usages);
  } catch (error) {
    res.status(500).json({ message: '사용 기록 조회 실패', error: error.message });
  }
});

/**
 * POST /api/usages
 * 사용 기록 등록
 * - 혜택을 받았을 때 결제 금액과 혜택 금액을 기록
 */
router.post('/', async (req, res) => {
  try {
    const { benefitCategoryId, cardId, amount, benefitAmount, date, memo } = req.body;

    // 데이터 유효성 검사 및 타입 변환
    const cleanAmount = Number(amount) || 0;
    const cleanBenefitAmount = Number(benefitAmount) || 0;

    if (!benefitCategoryId || !cardId) {
      return res.status(400).json({ message: '카테고리와 카드 정보는 필수입니다.' });
    }

    const usage = await BenefitUsage.create({
      benefitCategoryId,
      cardId,
      userId: req.user.id,
      amount: cleanAmount,
      benefitAmount: cleanBenefitAmount,
      date: date || new Date(),
      memo: memo || '',
    });

    const populated = await usage.populate([
      { path: 'benefitCategoryId', select: 'categoryName discountType' },
      { path: 'cardId', select: 'name company color' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: '사용 기록 등록 실패', error: error.message });
  }
});

/**
 * PUT /api/usages/:id
 * 사용 기록 수정 (결제 금액, 혜택 금액, 메모 등)
 */
router.put('/:id', async (req, res) => {
  try {
    const { amount, benefitAmount, memo, date } = req.body;

    const usage = await BenefitUsage.findOne({ _id: req.params.id, userId: req.user.id });
    if (!usage) {
      return res.status(404).json({ message: '사용 기록을 찾을 수 없습니다.' });
    }

    // 허용된 필드만 업데이트
    if (amount !== undefined) usage.amount = amount;
    if (benefitAmount !== undefined) usage.benefitAmount = benefitAmount;
    if (memo !== undefined) usage.memo = memo;
    if (date !== undefined) usage.date = date;

    await usage.save();

    const populated = await usage.populate([
      { path: 'benefitCategoryId', select: 'categoryName discountType' },
      { path: 'cardId', select: 'name company color' },
    ]);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: '사용 기록 수정 실패', error: error.message });
  }
});

/**
 * DELETE /api/usages/:id
 * 사용 기록 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const usage = await BenefitUsage.findOne({ _id: req.params.id, userId: req.user.id });
    if (!usage) {
      return res.status(404).json({ message: '사용 기록을 찾을 수 없습니다.' });
    }

    await BenefitUsage.deleteOne({ _id: usage._id });
    res.json({ message: '사용 기록이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '사용 기록 삭제 실패', error: error.message });
  }
});

module.exports = router;
