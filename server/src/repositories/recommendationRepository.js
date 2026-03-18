import { db } from '../db/connection.js';

export class RecommendationRepository {
  findSuggestionsByCategory(categoryId) {
    const stmt = db.prepare(`
      SELECT * FROM v_category_recommendations 
      WHERE category_id = ? 
      ORDER BY priority ASC
    `);
    return stmt.all(categoryId);
  }

  findAllCategories() {
    const stmt = db.prepare('SELECT * FROM risk_categories ORDER BY min_score ASC');
    return stmt.all();
  }

  getSectorBreakdown(categoryId) {
    const stmt = db.prepare(`
      SELECT 
        ms.sector_id,
        ms.sector_name,
        ms.risk_tier,
        SUM(cs.allocation_weight_pct) AS total_allocation_pct,
        COUNT(cs.asset_id) AS asset_count,
        ROUND(AVG(ap.return_1_month), 2) AS avg_return_1_month,
        ROUND(AVG(ap.return_1_year), 2) AS avg_return_1_year,
        ROUND(AVG(ap.return_3_years), 2) AS avg_return_3_years,
        ROUND(AVG(ap.cagr_5yr), 2) AS avg_cagr_5yr
      FROM category_suggestions cs
      JOIN assets a ON cs.asset_id = a.asset_id
      JOIN market_sectors ms ON a.sector_id = ms.sector_id
      JOIN asset_performance ap ON a.asset_id = ap.asset_id
      WHERE cs.category_id = ?
      GROUP BY ms.sector_id, ms.sector_name, ms.risk_tier
      ORDER BY total_allocation_pct DESC;
    `);
    return stmt.all(categoryId);
  }

  executeSlide14Query(categoryId = 'cat_long') {
    const stmt = db.prepare(`
      SELECT 
        a.name AS asset_name, 
        a.asset_class AS asset_type, 
        ms.sector_name AS sector, 
        ap.historical_return, 
        ap.return_1_month,
        ap.return_1_year,
        ap.return_3_years,
        cs.investment_rationale AS rationale, 
        cs.priority AS rank_order
      FROM category_suggestions cs
      JOIN assets a ON a.asset_id = cs.asset_id
      JOIN market_sectors ms ON a.sector_id = ms.sector_id
      JOIN asset_performance ap ON ap.asset_id = a.asset_id
      WHERE cs.category_id = ?
      ORDER BY cs.priority ASC;
    `);
    return stmt.all(categoryId);
  }

  getSchemaDiagram() {
    const tables = ['users', 'user_profiles', 'risk_categories', 'user_categories', 'market_sectors', 'assets', 'asset_performance', 'category_suggestions', 'portfolio_holdings'];
    const schema = {};

    for (const table of tables) {
      const columns = db.prepare(`PRAGMA table_info(${table})`).all();
      const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${table})`).all();
      schema[table] = { columns, foreignKeys };
    }

    return schema;
  }
}

export const recommendationRepository = new RecommendationRepository();
