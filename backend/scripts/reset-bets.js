#!/usr/bin/env node

/**
 * Reset Bets Script
 * Resets bets that were incorrectly settled as "pushed" back to "pending"
 * Usage: node scripts/reset-bets.js
 */

import dotenv from "dotenv";
import { query } from "../src/database/db.js";
import pool from "../src/database/db.js";

dotenv.config();

async function resetBets() {
    try {
        console.log("=".repeat(50));
        console.log("Reset Bets to Pending");
        console.log("=".repeat(50));
        console.log("");

        // Find recently settled bets that were pushed
        const result = await query(
            `SELECT id, game_id, home_team, away_team, selected_team, stake, potential_win, settled_at
       FROM bets 
       WHERE status = 'pushed' 
       AND settled_at > NOW() - INTERVAL '1 hour'
       ORDER BY settled_at DESC`,
            []
        );

        if (result.rows.length === 0) {
            console.log("No recently pushed bets found to reset.");
            await pool.end();
            process.exit(0);
        }

        console.log(`Found ${result.rows.length} bet(s) to reset:\n`);
        result.rows.forEach((bet, index) => {
            console.log(`${index + 1}. ${bet.home_team} vs ${bet.away_team}`);
            console.log(`   Selected: ${bet.selected_team}`);
            console.log(`   Stake: $${bet.stake}, Potential Win: $${bet.potential_win}`);
            console.log(`   Bet ID: ${bet.id}\n`);
        });

        // Reset bets to pending
        const updateResult = await query(
            `UPDATE bets 
       SET status = 'pending', result = NULL, settled_at = NULL
       WHERE status = 'pushed' 
       AND settled_at > NOW() - INTERVAL '1 hour'`,
            []
        );

        console.log(`✓ Reset ${updateResult.rowCount} bet(s) to pending status`);
        console.log("");

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("Error resetting bets:", error);
        await pool.end();
        process.exit(1);
    }
}

resetBets();
