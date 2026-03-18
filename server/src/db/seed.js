import { db, initializeDatabase } from './connection.js';

export function seedDatabase() {
  initializeDatabase();

  db.exec(`
    DELETE FROM portfolio_holdings;
    DELETE FROM category_suggestions;
    DELETE FROM asset_performance;
    DELETE FROM assets;
    DELETE FROM market_sectors;
    DELETE FROM user_categories;
    DELETE FROM user_profiles;
    DELETE FROM users;
    DELETE FROM risk_categories;
  `);

  // 1. RISK_CATEGORIES
  const insertCat = db.prepare(`
    INSERT INTO risk_categories (category_id, category_name, target_horizon, min_score, max_score, expected_return_cagr, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const categories = [
    ['cat_short', 'Short Term Horizon', '0 to 2 Years', 0, 35, 7.2, 'Capital preservation and high liquidity through fixed income, money market instruments, and short-duration sovereign securities.'],
    ['cat_mid', 'Mid Term Horizon', '2 to 5 Years', 36, 60, 10.8, 'Balanced capital appreciation with downside hedging via high-grade corporate debt, sovereign gold, and dividend-yielding equities.'],
    ['cat_long', 'Long Term Horizon', '5 to 15 Years', 61, 85, 14.5, 'Aggressive capital expansion leveraging diversified index ETFs, blue-chip technology innovators, and emerging market leaders.'],
    ['cat_retire', 'Retirement Horizon', '15+ Years', 86, 100, 12.8, 'All-weather compounding foundation structured with broad equity index ETFs, inflation-hedging precious metals, and long-term bonds.']
  ];

  for (const c of categories) {
    insertCat.run(...c);
  }

  // 2. MARKET_SECTORS
  const insertSector = db.prepare(`
    INSERT INTO market_sectors (sector_id, sector_name, risk_tier, description)
    VALUES (?, ?, ?, ?)
  `);

  const sectors = [
    ['sec_tech', 'Technology & Cloud', 'High', 'Enterprise software, semiconductors, and artificial intelligence hardware.'],
    ['sec_fin', 'Banking & Financials', 'Medium', 'Tier-1 retail and investment banks, insurance underwriters, and clearing houses.'],
    ['sec_gov', 'Sovereign & Treasury Debt', 'Low', 'Government-backed benchmark bonds, treasury bills, and sovereign guarantees.'],
    ['sec_corp', 'Corporate Debt & Credit', 'Low-Medium', 'Investment-grade AAA corporate debentures and commercial paper.'],
    ['sec_metal', 'Precious Metals & Commodities', 'Medium', 'Physical gold bullion reserves, sovereign gold bonds, and silver ETFs.'],
    ['sec_health', 'Healthcare & Biopharma', 'Medium', 'Global pharmaceutical leaders, clinical diagnostics, and medical devices.']
  ];

  for (const s of sectors) {
    insertSector.run(...s);
  }

  // 3. ASSETS (Slide 9 & 14 Schema Compliance)
  const insertAsset = db.prepare(`
    INSERT INTO assets (asset_id, ticker, name, asset_name, asset_type, asset_class, sector_id, risk_level, current_price, expense_ratio, dividend_yield)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const assets = [
    ['ast_01', 'US-T10Y', '10-Year Benchmark Treasury Bond', '10-Year Benchmark Treasury Bond', 'Bond', 'Bond', 'sec_gov', 'Low', 100.25, 0.03, 4.45],
    ['ast_02', 'LQD-FD', 'High-Yield Tier-1 Liquid Fixed Deposit', 'High-Yield Tier-1 Liquid Fixed Deposit', 'Fixed Deposit', 'Fixed Deposit', 'sec_fin', 'Low', 1000.00, 0.00, 7.10],
    ['ast_03', 'AAA-CRP', 'Vanguard AAA Corporate Bond ETF', 'Vanguard AAA Corporate Bond ETF', 'Bond ETF', 'Bond ETF', 'sec_corp', 'Low-Medium', 78.40, 0.05, 5.20],
    ['ast_04', 'SGB-GLD', 'Sovereign Gold Reserve Trust', 'Sovereign Gold Reserve Trust', 'Commodity', 'Commodity', 'sec_metal', 'Medium', 88.50, 0.12, 2.50],
    ['ast_05', 'VOO-SP500', 'Vanguard S&P 500 Index Fund', 'Vanguard S&P 500 Index Fund', 'Equity ETF', 'Equity ETF', 'sec_tech', 'Medium', 524.80, 0.03, 1.48],
    ['ast_06', 'NFT-N50', 'Nifty 50 Benchmark Growth Index', 'Nifty 50 Benchmark Growth Index', 'Equity ETF', 'Equity ETF', 'sec_fin', 'Medium', 285.20, 0.08, 1.25],
    ['ast_07', 'AAPL', 'Apple Inc. (Nasdaq)', 'Apple Inc. (Nasdaq)', 'Equity', 'Equity', 'sec_tech', 'High', 234.50, 0.00, 0.52],
    ['ast_08', 'MSFT', 'Microsoft Corporation (Nasdaq)', 'Microsoft Corporation (Nasdaq)', 'Equity', 'Equity', 'sec_tech', 'High', 428.10, 0.00, 0.72],
    ['ast_09', 'NVDA', 'Nvidia Semiconductor Corp', 'Nvidia Semiconductor Corp', 'Equity', 'Equity', 'sec_tech', 'Very High', 142.30, 0.00, 0.08],
    ['ast_10', 'PFE', 'Pfizer Global Healthcare Corp', 'Pfizer Global Healthcare Corp', 'Equity', 'Equity', 'sec_health', 'Medium', 28.75, 0.00, 5.85],
    ['ast_11', 'HDFC', 'HDFC Bank ADR Tier-1 Capital', 'HDFC Bank ADR Tier-1 Capital', 'Equity', 'Equity', 'sec_fin', 'Medium', 62.40, 0.00, 1.85],
    ['ast_12', 'ICLN', 'iShares Global Clean Energy ETF', 'iShares Global Clean Energy ETF', 'Equity ETF', 'Equity ETF', 'sec_tech', 'High', 14.80, 0.40, 1.60]
  ];

  for (const a of assets) {
    insertAsset.run(...a);
  }

  // 4. ASSET_PERFORMANCE (Slide 9 & 14 Timeframes: return_1_month, return_1_year, return_3_years, historical_return)
  const insertPerf = db.prepare(`
    INSERT INTO asset_performance (
      performance_id, asset_id, year, return_1_month, return_1_year, return_3_years, historical_return,
      annual_return_pct, cagr_3yr, cagr_5yr, sharpe_ratio, beta
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const performance = [
    ['prf_01', 'ast_01', 2025, 0.4, 4.8, 4.2, 4.4, 4.8, 4.2, 3.9, 1.42, 0.15],
    ['prf_02', 'ast_02', 2025, 0.6, 7.1, 6.9, 7.0, 7.1, 6.9, 6.7, 2.10, 0.00],
    ['prf_03', 'ast_03', 2025, 0.5, 6.2, 5.8, 6.0, 6.2, 5.8, 5.4, 1.25, 0.35],
    ['prf_04', 'ast_04', 2025, 1.8, 14.2, 12.8, 13.5, 14.2, 12.8, 11.4, 1.15, 0.22],
    ['prf_05', 'ast_05', 2025, 2.4, 24.5, 18.2, 21.0, 24.5, 18.2, 16.4, 1.68, 1.00],
    ['prf_06', 'ast_06', 2025, 1.9, 18.4, 15.6, 16.8, 18.4, 15.6, 14.1, 1.45, 0.92],
    ['prf_07', 'ast_07', 2025, 3.2, 28.6, 22.4, 25.2, 28.6, 22.4, 25.1, 1.82, 1.12],
    ['prf_08', 'ast_08', 2025, 2.8, 26.1, 20.8, 23.4, 26.1, 20.8, 22.5, 1.74, 1.08],
    ['prf_09', 'ast_09', 2025, 6.5, 84.5, 62.1, 71.2, 84.5, 62.1, 54.8, 2.35, 1.78],
    ['prf_10', 'ast_10', 2025, 0.8, 5.2, 4.8, 5.0, 5.2, 4.8, 6.2, 0.65, 0.58],
    ['prf_11', 'ast_11', 2025, 1.2, 15.8, 14.2, 15.1, 15.8, 14.2, 13.5, 1.20, 0.88],
    ['prf_12', 'ast_12', 2025, -0.5, 12.4, 9.8, 8.0, 12.4, 9.8, 11.2, 0.88, 1.35]
  ];

  for (const p of performance) {
    insertPerf.run(...p);
  }

  // 5. CATEGORY_SUGGESTIONS (Category to Asset Mapping with priority & rank_order)
  const insertSug = db.prepare(`
    INSERT INTO category_suggestions (
      suggestion_id, category_id, asset_id, allocation_weight_pct, priority, priority_rank, rank_order, investment_rationale, rationale
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const suggestions = [
    // Short Term Model: 40% Liquid FD, 35% Treasury Bond, 15% AAA Corp Bond, 10% Gold
    ['sug_01', 'cat_short', 'ast_02', 40.0, 1, 1, 1, 'Maximum capital preservation with zero market volatility.', 'Maximum capital preservation with zero market volatility.'],
    ['sug_02', 'cat_short', 'ast_01', 35.0, 2, 2, 2, 'Government guaranteed principal security and sovereign coupon.', 'Government guaranteed principal security and sovereign coupon.'],
    ['sug_03', 'cat_short', 'ast_03', 15.0, 3, 3, 3, 'Yield enhancement via top-tier corporate credit.', 'Yield enhancement via top-tier corporate credit.'],
    ['sug_04', 'cat_short', 'ast_04', 10.0, 4, 4, 4, 'Inflation dampener and liquidity hedge.', 'Inflation dampener and liquidity hedge.'],

    // Mid Term Model: 30% S&P 500 ETF, 25% AAA Corp Bond, 20% Gold, 15% Nifty 50, 10% HDFC Bank
    ['sug_05', 'cat_mid', 'ast_05', 30.0, 1, 1, 1, 'Core market growth anchor over a 3-5 year compounding period.', 'Core market growth anchor over a 3-5 year compounding period.'],
    ['sug_06', 'cat_mid', 'ast_03', 25.0, 2, 2, 2, 'Stable cash-flow income stream to temper market drawdowns.', 'Stable cash-flow income stream to temper market drawdowns.'],
    ['sug_07', 'cat_mid', 'ast_04', 20.0, 3, 3, 3, 'Safe-haven asset class with historical negative correlation to equities.', 'Safe-haven asset class with historical negative correlation to equities.'],
    ['sug_08', 'cat_mid', 'ast_06', 15.0, 4, 4, 4, 'Exposure to fast-growing emerging domestic market demand.', 'Exposure to fast-growing emerging domestic market demand.'],
    ['sug_09', 'cat_mid', 'ast_11', 10.0, 5, 5, 5, 'High-dividend financial blue chip with robust tier-1 capital reserves.', 'High-dividend financial blue chip with robust tier-1 capital reserves.'],

    // Long Term Model: 35% S&P 500 ETF, 25% Microsoft, 20% Apple, 10% Nvidia, 10% Gold
    ['sug_10', 'cat_long', 'ast_05', 35.0, 1, 1, 1, 'Broad-market equity cornerstone to harness secular macroeconomic growth.', 'Broad-market equity cornerstone to harness secular macroeconomic growth.'],
    ['sug_11', 'cat_long', 'ast_08', 25.0, 2, 2, 2, 'Enterprise cloud infrastructure and generative AI leadership.', 'Enterprise cloud infrastructure and generative AI leadership.'],
    ['sug_12', 'cat_long', 'ast_07', 20.0, 3, 3, 3, 'Massive consumer hardware ecosystem and pristine free cash flow generation.', 'Massive consumer hardware ecosystem and pristine free cash flow generation.'],
    ['sug_13', 'cat_long', 'ast_09', 10.0, 4, 4, 4, 'High-beta semiconductor acceleration for outsized 10-year capital expansion.', 'High-beta semiconductor acceleration for outsized 10-year capital expansion.'],
    ['sug_14', 'cat_long', 'ast_04', 10.0, 5, 5, 5, 'Gold reserve buffer preventing emotional drawdowns during bear markets.', 'Gold reserve buffer preventing emotional drawdowns during bear markets.'],

    // Retirement Model: 35% S&P 500, 25% Treasury Bond, 20% AAA Corp Bond, 10% Gold, 10% Pfizer
    ['sug_15', 'cat_retire', 'ast_05', 35.0, 1, 1, 1, 'Passive index appreciation outpacing long-term inflation.', 'Passive index appreciation outpacing long-term inflation.'],
    ['sug_16', 'cat_retire', 'ast_01', 25.0, 2, 2, 2, 'Guaranteed sovereign annuity cash flow during post-career distribution.', 'Guaranteed sovereign annuity cash flow during post-career distribution.'],
    ['sug_17', 'cat_retire', 'ast_03', 20.0, 3, 3, 3, 'Regular high-grade quarterly bond coupon distributions.', 'Regular high-grade quarterly bond coupon distributions.'],
    ['sug_18', 'cat_retire', 'ast_04', 10.0, 4, 4, 4, 'Generational wealth preservation against currency depreciation.', 'Generational wealth preservation against currency depreciation.'],
    ['sug_19', 'cat_retire', 'ast_10', 10.0, 5, 5, 5, 'Defensive healthcare dividend stream with low market beta.', 'Defensive healthcare dividend stream with low market beta.']
  ];

  for (const s of suggestions) {
    insertSug.run(...s);
  }

  // 6. DEMO USER & PROFILE (Slide 9 Schema)
  const insertUser = db.prepare(`
    INSERT INTO users (user_id, name, full_name, email, password, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('usr_01', 'Enterprise Client', 'Enterprise Portfolio Investor', 'client.investor@advisor.io', 'argon2_hashed_secret', '+91 98401 00000');

  const insertProfile = db.prepare(`
    INSERT INTO user_profiles (
      profile_id, user_id, age, monthly_income, annual_income, savings, monthly_savings, investment_goal, investment_duration, target_duration_years, risk_score, risk_tolerance_tier
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProfile.run('prf_01', 'usr_01', 25, 10000.0, 120000.0, 42000.0, 3500.0, 'Long-Term Capital Compounding', '10 Years', 10, 78.5, 'Moderately Aggressive');

  const insertUserCat = db.prepare(`
    INSERT INTO user_categories (user_category_id, mapping_id, user_id, category_id, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);
  insertUserCat.run('uc_01', 'uc_01', 'usr_01', 'cat_long');

  // 7. DEMO PORTFOLIO HOLDINGS
  const insertHold = db.prepare(`
    INSERT INTO portfolio_holdings (holding_id, user_id, asset_id, units, avg_buy_price, current_value)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertHold.run('hld_01', 'usr_01', 'ast_05', 40.0, 480.00, 40.0 * 524.80);
  insertHold.run('hld_02', 'usr_01', 'ast_08', 25.0, 395.00, 25.0 * 428.10);
  insertHold.run('hld_03', 'usr_01', 'ast_07', 30.0, 210.00, 30.0 * 234.50);
  insertHold.run('hld_04', 'usr_01', 'ast_04', 80.0, 80.00, 80.0 * 88.50);

  console.log('Smart Investment Advisor database successfully seeded with normalized 8-table schema & Slide 9/14 metrics.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
