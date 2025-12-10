import { SettlementService } from "../src/services/settlementService.js";
import { OddsService } from "../src/services/oddsService-multiprovider.js";
import { BetService } from "../src/services/betService.js";
import { query } from "../src/database/db.js";

// Mock OddsService.getScores
OddsService.getScores = async (sport, daysFrom) => {
    console.log(`Mock fetching scores for ${sport}`);
    return [
        {
            id: "test_game_1",
            sport_key: "nba",
            sport_title: "NBA",
            completed: true,
            home_team: "Lakers",
            away_team: "Warriors",
            scores: [
                { name: "Lakers", score: "110" },
                { name: "Warriors", score: "105" },
            ],
        },
    ];
};

async function runTest() {
    try {
        console.log("Starting settlement test...");

        // 1. Create a test user
        const userResult = await query(
            "INSERT INTO users (email, password, username, balance) VALUES ($1, $2, $3, $4) RETURNING id",
            ["test_settle@example.com", "password", "test_settle", 1000]
        );
        const userId = userResult.rows[0].id;
        console.log(`Created test user: ${userId}`);

        // 2. Place a winning bet
        const winBetInput = {
            game_id: "test_game_1",
            sport_key: "nba",
            sport_title: "NBA",
            commence_time: new Date().toISOString(),
            home_team: "Lakers",
            away_team: "Warriors",
            bet_type: "h2h",
            selected_team: "Lakers",
            odds: 2.0,
            stake: 100,
        };
        const winBet = await BetService.placeBet(userId, winBetInput);
        console.log(`Placed winning bet: ${winBet.id}`);

        // 3. Place a losing bet
        const loseBetInput = {
            ...winBetInput,
            selected_team: "Warriors",
        };
        const loseBet = await BetService.placeBet(userId, loseBetInput);
        console.log(`Placed losing bet: ${loseBet.id}`);

        // 4. Run settlement
        const result = await SettlementService.processSettlements();
        console.log("Settlement result:", result);

        // 5. Verify results
        const winBetUpdated = await BetService.getBetById(winBet.id, userId);
        const loseBetUpdated = await BetService.getBetById(loseBet.id, userId);

        console.log(`Win bet status: ${winBetUpdated.status} (Expected: won)`);
        console.log(`Lose bet status: ${loseBetUpdated.status} (Expected: lost)`);

        if (winBetUpdated.status === "won" && loseBetUpdated.status === "lost") {
            console.log("SUCCESS: Bets settled correctly");
        } else {
            console.error("FAILURE: Bets not settled correctly");
        }

        // Cleanup
        await query("DELETE FROM users WHERE id = $1", [userId]);
        console.log("Cleanup complete");

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

runTest();
