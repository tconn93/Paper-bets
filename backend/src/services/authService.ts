import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/db';
import {
  User,
  UserProfile,
  RegisterInput,
  LoginInput,
  AuthResponse,
  AppError,
} from '../types';

export class AuthService {
  private static readonly SALT_ROUNDS = 10;

  static async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, username } = input;

    // Validate input
    if (!email || !password || !username) {
      throw new AppError('All fields are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email or username already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Get initial balance from env or use default
    const initialBalance = parseFloat(process.env.INITIAL_BALANCE || '10000');

    // Create user
    const result = await query(
      `INSERT INTO users (email, password, username, balance)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, balance, created_at`,
      [email.toLowerCase(), hashedPassword, username, initialBalance]
    );

    const user = result.rows[0];

    // Generate token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        balance: parseFloat(user.balance),
        created_at: user.created_at,
      },
    };
  }

  static async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user: User = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        balance: parseFloat(user.balance.toString()),
        created_at: user.created_at,
      },
    };
  }

  static async getUserProfile(userId: string): Promise<UserProfile> {
    const result = await query(
      'SELECT id, email, username, balance, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      balance: parseFloat(user.balance),
      created_at: user.created_at,
    };
  }

  private static generateToken(payload: {
    id: string;
    email: string;
    username: string;
  }): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });
  }

  static async updateBalance(
    userId: string,
    amount: number
  ): Promise<number> {
    const result = await query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return parseFloat(result.rows[0].balance);
  }

  static async getBalance(userId: string): Promise<number> {
    const result = await query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return parseFloat(result.rows[0].balance);
  }
}
