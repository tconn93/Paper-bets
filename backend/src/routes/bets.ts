import { Router } from 'express';
import { BetController } from '../controllers/betController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/bets
 * @desc    Place a new bet
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  BetController.placeBetValidation,
  BetController.placeBet
);

/**
 * @route   GET /api/bets
 * @desc    Get all bets for authenticated user
 * @access  Private
 * @query   status - Optional filter by bet status (pending, won, lost, cancelled, pushed)
 */
router.get('/', authenticate, BetController.getUserBets);

/**
 * @route   GET /api/bets/stats
 * @desc    Get betting statistics for authenticated user
 * @access  Private
 */
router.get('/stats', authenticate, BetController.getUserStats);

/**
 * @route   GET /api/bets/transactions
 * @desc    Get transaction history for authenticated user
 * @access  Private
 */
router.get('/transactions', authenticate, BetController.getUserTransactions);

/**
 * @route   GET /api/bets/:betId
 * @desc    Get a specific bet by ID
 * @access  Private
 */
router.get('/:betId', authenticate, BetController.getBetById);

/**
 * @route   PUT /api/bets/:betId/cancel
 * @desc    Cancel a pending bet
 * @access  Private
 */
router.put('/:betId/cancel', authenticate, BetController.cancelBet);

/**
 * @route   PUT /api/bets/:betId/settle
 * @desc    Settle a bet (admin function)
 * @access  Private (should be admin only in production)
 */
router.put('/:betId/settle', authenticate, BetController.settleBet);

export default router;
