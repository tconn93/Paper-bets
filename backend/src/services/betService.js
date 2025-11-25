import { query, getClient } from "../database/db.js";
import { AppError } from "../errors.js";
import { AuthService } from "./authService.js";
import { OddsService } from "./oddsService.js";

export class BetService {
  static async placeBet(userId, input) {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Validate bet input
      if (input.stake <= 0) {
        throw new AppError("Stake must be greater than 0", 400);
      }

      if (input.odds === 0) {
        throw new AppError("Invalid odds", 400);
      }

      // Check user balance
      const userBalance = await AuthService.getBalance(userId);

      if (userBalance < input.stake) {
        throw new AppError("Insufficient balance", 400);
      }

      // Calculate potential win
      const potentialWin = OddsService.calculatePotentialWin(
        input.odds,
        input.stake,
      );

      // Create bet
      const betResult = await client.query(
        `INSERT INTO bets (
          user_id, game_id, sport_key, sport_title, commence_time,
          home_team, away_team, bet_type, selected_team, odds,
          stake, potential_win, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          userId,
          input.game_id,
          input.sport_key,
          input.sport_title,
          input.commence_time,
          input.home_team,
          input.away_team,
          input.bet_type,
          input.selected_team,
          input.odds,
          input.stake,
          potentialWin,
          "pending",
        ],
      );

      const bet = betResult.rows[0];

      // Deduct stake from user balance
      const newBalance = await client.query(
        "UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance",
        [input.stake, userId],
      );

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (user_id, bet_id, type, amount, balance_after, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          bet.id,
          "bet_placed",
          -input.stake,
          newBalance.rows[0].balance,
          `Bet placed on ${input.selected_team}`,
        ],
      );

      await client.query("COMMIT");

      return {
        ...bet,
        stake: parseFloat(bet.stake),
        potential_win: parseFloat(bet.potential_win),
        odds: parseFloat(bet.odds),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserBets(userId, status) {
    let queryText = "SELECT * FROM bets WHERE user_id = $1";
    const params = [userId];

    if (status) {
      queryText += " AND status = $2";
      params.push(status);
    }

    queryText += " ORDER BY created_at DESC";

    const result = await query(queryText, params);

    return result.rows.map((bet) => ({
      ...bet,
      stake: parseFloat(bet.stake),
      potential_win: parseFloat(bet.potential_win),
      odds: parseFloat(bet.odds),
    }));
  }

  static async getBetById(betId, userId) {
    const result = await query(
      "SELECT * FROM bets WHERE id = $1 AND user_id = $2",
      [betId, userId],
    );

    if (result.rows.length === 0) {
      throw new AppError("Bet not found", 404);
    }

    const bet = result.rows[0];

    return {
      ...bet,
      stake: parseFloat(bet.stake),
      potential_win: parseFloat(bet.potential_win),
      odds: parseFloat(bet.odds),
    };
  }

  static async settleBet(betId, result) {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Get bet details
      const betResult = await client.query("SELECT * FROM bets WHERE id = $1", [
        betId,
      ]);

      if (betResult.rows.length === 0) {
        throw new AppError("Bet not found", 404);
      }

      const bet = betResult.rows[0];

      if (bet.status !== "pending") {
        throw new AppError("Bet already settled", 400);
      }

      // Update bet status
      const updatedBet = await client.query(
        `UPDATE bets
         SET status = $1, result = $2, settled_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [result, result, betId],
      );

      const settledBet = updatedBet.rows[0];
      let transactionAmount = 0;
      let transactionType = "bet_lost";
      let description = "";

      // Handle different bet results
      if (result === "won") {
        transactionAmount = parseFloat(settledBet.potential_win.toString());
        transactionType = "bet_won";
        description = `Bet won on ${settledBet.selected_team}`;
      } else if (result === "pushed" || result === "cancelled") {
        transactionAmount = parseFloat(settledBet.stake.toString());
        transactionType = "bet_refund";
        description = `Bet ${result} - stake refunded`;
      } else {
        transactionAmount = 0;
        transactionType = "bet_lost";
        description = `Bet lost on ${settledBet.selected_team}`;
      }

      // Update user balance if won or refunded
      if (transactionAmount > 0) {
        const newBalance = await client.query(
          "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance",
          [transactionAmount, bet.user_id],
        );

        // Create transaction record
        await client.query(
          `INSERT INTO transactions (user_id, bet_id, type, amount, balance_after, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            bet.user_id,
            betId,
            transactionType,
            transactionAmount,
            newBalance.rows[0].balance,
            description,
          ],
        );
      } else {
        // Create transaction record for loss (no balance change)
        const currentBalance = await client.query(
          "SELECT balance FROM users WHERE id = $1",
          [bet.user_id],
        );

        await client.query(
          `INSERT INTO transactions (user_id, bet_id, type, amount, balance_after, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            bet.user_id,
            betId,
            transactionType,
            0,
            currentBalance.rows[0].balance,
            description,
          ],
        );
      }

      await client.query("COMMIT");

      return {
        ...settledBet,
        stake: parseFloat(settledBet.stake),
        potential_win: parseFloat(settledBet.potential_win),
        odds: parseFloat(settledBet.odds),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserStats(userId) {
    const statsResult = await query(
      `SELECT
        COUNT(*) as total_bets,
        COUNT(*) FILTER (WHERE status = 'pending') as active_bets,
        COUNT(*) FILTER (WHERE result = 'won') as won_bets,
        COUNT(*) FILTER (WHERE result = 'lost') as lost_bets,
        COALESCE(SUM(stake), 0) as total_wagered,
        COALESCE(SUM(potential_win) FILTER (WHERE result = 'won'), 0) as total_winnings
       FROM bets
       WHERE user_id = $1`,
      [userId],
    );

    const stats = statsResult.rows[0];

    const totalBets = parseInt(stats.total_bets);
    const wonBets = parseInt(stats.won_bets);
    const lostBets = parseInt(stats.lost_bets);
    const totalWagered = parseFloat(stats.total_wagered);
    const totalWinnings = parseFloat(stats.total_winnings);

    // Calculate net profit (winnings - total wagered)
    const netProfit = totalWinnings - totalWagered;

    // Calculate win rate (won bets / settled bets)
    const settledBets = wonBets + lostBets;
    const winRate = settledBets > 0 ? (wonBets / settledBets) * 100 : 0;

    return {
      total_bets: totalBets,
      active_bets: parseInt(stats.active_bets),
      won_bets: wonBets,
      lost_bets: lostBets,
      total_wagered: totalWagered,
      total_winnings: totalWinnings,
      net_profit: netProfit,
      win_rate: Math.round(winRate * 100) / 100,
    };
  }

  static async getUserTransactions(userId) {
    const result = await query(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );

    return result.rows.map((transaction) => ({
      ...transaction,
      amount: parseFloat(transaction.amount),
      balance_after: parseFloat(transaction.balance_after),
    }));
  }

  static async cancelBet(betId, userId) {
    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Get bet details
      const betResult = await client.query(
        "SELECT * FROM bets WHERE id = $1 AND user_id = $2",
        [betId, userId],
      );

      if (betResult.rows.length === 0) {
        throw new AppError("Bet not found", 404);
      }

      const bet = betResult.rows[0];

      if (bet.status !== "pending") {
        throw new AppError("Can only cancel pending bets", 400);
      }

      // Check if game has already started
      const commenceTime = new Date(bet.commence_time);
      const now = new Date();

      if (commenceTime <= now) {
        throw new AppError("Cannot cancel bet after game has started", 400);
      }

      // Update bet status to cancelled
      const cancelledBet = await client.query(
        `UPDATE bets
         SET status = 'cancelled', result = 'cancelled', settled_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [betId],
      );

      // Refund stake to user
      const newBalance = await client.query(
        "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance",
        [bet.stake, userId],
      );

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (user_id, bet_id, type, amount, balance_after, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          betId,
          "bet_refund",
          bet.stake,
          newBalance.rows[0].balance,
          "Bet cancelled - stake refunded",
        ],
      );

      await client.query("COMMIT");

      const result = cancelledBet.rows[0];

      return {
        ...result,
        stake: parseFloat(result.stake),
        potential_win: parseFloat(result.potential_win),
        odds: parseFloat(result.odds),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
