import { BetService } from "./betService.js";
import OddsService from "./oddsService-multiprovider.js";
import { WebScraperService } from "./webScraperService.js";
import { query } from "../database/db.js";

export class SettlementService {
    static async processSettlements() {
        const client = await query(
            "SELECT DISTINCT sport_key FROM bets WHERE status = 'pending'"
        );
        const sports = client.rows.map((row) => row.sport_key);
        let settledCount = 0;
        let settledByIdCount = 0;
        let settledByTeamMatchCount = 0;
        let settledByFallbackCount = 0;

        for (const sport of sports) {
            try {
                // Try to fetch scores from odds API first
                let scores = await OddsService.getScores(sport, 10); // Look back 10 days

                // If no scores from API, try web scraper
                if (!scores || scores.length === 0) {
                    console.log(`No scores from API for ${sport}, trying web scraper...`);
                    scores = await WebScraperService.getScores(sport, 10);
                }

                // Get pending bets for this sport
                const pendingBetsResult = await query(
                    "SELECT * FROM bets WHERE status = 'pending' AND sport_key = $1",
                    [sport]
                );
                const pendingBets = pendingBetsResult.rows;

                for (const bet of pendingBets) {
                    let settled = false;

                    // Tier 1: Match by game_id
                    const gameById = scores.find((s) => s.id === bet.game_id);
                    if (gameById && gameById.completed) {
                        const result = this.determineBetResult(bet, gameById);
                        if (result) {
                            await BetService.settleBet(bet.id, result);
                            settledCount++;
                            settledByIdCount++;
                            settled = true;
                            console.log(`Settled bet ${bet.id} by game_id match: ${result} `);
                        }
                    }

                    // Tier 2: Match by team names and time window
                    if (!settled) {
                        const gameByTeams = this.matchGameByTeams(bet, scores);
                        if (gameByTeams && gameByTeams.completed) {
                            const result = this.determineBetResult(bet, gameByTeams);
                            if (result) {
                                await BetService.settleBet(bet.id, result);
                                settledCount++;
                                settledByTeamMatchCount++;
                                settled = true;
                                console.log(
                                    `Settled bet ${bet.id} by team name match: ${result} `
                                );
                            }
                        }
                    }

                    // Tier 3: Fallback for old games (>6 hours past commence_time)
                    if (!settled && this.shouldFallbackSettle(bet)) {
                        await BetService.settleBet(bet.id, "pushed");
                        settledCount++;
                        settledByFallbackCount++;
                        console.log(
                            `Settled bet ${bet.id} by fallback(game too old, no score found): pushed`
                        );
                    }
                }
            } catch (error) {
                console.error(`Error processing settlements for ${sport}: `, error);
            }
        }

        return {
            settledCount,
            settledByIdCount,
            settledByTeamMatchCount,
            settledByFallbackCount,
        };
    }

    static matchGameByTeams(bet, scores) {
        const commenceTime = new Date(bet.commence_time);
        const threeHoursMs = 3 * 60 * 60 * 1000;

        return scores.find((game) => {
            const gameTime = new Date(game.commence_time || game.start_time);
            const timeDiff = Math.abs(gameTime - commenceTime);

            // Match if teams match and time is within 3 hours
            const teamsMatch =
                (game.home_team === bet.home_team &&
                    game.away_team === bet.away_team) ||
                (game.home_team.includes(bet.home_team.split(" ").pop()) &&
                    game.away_team.includes(bet.away_team.split(" ").pop()));

            return teamsMatch && timeDiff < threeHoursMs;
        });
    }

    static shouldFallbackSettle(bet) {
        const commenceTime = new Date(bet.commence_time);
        const now = new Date();
        const sixHoursMs = 6 * 60 * 60 * 1000;

        return now - commenceTime > sixHoursMs;
    }

    static determineBetResult(bet, game) {
        if (!game.scores) return null;

        const homeScore = parseInt(
            game.scores.find((s) => s.name === game.home_team)?.score
        );
        const awayScore = parseInt(
            game.scores.find((s) => s.name === game.away_team)?.score
        );

        if (isNaN(homeScore) || isNaN(awayScore)) return null;

        switch (bet.bet_type) {
            case "h2h":
                return this.resolveH2H(bet, homeScore, awayScore);
            case "spreads":
                // Spreads logic would be more complex, needing the spread value from the bet
                // For now, returning null as spread value isn't stored in the simplified schema shown
                // Assuming 'selected_team' might contain spread info or it's just moneyline for now
                return null;
            case "totals":
                // Totals logic needing over/under value
                return null;
            default:
                return null;
        }
    }

    static resolveH2H(bet, homeScore, awayScore) {
        if (bet.selected_team === bet.home_team) {
            return homeScore > awayScore ? "won" : "lost";
        } else if (bet.selected_team === bet.away_team) {
            return awayScore > homeScore ? "won" : "lost";
        }
        return "lost"; // Should not happen if data is consistent
    }
}
