import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/advisor.db');

export const db = new DatabaseSync(DB_PATH);

export function initializeDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT DEFAULT 'argon2_hash_demo',
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      profile_id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      age INTEGER NOT NULL,
      monthly_income REAL NOT NULL,
      annual_income REAL NOT NULL,
      savings REAL NOT NULL,
      monthly_savings REAL NOT NULL,
      investment_goal TEXT DEFAULT 'Wealth Expansion',
      investment_duration TEXT DEFAULT 'Long Term (5-15 Yrs)',
      target_duration_years INTEGER NOT NULL,
      risk_score REAL NOT NULL,
      risk_tolerance_tier TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_categories (
      category_id TEXT PRIMARY KEY,
      category_name TEXT NOT NULL,
      target_horizon TEXT NOT NULL,
      min_score REAL NOT NULL,
      max_score REAL NOT NULL,
      expected_return_cagr REAL NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_categories (
      user_category_id TEXT PRIMARY KEY,
      mapping_id TEXT,
      user_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES risk_categories(category_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS market_sectors (
      sector_id TEXT PRIMARY KEY,
      sector_name TEXT NOT NULL,
      risk_tier TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS assets (
      asset_id TEXT PRIMARY KEY,
      ticker TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_class TEXT NOT NULL,
      sector_id TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      current_price REAL NOT NULL,
      expense_ratio REAL DEFAULT 0.15,
      dividend_yield REAL DEFAULT 1.2,
      FOREIGN KEY (sector_id) REFERENCES market_sectors(sector_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asset_performance (
      performance_id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      return_1_month REAL NOT NULL,
      return_1_year REAL NOT NULL,
      return_3_years REAL NOT NULL,
      historical_return REAL NOT NULL,
      annual_return_pct REAL NOT NULL,
      cagr_3yr REAL NOT NULL,
      cagr_5yr REAL NOT NULL,
      sharpe_ratio REAL NOT NULL,
      beta REAL NOT NULL,
      FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS category_suggestions (
      suggestion_id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      allocation_weight_pct REAL NOT NULL,
      priority INTEGER NOT NULL,
      priority_rank INTEGER NOT NULL,
      rank_order INTEGER NOT NULL,
      investment_rationale TEXT NOT NULL,
      rationale TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES risk_categories(category_id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portfolio_holdings (
      holding_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,
      units REAL NOT NULL,
      avg_buy_price REAL NOT NULL,
      current_value REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
    );
  `);

  try {
    const sugCols = db.prepare("PRAGMA table_info('category_suggestions');").all().map(c => c.name);
    if (!sugCols.includes('priority_rank')) db.exec("ALTER TABLE category_suggestions ADD COLUMN priority_rank INTEGER DEFAULT 1;");
    if (!sugCols.includes('rank_order')) db.exec("ALTER TABLE category_suggestions ADD COLUMN rank_order INTEGER DEFAULT 1;");
    if (!sugCols.includes('rationale')) db.exec("ALTER TABLE category_suggestions ADD COLUMN rationale TEXT DEFAULT '';");

    const userCols = db.prepare("PRAGMA table_info('users');").all().map(c => c.name);
    if (!userCols.includes('name')) db.exec("ALTER TABLE users ADD COLUMN name TEXT DEFAULT 'Demo User';");
    if (!userCols.includes('password')) db.exec("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'secret';");

    const profCols = db.prepare("PRAGMA table_info('user_profiles');").all().map(c => c.name);
    if (!profCols.includes('monthly_income')) db.exec("ALTER TABLE user_profiles ADD COLUMN monthly_income REAL DEFAULT 10000;");
    if (!profCols.includes('savings')) db.exec("ALTER TABLE user_profiles ADD COLUMN savings REAL DEFAULT 35000;");
    if (!profCols.includes('investment_goal')) db.exec("ALTER TABLE user_profiles ADD COLUMN investment_goal TEXT DEFAULT 'Wealth Expansion';");
    if (!profCols.includes('investment_duration')) db.exec("ALTER TABLE user_profiles ADD COLUMN investment_duration TEXT DEFAULT 'Long Term';");

    const uCatCols = db.prepare("PRAGMA table_info('user_categories');").all().map(c => c.name);
    if (!uCatCols.includes('user_category_id')) db.exec("ALTER TABLE user_categories ADD COLUMN user_category_id TEXT;");

    const perfCols = db.prepare("PRAGMA table_info('asset_performance');").all().map(c => c.name);
    if (!perfCols.includes('return_1_month')) db.exec("ALTER TABLE asset_performance ADD COLUMN return_1_month REAL DEFAULT 1.5;");
    if (!perfCols.includes('return_1_year')) db.exec("ALTER TABLE asset_performance ADD COLUMN return_1_year REAL DEFAULT 12.0;");
    if (!perfCols.includes('return_3_years')) db.exec("ALTER TABLE asset_performance ADD COLUMN return_3_years REAL DEFAULT 14.5;");
    if (!perfCols.includes('historical_return')) db.exec("ALTER TABLE asset_performance ADD COLUMN historical_return REAL DEFAULT 13.8;");

    const assetCols = db.prepare("PRAGMA table_info('assets');").all().map(c => c.name);
    if (!assetCols.includes('asset_name')) {
      db.exec("ALTER TABLE assets ADD COLUMN asset_name TEXT;");
      db.exec("UPDATE assets SET asset_name = name WHERE asset_name IS NULL;");
    }
    if (!assetCols.includes('asset_type')) {
      db.exec("ALTER TABLE assets ADD COLUMN asset_type TEXT;");
      db.exec("UPDATE assets SET asset_type = asset_class WHERE asset_type IS NULL;");
    }
  } catch (err) {}

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_asset_sector ON assets(sector_id);
    CREATE INDEX IF NOT EXISTS idx_cat_sug_cat ON category_suggestions(category_id);
    CREATE INDEX IF NOT EXISTS idx_port_user ON portfolio_holdings(user_id);
    CREATE INDEX IF NOT EXISTS idx_perf_asset ON asset_performance(asset_id);

    DROP VIEW IF EXISTS v_category_recommendations;
    CREATE VIEW v_category_recommendations AS
    SELECT 
      cs.category_id,
      rc.category_name,
      rc.target_horizon,
      cs.priority,
      cs.priority_rank,
      cs.rank_order,
      cs.allocation_weight_pct,
      cs.investment_rationale,
      cs.rationale,
      a.asset_id,
      a.ticker,
      a.name AS asset_name,
      a.asset_class,
      a.asset_type,
      a.current_price,
      a.risk_level,
      ms.sector_id,
      ms.sector_name,
      ms.risk_tier AS sector_risk_tier,
      ap.return_1_month,
      ap.return_1_year,
      ap.return_3_years,
      ap.historical_return,
      ap.cagr_3yr,
      ap.cagr_5yr,
      ap.sharpe_ratio,
      ap.beta
    FROM category_suggestions cs
    JOIN risk_categories rc ON cs.category_id = rc.category_id
    JOIN assets a ON cs.asset_id = a.asset_id
    JOIN market_sectors ms ON a.sector_id = ms.sector_id
    LEFT JOIN asset_performance ap ON a.asset_id = ap.asset_id AND ap.year = 2025;
  `);
}

initializeDatabase();
