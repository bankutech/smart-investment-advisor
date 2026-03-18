import { db } from '../db/connection.js';

export class UserProfileRepository {
  getUserWithProfile(userId = 'usr_01') {
    const stmt = db.prepare(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.phone,
        up.age,
        up.annual_income,
        up.monthly_savings,
        up.target_duration_years,
        up.risk_score,
        up.risk_tolerance_tier,
        rc.category_id,
        rc.category_name,
        rc.target_horizon,
        rc.expected_return_cagr
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN user_categories uc ON u.user_id = uc.user_id AND uc.is_active = 1
      LEFT JOIN risk_categories rc ON uc.category_id = rc.category_id
      WHERE u.user_id = ?
    `);
    return stmt.get(userId);
  }

  updateProfileAndClassification(userId, profileData, categoryId) {
    db.exec('BEGIN TRANSACTION;');
    try {
      const updateProfileStmt = db.prepare(`
        INSERT INTO user_profiles (profile_id, user_id, age, annual_income, monthly_savings, target_duration_years, risk_score, risk_tolerance_tier, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          age = excluded.age,
          annual_income = excluded.annual_income,
          monthly_savings = excluded.monthly_savings,
          target_duration_years = excluded.target_duration_years,
          risk_score = excluded.risk_score,
          risk_tolerance_tier = excluded.risk_tolerance_tier,
          updated_at = CURRENT_TIMESTAMP
      `);
      
      const profileId = `prf_${Date.now()}`;
      updateProfileStmt.run(
        profileId,
        userId,
        profileData.age,
        profileData.annual_income,
        profileData.monthly_savings,
        profileData.target_duration_years,
        profileData.risk_score,
        profileData.risk_tolerance_tier
      );

      // Deactivate old categories and assign new category
      db.prepare('UPDATE user_categories SET is_active = 0 WHERE user_id = ?').run(userId);
      const mappingId = `uc_${Date.now()}`;
      db.prepare(`
        INSERT INTO user_categories (mapping_id, user_id, category_id, is_active)
        VALUES (?, ?, ?, 1)
      `).run(mappingId, userId, categoryId);

      db.exec('COMMIT;');
      return this.getUserWithProfile(userId);
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
}

export const userProfileRepository = new UserProfileRepository();
