import axios from "axios";
import * as cheerio from "cheerio";

export class WebScraperService {
    /**
     * Fetch NFL game results from ESPN
     * @param {Date} startDate - Start date for game search
     * @param {Date} endDate - End date for game search
     * @returns {Array} Array of game results
     */
    static async getNFLScores(startDate, endDate) {
        try {
            const games = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split("T")[0].replace(/-/g, "");
                const url = `https://www.espn.com/nfl/scoreboard/_/date/${dateStr}`;

                try {
                    const response = await axios.get(url, {
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        },
                    });

                    const $ = cheerio.load(response.data);

                    // ESPN uses dynamic content, so we'll look for the JSON data in the page
                    const scriptTags = $("script");
                    scriptTags.each((i, script) => {
                        const content = $(script).html();
                        if (content && content.includes("window['__espnfitt__']")) {
                            try {
                                // Extract the JSON data
                                const jsonMatch = content.match(/window\['__espnfitt__'\]=({.*?});/);
                                if (jsonMatch) {
                                    const data = JSON.parse(jsonMatch[1]);
                                    if (data.page && data.page.content && data.page.content.scoreboard) {
                                        const events = data.page.content.scoreboard.events || [];
                                        events.forEach((event) => {
                                            if (event.competitions && event.competitions[0]) {
                                                const competition = event.competitions[0];
                                                const competitors = competition.competitors || [];

                                                if (competitors.length === 2 && competition.status.type.completed) {
                                                    const homeTeam = competitors.find((c) => c.homeAway === "home");
                                                    const awayTeam = competitors.find((c) => c.homeAway === "away");

                                                    games.push({
                                                        id: event.id,
                                                        sport_key: "americanfootball_nfl",
                                                        sport_title: "NFL",
                                                        completed: true,
                                                        commence_time: event.date,
                                                        home_team: homeTeam.team.displayName,
                                                        away_team: awayTeam.team.displayName,
                                                        scores: [
                                                            {
                                                                name: homeTeam.team.displayName,
                                                                score: homeTeam.score,
                                                            },
                                                            {
                                                                name: awayTeam.team.displayName,
                                                                score: awayTeam.score,
                                                            },
                                                        ],
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            } catch (e) {
                                console.error("Error parsing ESPN data:", e);
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error fetching scores for ${dateStr}:`, error.message);
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            return games;
        } catch (error) {
            console.error("Error in getNFLScores:", error);
            return [];
        }
    }

    /**
     * Get scores for any sport (currently only NFL implemented)
     */
    static async getScores(sportKey, daysFrom = 10) {
        if (sportKey === "americanfootball_nfl") {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysFrom);

            return this.getNFLScores(startDate, endDate);
        }

        // For other sports, return empty for now
        return [];
    }
}

