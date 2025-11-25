# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paper Bets is a full-stack sports betting simulator using virtual currency. The application allows users to place bets on real sporting events with fake money for practice and entertainment.

**Tech Stack:**
- Backend: Express.js (JavaScript), PostgreSQL, JWT authentication
- Frontend: React (JSX), Vite, Tailwind CSS, Zustand, React Router

**Note:** The codebase was originally TypeScript but has been migrated to JavaScript. TypeScript files have been deleted and replaced with .js/.jsx equivalents.

## Development Commands

### Backend (from `/backend`)
```bash
npm run dev        # Start dev server with nodemon auto-reload
npm start          # Run production server
npm run migrate    # Run database migrations (creates tables from schema.sql)
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Frontend (from `/frontend`)
```bash
npm run dev        # Start Vite dev server (usually http://localhost:3000)
npm run build      # Build for production
npm run preview    # Preview production build locally
```

### Database Setup
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE paper_bets;"

# Run migrations from backend directory
cd backend && npm run migrate
```

## Architecture

### Backend Structure

**Three-layer architecture:**
- `routes/` - Express route definitions and endpoint mapping
- `controllers/` - Request/response handling and validation
- `services/` - Business logic and external API integration

**Key directories:**
- `middleware/` - Authentication (`auth.js`) and error handling (`errorHandler.js`)
- `database/` - PostgreSQL connection pool (`db.js`), migrations (`migrate.js`), and schema (`schema.sql`)

**Authentication Flow:**
1. User registers/logs in via `/api/auth` endpoints
2. JWT token issued and stored in client localStorage
3. Protected routes require `Authorization: Bearer <token>` header
4. Middleware validates token and attaches user to `req.user`

### Frontend Structure

**State Management:**
- Zustand stores in `store/` directory:
  - `authStore.js` - User authentication state, login/logout, token management
  - `betSlipStore.js` - Shopping cart-style bet slip for placing wagers

**Routing:**
- React Router with public routes (`/login`, `/register`) and protected routes (`/dashboard`, `/bets`)
- Route protection handled in `App.jsx` with conditional rendering based on `isAuthenticated`

**API Integration:**
- `services/api.js` - Axios client with interceptors for authentication headers
- Communicates with backend at `http://localhost:5000/api` (configurable)

### Database Schema

**Three main tables:**
1. `users` - User accounts with email, username, hashed password, and balance
2. `bets` - Bet records with game details, selected team/outcome, odds, stake, status (pending/won/lost/cancelled)
3. `transactions` - Financial ledger of all balance changes (bet placement, wins, cancellations)

**Important:** The `transactions` table maintains an audit trail. Every bet placement, win, loss, or cancellation creates a transaction record with `balance_after` snapshot.

### Multi-Provider Odds Service

The application supports multiple sports odds data providers via `oddsService-multiprovider.js`:

**Supported Providers:**
- **The Odds API** (default) - Requires API key, 500 requests/month free tier
- **BallDontLie** - Free, no API key required (NBA, NFL, MLB, NHL)
- **Sports Game Odds (SGO)** - Requires API key, 1000 objects/month free tier

**Configuration:**
Set `ODDS_PROVIDER` in `.env` to switch providers:
- `the-odds-api` (default)
- `balldontlie`
- `sgo`

Each provider has adapter methods that transform their response format into a standardized structure used throughout the application.

## Environment Configuration

### Backend `.env` (required)

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paper_bets
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Odds Provider
ODDS_PROVIDER=the-odds-api  # or 'balldontlie', 'sgo'
ODDS_API_KEY=your_api_key   # Required for 'the-odds-api'
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
SGO_API_KEY=your_sgo_key    # Required for 'sgo'

# App Configuration
INITIAL_BALANCE=10000       # Starting virtual currency for new users
CORS_ORIGIN=http://localhost:3000
```

Copy from `backend/.env.example` if it exists.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account (returns JWT)
- `POST /login` - Authenticate user (returns JWT)
- `GET /profile` - Get current user profile (protected)
- `GET /balance` - Get current user balance (protected)

### Odds (`/api/odds`)
- `GET /sports` - List available sports
- `GET /:sportKey` - Get odds for specific sport
- `GET /:sportKey/events/:eventId` - Get specific event odds
- `POST /calculate` - Calculate potential winnings for bet

### Bets (`/api/bets`)
- `POST /` - Place a new bet (creates bet + transaction records)
- `GET /` - Get user's bet history
- `GET /stats` - Get user statistics (win rate, P&L, etc.)
- `GET /transactions` - Get transaction history
- `GET /:betId` - Get specific bet details
- `PUT /:betId/cancel` - Cancel pending bet (refunds stake)
- `PUT /:betId/settle` - Settle bet as won/lost (admin operation)

## Key Implementation Details

### Bet Settlement
Bets are manually settled via `PUT /api/bets/:betId/settle` with `result` parameter ('won' or 'lost'). In production, this would be automated by comparing game results from the odds API.

### Balance Management
All balance changes flow through the transactions table:
- Bet placement: Creates negative transaction (deducts stake)
- Bet win: Creates positive transaction (stake + winnings)
- Bet cancellation: Creates positive transaction (refunds stake)

The `balance_after` field in transactions provides an audit trail for debugging balance discrepancies.

### CORS Configuration
Backend CORS is configured in `server.js` to allow frontend origin. Update `CORS_ORIGIN` environment variable if frontend runs on different port/domain.

### Graceful Shutdown
The server implements graceful shutdown handlers for SIGTERM/SIGINT that close database connections and pending requests before exiting.
