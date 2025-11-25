export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface Odd {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
}

export interface BetSlipItem {
  oddId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  selectedOutcome: 'home' | 'away' | 'draw';
  odds: number;
  stake: number;
}

export interface Bet {
  id: string;
  userId: string;
  oddId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  selectedOutcome: 'home' | 'away' | 'draw';
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost';
  placedAt: string;
  settledAt?: string;
}

export interface UserStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStaked: number;
  totalWon: number;
  profitLoss: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
