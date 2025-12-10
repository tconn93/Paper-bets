import { body, validationResult } from "express-validator";
import { BetService } from "../services/betService.js";
import { SettlementService } from "../services/settlementService.js";
import { AppError } from "../errors.js";

export class BetController {
  static placeBetValidation = [
    body("game_id").notEmpty().withMessage("Game ID is required"),
    body("sport_key").notEmpty().withMessage("Sport key is required"),
    body("sport_title").notEmpty().withMessage("Sport title is required"),
    body("commence_time").notEmpty().withMessage("Commence time is required"),
    body("home_team").notEmpty().withMessage("Home team is required"),
    body("away_team").notEmpty().withMessage("Away team is required"),
    body("bet_type")
      .isIn(["h2h", "spreads", "totals"])
      .withMessage("Invalid bet type"),
    body("selected_team").notEmpty().withMessage("Selected team is required"),
    body("odds").isNumeric().withMessage("Odds must be a number"),
    body("stake")
      .isNumeric()
      .withMessage("Stake must be a number")
      .custom((value) => value > 0)
      .withMessage("Stake must be greater than 0"),
  ];

  static async placeBet(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const input = {
        game_id: req.body.game_id,
        sport_key: req.body.sport_key,
        sport_title: req.body.sport_title,
        commence_time: req.body.commence_time,
        home_team: req.body.home_team,
        away_team: req.body.away_team,
        bet_type: req.body.bet_type,
        selected_team: req.body.selected_team,
        odds: parseFloat(req.body.odds),
        stake: parseFloat(req.body.stake),
      };

      const bet = await BetService.placeBet(req.user.id, input);

      res.status(201).json({
        success: true,
        data: bet,
        message: "Bet placed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserBets(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      // Trigger settlement asynchronously (non-blocking)
      SettlementService.processSettlements()
        .then((settlementResult) => {
          if (settlementResult.settledCount > 0) {
            console.log(
              `Auto-settlement on view bets: ${settlementResult.settledCount} bets settled`
            );
          }
        })
        .catch((error) => {
          console.error("Auto-settlement error on view bets:", error);
        });

      const { status } = req.query;
      const bets = await BetService.getUserBets(req.user.id, status);

      res.status(200).json({
        success: true,
        data: bets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBetById(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const { betId } = req.params;

      if (!betId) {
        res.status(400).json({
          success: false,
          error: "Bet ID is required",
        });
        return;
      }

      const bet = await BetService.getBetById(betId, req.user.id);

      res.status(200).json({
        success: true,
        data: bet,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserStats(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const stats = await BetService.getUserStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserTransactions(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const transactions = await BetService.getUserTransactions(req.user.id);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelBet(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
        return;
      }

      const { betId } = req.params;

      if (!betId) {
        res.status(400).json({
          success: false,
          error: "Bet ID is required",
        });
        return;
      }

      const bet = await BetService.cancelBet(betId, req.user.id);

      res.status(200).json({
        success: true,
        data: bet,
        message: "Bet cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin function to settle bets (would need admin auth in production)
  static async settleBet(req, res, next) {
    try {
      const { betId } = req.params;
      const { result } = req.body;

      if (!betId) {
        res.status(400).json({
          success: false,
          error: "Bet ID is required",
        });
        return;
      }

      if (!["won", "lost", "pushed", "cancelled"].includes(result)) {
        res.status(400).json({
          success: false,
          error: "Invalid result. Must be won, lost, pushed, or cancelled",
        });
        return;
      }

      const bet = await BetService.settleBet(betId, result);

      res.status(200).json({
        success: true,
        data: bet,
        message: "Bet settled successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
