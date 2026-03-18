import { recommendationRepository } from '../repositories/recommendationRepository.js';
import { userProfileRepository } from '../repositories/userProfileRepository.js';
import { assetRepository } from '../repositories/assetRepository.js';
import { portfolioRepository } from '../repositories/portfolioRepository.js';
import { simulationService } from '../services/simulationService.js';
import { rebalanceService } from '../services/rebalanceService.js';

export const getRecommendations = (req, res, next) => {
  try {
    const userId = req.params.userId || 'usr_01';
    const user = userProfileRepository.getUserWithProfile(userId);
    const categoryId = req.query.category_id || user?.category_id || 'cat_long';
    const suggestions = recommendationRepository.findSuggestionsByCategory(categoryId);
    const sectorBreakdown = recommendationRepository.getSectorBreakdown(categoryId);

    res.json({
      status: 'success',
      data: {
        user,
        category_id: categoryId,
        suggestions,
        sectorBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getSectorBreakdown = (req, res, next) => {
  try {
    const categoryId = req.params.categoryId || 'cat_long';
    const breakdown = recommendationRepository.getSectorBreakdown(categoryId);
    res.json({ status: 'success', category_id: categoryId, data: breakdown });
  } catch (err) {
    next(err);
  }
};

export const runSlide14Query = (req, res, next) => {
  try {
    const { categoryId } = req.body;
    const start = performance.now();
    const rows = recommendationRepository.executeSlide14Query(categoryId || 'cat_long');
    const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;
    res.json({
      status: 'success',
      executionTimeMs,
      rowCount: rows.length,
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

export const getAssets = (req, res, next) => {
  try {
    const assets = assetRepository.findAll();
    res.json({ status: 'success', results: assets.length, data: assets });
  } catch (err) {
    next(err);
  }
};

export const getCategories = (req, res, next) => {
  try {
    const categories = recommendationRepository.findAllCategories();
    res.json({ status: 'success', data: categories });
  } catch (err) {
    next(err);
  }
};

export const getPortfolio = (req, res, next) => {
  try {
    const userId = req.params.userId || 'usr_01';
    const holdings = portfolioRepository.findHoldingsByUser(userId);
    const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.units * h.avg_buy_price), 0);
    const totalGains = totalValue - totalCost;
    res.json({
      status: 'success',
      data: {
        total_value: Math.round(totalValue),
        total_cost: Math.round(totalCost),
        total_gains: Math.round(totalGains),
        return_pct: totalCost > 0 ? ((totalGains / totalCost) * 100).toFixed(2) : 0,
        holdings
      }
    });
  } catch (err) {
    next(err);
  }
};

export const tradePortfolio = (req, res, next) => {
  try {
    const { userId, assetId, units, price } = req.body;
    const holdings = portfolioRepository.recordTransaction(userId || 'usr_01', assetId, parseFloat(units), parseFloat(price));
    res.json({ status: 'success', data: holdings });
  } catch (err) {
    next(err);
  }
};

export const getRebalanceAnalysis = (req, res, next) => {
  try {
    const userId = req.params.userId || 'usr_01';
    const rebalance = rebalanceService.computeRebalance(userId);
    res.json({ status: 'success', data: rebalance });
  } catch (err) {
    next(err);
  }
};

export const simulateGrowth = (req, res, next) => {
  try {
    const { initialPrincipal, monthlySip, years, baseCagrPct } = req.body;
    const projection = simulationService.simulateCompoundGrowth(initialPrincipal, monthlySip, years, baseCagrPct);
    res.json({ status: 'success', data: projection });
  } catch (err) {
    next(err);
  }
};

export const getSchemaInspector = (req, res, next) => {
  try {
    const schema = recommendationRepository.getSchemaDiagram();
    res.json({ status: 'success', data: schema });
  } catch (err) {
    next(err);
  }
};
