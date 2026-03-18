import { profilingService } from '../services/profilingService.js';
import { userProfileRepository } from '../repositories/userProfileRepository.js';

export const getUserProfile = (req, res, next) => {
  try {
    const userId = req.params.userId || 'usr_01';
    const profile = userProfileRepository.getUserWithProfile(userId);
    res.json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
};

export const assessProfile = (req, res, next) => {
  try {
    const userId = req.body.userId || 'usr_01';
    const updated = profilingService.assessAndSave(userId, req.body);
    res.json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};
