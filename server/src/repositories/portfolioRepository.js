import { db } from '../db/connection.js';

export class PortfolioRepository {
  findHoldingsByUser(userId = 'usr_01') {
    const stmt = db.prepare(`
      SELECT 
        ph.holding_id,
        ph.user_id,
        ph.asset_id,
        ph.units,
        ph.avg_buy_price,
        (ph.units * a.current_price) AS current_value,
        ((ph.units * a.current_price) - (ph.units * ph.avg_buy_price)) AS unrealized_gain,
        ROUND((((a.current_price - ph.avg_buy_price) / ph.avg_buy_price) * 100), 2) AS return_pct,
        a.ticker,
        a.name AS asset_name,
        a.asset_class,
        a.risk_level,
        a.current_price,
        ms.sector_name
      FROM portfolio_holdings ph
      JOIN assets a ON ph.asset_id = a.asset_id
      JOIN market_sectors ms ON a.sector_id = ms.sector_id
      WHERE ph.user_id = ?
    `);
    return stmt.all(userId);
  }

  recordTransaction(userId, assetId, units, price) {
    const holding = db.prepare('SELECT * FROM portfolio_holdings WHERE user_id = ? AND asset_id = ?').get(userId, assetId);
    if (holding) {
      const newUnits = holding.units + units;
      const totalCost = (holding.units * holding.avg_buy_price) + (units * price);
      const newAvg = totalCost / newUnits;
      const stmt = db.prepare(`
        UPDATE portfolio_holdings 
        SET units = ?, avg_buy_price = ?, current_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE holding_id = ?
      `);
      stmt.run(newUnits, newAvg, newUnits * price, holding.holding_id);
    } else {
      const holdingId = `hld_${Date.now()}`;
      const stmt = db.prepare(`
        INSERT INTO portfolio_holdings (holding_id, user_id, asset_id, units, avg_buy_price, current_value)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(holdingId, userId, assetId, units, price, units * price);
    }
    return this.findHoldingsByUser(userId);
  }
}

export const portfolioRepository = new PortfolioRepository();
