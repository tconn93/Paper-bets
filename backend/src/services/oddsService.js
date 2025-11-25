import axios from "axios";
import { AppError } from "../errors.js";

export class OddsService {
  static API_KEY = process.env.ODDS_API_KEY;
  static BASE_URL =
    process.env.ODDS_API_BASE_URL || "https://api.the-odds-api.com/v4";
  static DEFAULT_BOOKMAKER = "draftkings"; // Preferred bookmaker

  static async getSports() {
    try {
      const response = await axios.get(`${this.BASE_URL}/sports`, {
        params: {
          apiKey: this.API_KEY,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Odds API Error:", error.response?.data);
        throw new AppError(
          error.response?.data?.message || "Failed to fetch sports",
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  static async getOdds(sportKey, markets = "h2h,spreads,totals") {
    try {
      if (!this.API_KEY) {
        throw new AppError("Odds API key not configured", 500);
      }

      const response = await axios.get(
        `${this.BASE_URL}/sports/${sportKey}/odds`,
        {
          params: {
            apiKey: this.API_KEY,
            regions: "us",
            markets: markets,
            oddsFormat: "american",
            bookmakers: this.DEFAULT_BOOKMAKER,
          },
        },
      );

      const games = response.data;
      return games.map((game) => this.formatGame(game));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Odds API Error:", error.response?.data);

        if (error.response?.status === 401) {
          throw new AppError("Invalid Odds API key", 500);
        }

        if (error.response?.status === 429) {
          throw new AppError("Odds API rate limit exceeded", 429);
        }

        throw new AppError(
          error.response?.data?.message || "Failed to fetch odds",
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  static async getEventOdds(sportKey, eventId) {
    try {
      if (!this.API_KEY) {
        throw new AppError("Odds API key not configured", 500);
      }

      const response = await axios.get(
        `${this.BASE_URL}/sports/${sportKey}/events/${eventId}/odds`,
        {
          params: {
            apiKey: this.API_KEY,
            regions: "us",
            markets: "h2h,spreads,totals",
            oddsFormat: "american",
            bookmakers: this.DEFAULT_BOOKMAKER,
          },
        },
      );

      return this.formatGame(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Odds API Error:", error.response?.data);

        if (error.response?.status === 404) {
          throw new AppError("Event not found", 404);
        }

        throw new AppError(
          error.response?.data?.message || "Failed to fetch event odds",
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  static formatGame(game) {
    const formatted = {
      id: game.id,
      sport_key: game.sport_key,
      sport_title: game.sport_title,
      commence_time: game.commence_time,
      home_team: game.home_team,
      away_team: game.away_team,
      odds: {},
    };

    // Get the first bookmaker (we filtered by preferred bookmaker)
    const bookmaker = game.bookmakers[0];

    if (!bookmaker) {
      return formatted;
    }

    // Process each market type
    bookmaker.markets.forEach((market) => {
      if (market.key === "h2h") {
        const homeOutcome = market.outcomes.find(
          (o) => o.name === game.home_team,
        );
        const awayOutcome = market.outcomes.find(
          (o) => o.name === game.away_team,
        );

        if (homeOutcome && awayOutcome) {
          formatted.odds.h2h = {
            home: homeOutcome.price,
            away: awayOutcome.price,
          };
        }
      } else if (market.key === "spreads") {
        const homeOutcome = market.outcomes.find(
          (o) => o.name === game.home_team,
        );
        const awayOutcome = market.outcomes.find(
          (o) => o.name === game.away_team,
        );

        if (
          homeOutcome &&
          awayOutcome &&
          homeOutcome.point !== undefined &&
          awayOutcome.point !== undefined
        ) {
          formatted.odds.spreads = {
            home: {
              point: homeOutcome.point,
              price: homeOutcome.price,
            },
            away: {
              point: awayOutcome.point,
              price: awayOutcome.price,
            },
          };
        }
      } else if (market.key === "totals") {
        const overOutcome = market.outcomes.find((o) => o.name === "Over");
        const underOutcome = market.outcomes.find((o) => o.name === "Under");

        if (
          overOutcome &&
          underOutcome &&
          overOutcome.point !== undefined &&
          underOutcome.point !== undefined
        ) {
          formatted.odds.totals = {
            over: {
              point: overOutcome.point,
              price: overOutcome.price,
            },
            under: {
              point: underOutcome.point,
              price: underOutcome.price,
            },
          };
        }
      }
    });

    return formatted;
  }

  static calculatePotentialWin(odds, stake) {
    // Convert American odds to decimal and calculate potential win
    let decimalOdds;

    if (odds > 0) {
      // Positive American odds
      decimalOdds = odds / 100 + 1;
    } else {
      // Negative American odds
      decimalOdds = 100 / Math.abs(odds) + 1;
    }

    // Potential win = (stake * decimal odds) - stake
    const potentialWin = stake * decimalOdds;

    return Math.round(potentialWin * 100) / 100;
  }

  static calculateProfit(odds, stake) {
    const potentialWin = this.calculatePotentialWin(odds, stake);
    return potentialWin - stake;
  }
}
