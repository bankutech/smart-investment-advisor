import { portfolioRepository } from '../repositories/portfolioRepository.js';
import { recommendationRepository } from '../repositories/recommendationRepository.js';
import { userProfileRepository } from '../repositories/userProfileRepository.js';

export class RebalanceService {
  computeRebalance(userId = 'usr_01') {
    const user = userProfileRepository.getUserWithProfile(userId);
    const categoryId = user?.category_id || 'cat_long';
    const holdings = portfolioRepository.findHoldingsByUser(userId);
    const targetSuggestions = recommendationRepository.findSuggestionsByCategory(categoryId);

    const totalPortfolioValue = holdings.reduce((sum, h) => sum + h.current_value, 0);

    // Group actual holdings by asset
    const currentWeights = {};
    holdings.forEach(h => {
      const weight = totalPortfolioValue > 0 ? (h.current_value / totalPortfolioValue) * 100 : 0;
      currentWeights[h.asset_id] = {
        name: h.asset_name,
        ticker: h.ticker,
        current_value: h.current_value,
        actual_weight_pct: Math.round(weight * 10) / 10
      };
    });

    // Compare with target allocations
    const rebalanceActions = targetSuggestions.map(sug => {
      const actual = currentWeights[sug.asset_id] || {
        name: sug.asset_name,
        ticker: sug.ticker,
        current_value: 0,
        actual_weight_pct: 0
      };

      const targetWeight = sug.allocation_weight_pct;
      const drift = Math.round((actual.actual_weight_pct - targetWeight) * 10) / 10;
      const targetValue = Math.round((targetWeight / 100) * totalPortfolioValue);
      const deltaValue = Math.round(targetValue - actual.current_value);

      let action = 'HOLD';
      if (drift > 3.0) action = 'TRIM / SELL';
      else if (drift < -3.0) action = 'ACCUMULATE / BUY';

      return {
        asset_id: sug.asset_id,
        ticker: sug.ticker,
        asset_name: sug.asset_name,
        asset_class: sug.asset_class,
        target_weight_pct: targetWeight,
        actual_weight_pct: actual.actual_weight_pct,
        weight_drift_pct: drift,
        current_value: actual.current_value,
        target_value: targetValue,
        delta_value: deltaValue,
        action,
        rationale: sug.investment_rationale
      };
    });

    return {
      userId,
      category_id: categoryId,
      category_name: user?.category_name,
      total_portfolio_value: Math.round(totalPortfolioValue),
      rebalanceActions
    };
  }
}

export const rebalanceService = new RebalanceService();
