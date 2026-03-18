import { userProfileRepository } from '../repositories/userProfileRepository.js';
import { recommendationRepository } from '../repositories/recommendationRepository.js';

export class ProfilingService {
  calculateScoreAndClassify(inputs) {
    const age = parseInt(inputs.age) || 30;
    const income = parseFloat(inputs.annual_income) || 75000;
    const savings = parseFloat(inputs.monthly_savings) || 2000;
    const horizonYears = parseInt(inputs.target_duration_years) || 5;
    const riskTolerance = parseInt(inputs.risk_tolerance) || 3; // 1 (Very Low) to 5 (Very High)

    // 1. Age Factor (0 to 25 pts): Younger -> higher capacity for equity volatility
    const ageFactor = Math.max(5, Math.min(25, 25 - ((age - 20) * 0.4)));

    // 2. Horizon Factor (0 to 35 pts): Longer horizon -> higher risk capacity
    const horizonFactor = Math.min(35, horizonYears * 2.8);

    // 3. Savings Rate Factor (0 to 15 pts) - clamped safely between 0% and 100% of income
    const monthlyIncome = Math.max(1, income / 12);
    const savingsRate = Math.min(1.0, Math.max(0, savings / monthlyIncome));
    const savingsFactor = Math.min(15, savingsRate * 30);

    // 4. Stated Risk Tolerance Factor (0 to 25 pts)
    const toleranceFactor = (riskTolerance / 5) * 25;

    const totalScore = Math.min(100, Math.max(5, Math.round((ageFactor + horizonFactor + savingsFactor + toleranceFactor) * 10) / 10));

    // Categorization strictly aligned with Predefined Investment Horizons:
    // • Short Term: 0–2 years (Capital preservation paramount)
    // • Mid Term: 3–5 years (Balanced preservation & growth)
    // • Long Term: 6–15 years (Aggressive capital growth)
    // • Retirement: >15 years (All-weather generational compounding)
    let categoryId = 'cat_short';
    let tier = 'Conservative Capital Preservation';

    if (horizonYears <= 2) {
      categoryId = 'cat_short';
      tier = 'Conservative Capital Preservation';
    } else if (horizonYears > 15) {
      categoryId = 'cat_retire';
      tier = 'Retirement Growth';
    } else if (horizonYears >= 6) {
      if (totalScore < 45) {
        categoryId = 'cat_mid';
        tier = 'Moderate Balanced';
      } else {
        categoryId = 'cat_long';
        tier = 'Moderately Aggressive';
      }
    } else {
      // 3 to 5 years (Mid-Term)
      if (totalScore < 35) {
        categoryId = 'cat_short';
        tier = 'Conservative Capital Preservation';
      } else {
        categoryId = 'cat_mid';
        tier = 'Moderate Balanced';
      }
    }

    return {
      risk_score: totalScore,
      risk_tolerance_tier: tier,
      category_id: categoryId,
      profile_data: {
        age,
        annual_income: income,
        monthly_savings: savings,
        target_duration_years: horizonYears,
        risk_score: totalScore,
        risk_tolerance_tier: tier
      }
    };
  }

  assessAndSave(userId = 'usr_01', inputs) {
    const evaluation = this.calculateScoreAndClassify(inputs);
    return userProfileRepository.updateProfileAndClassification(
      userId,
      evaluation.profile_data,
      evaluation.category_id
    );
  }
}

export const profilingService = new ProfilingService();
