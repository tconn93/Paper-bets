#!/usr/bin/env node

/**
 * Manual Settlement Script
 * Allows manual input of game results to settle bets correctly
 * Usage: node scripts/manual-settle-bets.js
 */

import dotenv from "dotenv";
import { query, getClient } from "../src/database/db.js";
import pool from "../src/database/db.js";
import readline from "readline";

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function settleBetManually(betId, result) {
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
            throw new Error("Bet is not pending");
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
        return { success: true, result, transactionAmount };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function manualSettlement() {
    try {
        console.log("=".repeat(50));
        console.log("Manual Bet Settlement");
        console.log("=".repeat(50));
        console.log("");

        // Get pending bets
        const result = await query(
            `SELECT id, game_id, home_team, away_team, selected_team, stake, potential_win, commence_time
       FROM bets 
       WHERE status = 'pending'
       ORDER BY commence_time DESC`,
            []
        );

        if (result.rows.length === 0) {
            console.log("No pending bets found.");
            rl.close();
            await pool.end();
            process.exit(0);
        }

        console.log(`Found ${result.rows.length} pending bet(s):\n`);

        for (let i = 0; i < result.rows.length; i++) {
            const bet = result.rows[i];
            console.log("=".repeat(50));
            console.log(`Bet ${i + 1} of ${result.rows.length}`);
            console.log("=".repeat(50));
            console.log(`Game: ${bet.home_team} vs ${bet.away_team}`);
            console.log(`Selected: ${bet.selected_team}`);
            console.log(`Stake: $${bet.stake}`);
            console.log(`Potential Win: $${bet.potential_win}`);
            console.log(`Game Date: ${bet.commence_time}`);
            console.log("");

            const answer = await askQuestion(
                "Result? (won/lost/pushed/skip): "
            );

            if (answer.toLowerCase() === "skip") {
                console.log("Skipped.\n");
                continue;
            }

            if (!["won", "lost", "pushed"].includes(answer.toLowerCase())) {
                console.log("Invalid input. Skipping this bet.\n");
                continue;
            }

            try {
                const settlement = await settleBetManually(bet.id, answer.toLowerCase());
                console.log(`✓ Bet settled as: ${settlement.result}`);
                if (settlement.transactionAmount > 0) {
                    console.log(`  Amount credited: $${settlement.transactionAmount}`);
                }
                console.log("");
            } catch (error) {
                console.error(`Error settling bet: ${error.message}\n`);
            }
        }

        console.log("=".repeat(50));
        console.log("Manual settlement complete!");
        console.log("=".repeat(50));

        rl.close();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("Error during manual settlement:", error);
        rl.close();
        await pool.end();
        process.exit(1);
    }
}

manualSettlement();
