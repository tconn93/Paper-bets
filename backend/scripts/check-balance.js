#!/usr/bin/env node

import dotenv from "dotenv";
import { query } from "../src/database/db.js";
import pool from "../src/database/db.js";

dotenv.config();

async function checkBalance() {
    try {
        console.log("=".repeat(50));
        console.log("User Balance Check");
        console.log("=".repeat(50));
        console.log("");

        // Get all users
        const users = await query("SELECT id, email, username, balance FROM users ORDER BY created_at DESC");

        console.log("Users:");
        users.rows.forEach((user) => {
            console.log(`  ${user.username} (${user.email}): $${user.balance}`);
        });
        console.log("");

        // Get recent transactions for each user
        for (const user of users.rows) {
            console.log(`Recent transactions for ${user.username}:`);
            const transactions = await query(
                `SELECT type, amount, balance_after, description, created_at 
         FROM transactions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
                [user.id]
            );

            if (transactions.rows.length === 0) {
                console.log("  No transactions found");
            } else {
                transactions.rows.forEach((tx) => {
                    console.log(`  ${tx.created_at.toISOString().split('T')[0]} - ${tx.type}: $${tx.amount} (Balance: $${tx.balance_after})`);
                    console.log(`    ${tx.description}`);
                });
            }
            console.log("");

            // Get bet status
            console.log(`Bets for ${user.username}:`);
            const bets = await query(
                `SELECT status, COUNT(*) as count, SUM(stake) as total_stake, SUM(potential_win) as total_potential
         FROM bets 
         WHERE user_id = $1 
         GROUP BY status`,
                [user.id]
            );

            bets.rows.forEach((bet) => {
                console.log(`  ${bet.status}: ${bet.count} bet(s), $${bet.total_stake} staked, $${bet.total_potential || 0} potential`);
            });
            console.log("");
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        await pool.end();
        process.exit(1);
    }
}

checkBalance();
