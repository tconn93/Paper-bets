import { Request, Response, NextFunction } from 'express';
import { OddsService } from '../services/oddsService';
import { AuthRequest } from '../types';

export class OddsController {
  static async getSports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sports = await OddsService.getSports();

      res.status(200).json({
        success: true,
        data: sports,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOdds(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sportKey } = req.params;
      const { markets } = req.query;

      if (!sportKey) {
        res.status(400).json({
          success: false,
          error: 'Sport key is required',
        });
        return;
      }

      const odds = await OddsService.getOdds(
        sportKey,
        markets as string | undefined
      );

      res.status(200).json({
        success: true,
        data: odds,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEventOdds(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sportKey, eventId } = req.params;

      if (!sportKey || !eventId) {
        res.status(400).json({
          success: false,
          error: 'Sport key and event ID are required',
        });
        return;
      }

      const odds = await OddsService.getEventOdds(sportKey, eventId);

      res.status(200).json({
        success: true,
        data: odds,
      });
    } catch (error) {
      next(error);
    }
  }

  static async calculatePotentialWin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { odds, stake } = req.body;

      if (typeof odds !== 'number' || typeof stake !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Odds and stake must be numbers',
        });
        return;
      }

      if (stake <= 0) {
        res.status(400).json({
          success: false,
          error: 'Stake must be greater than 0',
        });
        return;
      }

      const potentialWin = OddsService.calculatePotentialWin(odds, stake);
      const profit = OddsService.calculateProfit(odds, stake);

      res.status(200).json({
        success: true,
        data: {
          stake,
          odds,
          potentialWin,
          profit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
