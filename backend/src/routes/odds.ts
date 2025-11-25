import { Router } from 'express';
import { OddsController } from '../controllers/oddsController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/odds/sports
 * @desc    Get all available sports
 * @access  Public
 */
router.get('/sports', OddsController.getSports);

/**
 * @route   GET /api/odds/:sportKey
 * @desc    Get odds for a specific sport
 * @access  Public
 * @query   markets - Optional comma-separated list of markets (h2h,spreads,totals)
 */
router.get('/:sportKey', optionalAuth, OddsController.getOdds);

/**
 * @route   GET /api/odds/:sportKey/events/:eventId
 * @desc    Get odds for a specific event
 * @access  Public
 */
router.get('/:sportKey/events/:eventId', optionalAuth, OddsController.getEventOdds);

/**
 * @route   POST /api/odds/calculate
 * @desc    Calculate potential win for given odds and stake
 * @access  Public
 */
router.post('/calculate', OddsController.calculatePotentialWin);

export default router;
