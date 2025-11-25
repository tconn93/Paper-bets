import axios from 'axios';

// Multi-provider odds service with fallbacks
export class OddsService {
  private provider: 'the-odds-api' | 'balldontlie' | 'sgo';

  constructor() {
    this.provider = (process.env.ODDS_PROVIDER as any) || 'balldontlie';
  }

  async getSports() {
    switch (this.provider) {
      case 'balldontlie':
        return this.getBallDontLieSports();
      case 'sgo':
        return this.getSGOSports();
      case 'the-odds-api':
      default:
        return this.getTheOddsAPISports();
    }
  }

  async getOdds(sport: string) {
    switch (this.provider) {
      case 'balldontlie':
        return this.getBallDontLieOdds(sport);
      case 'sgo':
        return this.getSGOOdds(sport);
      case 'the-odds-api':
      default:
        return this.getTheOddsAPIOdds(sport);
    }
  }

  // BALLDONTLIE - Free, no API key required
  private async getBallDontLieSports() {
    // Returns available sports
    return [
      { key: 'nba', title: 'NBA' },
      { key: 'nfl', title: 'NFL' },
      { key: 'mlb', title: 'MLB' },
      { key: 'nhl', title: 'NHL' },
    ];
  }

  private async getBallDontLieOdds(sport: string) {
    try {
      // Example for NBA games with odds
      const response = await axios.get(
        'https://api.balldontlie.io/v1/games',
        {
          params: {
            seasons: [new Date().getFullYear()],
            per_page: 100,
          },
        }
      );

      // Transform to our format
      return this.transformBallDontLieData(response.data);
    } catch (error) {
      console.error('Error fetching BallDontLie odds:', error);
      throw new Error('Failed to fetch odds from BallDontLie');
    }
  }

  // Sports Game Odds - Free tier: 1000 objects/month
  private async getSGOSports() {
    const API_KEY = process.env.SGO_API_KEY;
    const response = await axios.get('https://api.sportsgameodds.com/leagues', {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    return response.data;
  }

  private async getSGOOdds(sport: string) {
    const API_KEY = process.env.SGO_API_KEY;
    try {
      const response = await axios.get(
        `https://api.sportsgameodds.com/odds/${sport}`,
        {
          headers: { 'Authorization': `Bearer ${API_KEY}` },
          params: {
            markets: 'h2h,spreads,totals',
          },
        }
      );
      return this.transformSGOData(response.data);
    } catch (error) {
      console.error('Error fetching SGO odds:', error);
      throw new Error('Failed to fetch odds from SGO');
    }
  }

  // The Odds API - Original implementation
  private async getTheOddsAPISports() {
    const API_KEY = process.env.ODDS_API_KEY;
    const BASE_URL = process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4';

    try {
      const response = await axios.get(`${BASE_URL}/sports`, {
        params: { apiKey: API_KEY },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sports:', error);
      throw new Error('Failed to fetch sports');
    }
  }

  private async getTheOddsAPIOdds(sport: string) {
    const API_KEY = process.env.ODDS_API_KEY;
    const BASE_URL = process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4';

    try {
      const response = await axios.get(`${BASE_URL}/sports/${sport}/odds`, {
        params: {
          apiKey: API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching odds:', error);
      throw new Error('Failed to fetch odds');
    }
  }

  // Transform different API formats to our standard format
  private transformBallDontLieData(data: any) {
    // Convert BallDontLie format to our standard format
    return data.data.map((game: any) => ({
      id: game.id.toString(),
      sport_key: 'nba',
      sport_title: 'NBA',
      commence_time: game.date,
      home_team: game.home_team.full_name,
      away_team: game.visitor_team.full_name,
      bookmakers: [
        // Would need to fetch from their odds endpoint
        // or use mock data for development
      ],
    }));
  }

  private transformSGOData(data: any) {
    // Convert SGO format to our standard format
    return data; // Implement transformation logic
  }
}

export default new OddsService();
