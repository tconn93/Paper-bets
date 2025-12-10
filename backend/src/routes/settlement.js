import { Router } from "express";
import { SettlementController } from "../controllers/settlementController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @route   POST /api/settlement
 * @desc    Trigger bet settlement process
 * @access  Private (should be admin only)
 */
router.post("/", authenticate, SettlementController.triggerSettlement);

export default router;
