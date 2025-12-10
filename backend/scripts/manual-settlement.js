#!/usr/bin/env node

/**
 * Manual Settlement Script
 * Run this to settle all pending bets immediately
 * Usage: node scripts/manual-settlement.js
 */

import dotenv from "dotenv";
import { SettlementService } from "../src/services/settlementService.js";
import pool from "../src/database/db.js";

// Load environment variables
dotenv.config();

async function runSettlement() {
    try {
        console.log("=".repeat(50));
        console.log("Manual Settlement Process");
        console.log("=".repeat(50));
        console.log("");

        console.log("Starting settlement...");
        const result = await SettlementService.processSettlements();

        console.log("");
        console.log("Settlement Results:");
        console.log("-".repeat(50));
        console.log(`Total bets settled: ${result.settledCount}`);
        console.log(`  - By game ID match: ${result.settledByIdCount}`);
        console.log(`  - By team name match: ${result.settledByTeamMatchCount}`);
        console.log(`  - By time fallback: ${result.settledByFallbackCount}`);
        console.log("-".repeat(50));
        console.log("");

        if (result.settledCount === 0) {
            console.log("No pending bets to settle.");
        } else {
            console.log(`✓ Successfully settled ${result.settledCount} bet(s)!`);
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("Error during settlement:", error);
        await pool.end();
        process.exit(1);
    }
}

runSettlement();
