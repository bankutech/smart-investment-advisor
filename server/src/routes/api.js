import { Router } from 'express';
import { getUserProfile, assessProfile } from '../controllers/profileController.js';
import {
  getRecommendations,
  getSectorBreakdown,
  runSlide14Query,
  getAssets,
  getCategories,
  getPortfolio,
  tradePortfolio,
  getRebalanceAnalysis,
  simulateGrowth,
  getSchemaInspector
} from '../controllers/recommendationController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Smart Investment Advisor API', timestamp: new Date().toISOString() });
});

router.get('/profile/:userId', getUserProfile);
router.post('/profile/assess', assessProfile);

router.get('/categories', getCategories);
router.get('/recommendations/:userId', getRecommendations);
router.get('/sectors/breakdown/:categoryId', getSectorBreakdown);

router.post('/sql/slide14-query', runSlide14Query);

router.get('/assets', getAssets);

router.get('/portfolio/:userId', getPortfolio);
router.post('/portfolio/trade', tradePortfolio);
router.get('/portfolio/:userId/rebalance', getRebalanceAnalysis);

router.post('/simulation/growth', simulateGrowth);
router.post('/simulation/compound', simulateGrowth);

router.get('/schema/inspector', getSchemaInspector);
router.get('/schema', getSchemaInspector);

export default router;
