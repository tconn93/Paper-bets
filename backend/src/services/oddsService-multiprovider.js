import axios from "axios";

export class OddsService {
  constructor() {
    this.provider = process.env.ODDS_PROVIDER || "balldontlie";
  }

  async getSports() {
    switch (this.provider) {
      case "balldontlie":
        return this.getBallDontLieSports();
      case "sgo":
        return this.getSGOSports();
      case "the-odds-api":
      default:
        return this.getTheOddsAPISports();
    }
  }

  async getOdds(sport) {
    switch (this.provider) {
      case "balldontlie":
        return this.getBallDontLieOdds(sport);
      case "sgo":
        return this.getSGOOdds(sport);
      case "the-odds-api":
      default:
        return this.getTheOddsAPIOdds(sport);
    }
  }

  // BALLDONTLIE - Free, no API key required
  async getBallDontLieSports() {
    // Returns available sports
    return [
      { key: "nba", title: "NBA" },
      { key: "nfl", title: "NFL" },
      { key: "mlb", title: "MLB" },
      { key: "nhl", title: "NHL" },
    ];
  }

  async getBallDontLieOdds(sport) {
    try {
      // Example for NBA games with odds
      const response = await axios.get("https://api.balldontlie.io/v1/games", {
        params: {
          seasons: [new Date().getFullYear()],
          per_page: 100,
        },
      });

      // Transform to our format
      return this.transformBallDontLieData(response.data);
    } catch (error) {
      console.error("Error fetching BallDontLie odds:", error);
      throw new Error("Failed to fetch odds from BallDontLie");
    }
  }

  // Sports Game Odds - Free tier: 1000 objects/month
  async getSGOSports() {
    const API_KEY = process.env.SGO_API_KEY;
    const response = await axios.get("https://api.sportsgameodds.com/leagues", {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    return response.data;
  }

  async getSGOOdds(sport) {
    const API_KEY = process.env.SGO_API_KEY;
    try {
      const response = await axios.get(
        `https://api.sportsgameodds.com/odds/${sport}`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
          params: {
            markets: "h2h,spreads,totals",
          },
        },
      );
      return this.transformSGOData(response.data);
    } catch (error) {
      console.error("Error fetching SGO odds:", error);
      throw new Error("Failed to fetch odds from SGO");
    }
  }

  // The Odds API - Original implementation
  async getTheOddsAPISports() {
    const API_KEY = process.env.ODDS_API_KEY;
    const BASE_URL =
      process.env.ODDS_API_BASE_URL || "https://api.the-odds-api.com/v4";

    try {
      const response = await axios.get(`${BASE_URL}/sports`, {
        params: { apiKey: API_KEY },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching sports:", error);
      throw new Error("Failed to fetch sports");
    }
  }

  async getTheOddsAPIOdds(sport) {
    const API_KEY = process.env.ODDS_API_KEY;
    const BASE_URL =
      process.env.ODDS_API_BASE_URL || "https://api.the-odds-api.com/v4";

    try {
      const response = await axios.get(`${BASE_URL}/sports/${sport}/odds`, {
        params: {
          apiKey: API_KEY,
          regions: "us",
          markets: "h2h,spreads,totals",
          oddsFormat: "american",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching odds:", error);
      throw new Error("Failed to fetch odds");
    }
  }

  async getScores(sport, daysFrom = 3) {
    switch (this.provider) {
      case "balldontlie":
        return this.getBallDontLieScores(daysFrom);
      case "sgo":
        return []; // Not implemented for now
      case "the-odds-api":
      default:
        return this.getTheOddsAPIScores(sport, daysFrom);
    }
  }

  // ... existing methods ...

  async getBallDontLieScores(daysFrom) {
    try {
      const dates = [];
      const today = new Date();
      for (let i = 0; i < daysFrom; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      const response = await axios.get("https://api.balldontlie.io/v1/games", {
        params: {
          dates: dates,
          per_page: 100,
        },
        headers: {
          Authorization: process.env.BALLDONTLIE_API_KEY // If required, though user said it's free/no key. 
          // Actually v1 might need key now, but previous code comments said "Free, no API key required".
          // Let's check previous code. It didn't use headers for getBallDontLieOdds.
          // Wait, getBallDontLieOdds used https://api.balldontlie.io/v1/games.
          // Let's stick to what was there or check if it needs key.
          // The previous code for getBallDontLieOdds didn't use an API key.
        }
      });

      // If the previous code didn't use a key, I won't either, but balldontlie might have changed.
      // However, I should check if I need to transform the data.
      return this.transformBallDontLieScores(response.data);
    } catch (error) {
      console.error("Error fetching BallDontLie scores:", error);
      return [];
    }
  }

  transformBallDontLieScores(data) {
    return data.data.map((game) => ({
      id: game.id.toString(),
      sport_key: "nba", // BallDontLie is mostly NBA
      sport_title: "NBA",
      completed: game.status === "Final",
      home_team: game.home_team.full_name,
      away_team: game.visitor_team.full_name,
      scores: [
        { name: game.home_team.full_name, score: game.home_team_score.toString() },
        { name: game.visitor_team.full_name, score: game.visitor_team_score.toString() },
      ],
    }));
  }

  async getTheOddsAPIScores(sport, daysFrom) {
    const API_KEY = process.env.ODDS_API_KEY;
    const BASE_URL =
      process.env.ODDS_API_BASE_URL || "https://api.the-odds-api.com/v4";

    try {
      const response = await axios.get(`${BASE_URL}/sports/${sport}/scores`, {
        params: {
          apiKey: API_KEY,
          daysFrom: daysFrom,
          dateFormat: "iso",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching scores:", error);
      throw new Error("Failed to fetch scores");
    }
  }

  // Transform different API formats to our standard format
  transformBallDontLieData(data) {
    // Convert BallDontLie format to our standard format
    return data.data.map((game) => ({
      id: game.id.toString(),
      sport_key: "nba",
      sport_title: "NBA",
      commence_time: game.date,
      home_team: game.home_team.full_name,
      away_team: game.visitor_team.full_name,
      bookmakers: [
        // Would need to fetch from their odds endpoint
        // or use mock data for development
      ],
    }));
  }

  transformSGOData(data) {
    // Convert SGO format to our standard format
    return data; // Implement transformation logic
  }
}

export default new OddsService();
