import { Request } from 'express';

// User Types
export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  balance: number;
  created_at: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Bet Types
export type BetType = 'h2h' | 'spreads' | 'totals';
export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled' | 'pushed';
export type BetResult = 'won' | 'lost' | 'cancelled' | 'pushed';

export interface Bet {
  id: string;
  user_id: string;
  game_id: string;
  sport_key: string;
  sport_title: string;
  commence_time: Date;
  home_team: string;
  away_team: string;
  bet_type: BetType;
  selected_team: string;
  odds: number;
  stake: number;
  potential_win: number;
  status: BetStatus;
  result?: BetResult;
  settled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PlaceBetInput {
  game_id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bet_type: BetType;
  selected_team: string;
  odds: number;
  stake: number;
}

// Transaction Types
export type TransactionType =
  | 'bet_placed'
  | 'bet_won'
  | 'bet_lost'
  | 'bet_refund'
  | 'deposit'
  | 'withdrawal';

export interface Transaction {
  id: string;
  user_id: string;
  bet_id?: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description?: string;
  created_at: Date;
}

// Odds API Types
export interface OddsAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

// Formatted odds for frontend
export interface FormattedGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  odds: {
    h2h?: {
      home: number;
      away: number;
    };
    spreads?: {
      home: { point: number; price: number };
      away: { point: number; price: number };
    };
    totals?: {
      over: { point: number; price: number };
      under: { point: number; price: number };
    };
  };
}

// Statistics Types
export interface UserStats {
  total_bets: number;
  active_bets: number;
  won_bets: number;
  lost_bets: number;
  total_wagered: number;
  total_winnings: number;
  net_profit: number;
  win_rate: number;
}

// Request Types with User
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
