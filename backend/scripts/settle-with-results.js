#!/usr/bin/env node

/**
 * Settle Bets with Correct Results
 * Based on Google search results for game scores
 */

import dotenv from "dotenv";
import { query, getClient } from "../src/database/db.js";
import pool from "../src/database/db.js";

dotenv.config();

// Game results from Google search:
// 1. Cowboys 31 - Chiefs 28 (Nov 27, 2024)
// 2. Bengals 32 - Ravens 14 (Nov 27, 2024)
// 3. Lions 24 - Packers 14 (Nov 3, 2024)

async function settleBetWithResult(betId, result) {
    const client = await getClient();

    try {
        await client.query("BEGIN");

        const betResult = await client.query("SELECT * FROM bets WHERE id = $1", [
            betId,
        ]);

        if (betResult.rows.length === 0) {
            throw new Error("Bet not found");
        }

        const bet = betResult.rows[0];

        if (bet.status !== "pending") {
            console.log(`Bet ${betId} is not pending (status: ${bet.status}), skipping...`);
            await client.query("ROLLBACK");
            return null;
        }

        // Update bet status
        const updatedBet = await client.query(
            `UPDATE bets
       SET status = $1, result = $2, settled_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
            [result, result, betId]
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
        } else if (result === "pushed") {
            transactionAmount = parseFloat(settledBet.stake.toString());
            transactionType = "bet_refund";
            description = `Bet pushed - stake refunded`;
        } else {
            transactionAmount = 0;
            transactionType = "bet_lost";
            description = `Bet lost on ${settledBet.selected_team}`;
        }

        // Update user balance if won or refunded
        if (transactionAmount > 0) {
            const newBalance = await client.query(
                "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance",
                [transactionAmount, bet.user_id]
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
                ]
            );
        } else {
            // Create transaction record for loss (no balance change)
            const currentBalance = await client.query(
                "SELECT balance FROM users WHERE id = $1",
                [bet.user_id]
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
                ]
            );
        }

        await client.query("COMMIT");
        return { success: true, result, transactionAmount, bet: settledBet };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function settleAllBets() {
    try {
        console.log("=".repeat(50));
        console.log("Settling Bets with Correct Results");
        console.log("=".repeat(50));
        console.log("");

        // Get all pending bets
        const result = await query(
            `SELECT id, home_team, away_team, selected_team, stake, potential_win
       FROM bets 
       WHERE status = 'pending'
       ORDER BY commence_time`,
            []
        );

        if (result.rows.length === 0) {
            console.log("No pending bets found.");
            await pool.end();
            process.exit(0);
        }

        console.log(`Found ${result.rows.length} pending bet(s)\n`);

        let settledCount = 0;
        let wonCount = 0;
        let lostCount = 0;

        for (const bet of result.rows) {
            console.log(`Processing: ${bet.home_team} vs ${bet.away_team}`);
            console.log(`  Selected: ${bet.selected_team}`);
            console.log(`  Stake: $${bet.stake}, Potential Win: $${bet.potential_win}`);

            let betResult = null;

            // Determine result based on game
            if (bet.home_team === "Dallas Cowboys" && bet.away_team === "Kansas City Chiefs") {
                // Cowboys 31 - Chiefs 28 (Cowboys won)
                betResult = bet.selected_team === "Dallas Cowboys" ? "won" : "lost";
            } else if (bet.home_team === "Baltimore Ravens" && bet.away_team === "Cincinnati Bengals") {
                // Bengals 32 - Ravens 14 (Bengals won)
                betResult = bet.selected_team === "Cincinnati Bengals" ? "won" : "lost";
            } else if (bet.home_team === "Detroit Lions" && bet.away_team === "Green Bay Packers") {
                // Lions 24 - Packers 14 (Lions won)
                betResult = bet.selected_team === "Detroit Lions" ? "won" : "lost";
            }

            if (betResult) {
                const settlement = await settleBetWithResult(bet.id, betResult);
                if (settlement) {
                    console.log(`  ✓ Settled as: ${settlement.result}`);
                    if (settlement.transactionAmount > 0) {
                        console.log(`  💰 Amount credited: $${settlement.transactionAmount}`);
                    }
                    settledCount++;
                    if (betResult === "won") wonCount++;
                    else lostCount++;
                }
            } else {
                console.log(`  ⚠ Could not determine result for this game`);
            }
            console.log("");
        }

        console.log("=".repeat(50));
        console.log("Settlement Complete!");
        console.log(`Total settled: ${settledCount}`);
        console.log(`  Won: ${wonCount}`);
        console.log(`  Lost: ${lostCount}`);
        console.log("=".repeat(50));

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("Error during settlement:", error);
        await pool.end();
        process.exit(1);
    }
}

settleAllBets();
