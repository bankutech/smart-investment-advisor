import { db } from '../db/connection.js';

export class AssetRepository {
  findAll() {
    const stmt = db.prepare(`
      SELECT a.*, ms.sector_name, ms.risk_tier,
             ap.annual_return_pct, ap.cagr_3yr, ap.cagr_5yr, ap.sharpe_ratio, ap.beta
      FROM assets a
      JOIN market_sectors ms ON a.sector_id = ms.sector_id
      LEFT JOIN asset_performance ap ON a.asset_id = ap.asset_id AND ap.year = 2025
      ORDER BY a.name ASC
    `);
    return stmt.all();
  }

  findById(id) {
    const stmt = db.prepare(`
      SELECT a.*, ms.sector_name, ms.risk_tier,
             ap.annual_return_pct, ap.cagr_3yr, ap.cagr_5yr, ap.sharpe_ratio, ap.beta
      FROM assets a
      JOIN market_sectors ms ON a.sector_id = ms.sector_id
      LEFT JOIN asset_performance ap ON a.asset_id = ap.asset_id AND ap.year = 2025
      WHERE a.asset_id = ?
    `);
    return stmt.get(id);
  }
}

export const assetRepository = new AssetRepository();
