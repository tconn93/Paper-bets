# Paper Bets Backend API

A comprehensive Express.js backend for the Paper Bets sports betting application with TypeScript, PostgreSQL, and The Odds API integration.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Sports Betting**: Place bets on various sports with real-time odds
- **Transaction Tracking**: Complete transaction history for all user activities
- **Statistics**: Comprehensive betting statistics and analytics
- **Real-time Odds**: Integration with The Odds API for live sports odds
- **Bet Management**: Place, view, cancel, and settle bets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **API Client**: axios (for The Odds API)

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.ts
│   │   ├── betController.ts
│   │   └── oddsController.ts
│   ├── database/         # Database configuration and schema
│   │   ├── db.ts
│   │   ├── migrate.ts
│   │   └── schema.sql
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── bets.ts
│   │   └── odds.ts
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── betService.ts
│   │   └── oddsService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── server.ts         # Application entry point
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- The Odds API key (get one at https://the-odds-api.com/)

### Setup Steps

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your configuration:
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
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRES_IN=7d

   # The Odds API
   ODDS_API_KEY=your_odds_api_key

   # CORS
   CORS_ORIGIN=http://localhost:3000

   # Initial Balance
   INITIAL_BALANCE=10000
   ```

3. **Create PostgreSQL database**:
   ```bash
   psql -U postgres
   CREATE DATABASE paper_bets;
   \q
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Get User Balance
```http
GET /api/auth/balance
Authorization: Bearer <token>
```

### Odds

#### Get Available Sports
```http
GET /api/odds/sports
```

#### Get Odds for a Sport
```http
GET /api/odds/:sportKey?markets=h2h,spreads,totals
```

#### Get Odds for Specific Event
```http
GET /api/odds/:sportKey/events/:eventId
```

#### Calculate Potential Win
```http
POST /api/odds/calculate
Content-Type: application/json

{
  "odds": -110,
  "stake": 100
}
```

### Bets

#### Place a Bet
```http
POST /api/bets
Authorization: Bearer <token>
Content-Type: application/json

{
  "game_id": "event_id",
  "sport_key": "americanfootball_nfl",
  "sport_title": "NFL",
  "commence_time": "2024-01-15T18:00:00Z",
  "home_team": "Team A",
  "away_team": "Team B",
  "bet_type": "h2h",
  "selected_team": "Team A",
  "odds": -110,
  "stake": 100
}
```

#### Get User Bets
```http
GET /api/bets?status=pending
Authorization: Bearer <token>
```

#### Get Bet by ID
```http
GET /api/bets/:betId
Authorization: Bearer <token>
```

#### Get User Statistics
```http
GET /api/bets/stats
Authorization: Bearer <token>
```

#### Get Transaction History
```http
GET /api/bets/transactions
Authorization: Bearer <token>
```

#### Cancel a Bet
```http
PUT /api/bets/:betId/cancel
Authorization: Bearer <token>
```

#### Settle a Bet (Admin)
```http
PUT /api/bets/:betId/settle
Authorization: Bearer <token>
Content-Type: application/json

{
  "result": "won"
}
```

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `username` (VARCHAR, Unique)
- `balance` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Bets Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `game_id` (VARCHAR)
- `sport_key` (VARCHAR)
- `sport_title` (VARCHAR)
- `commence_time` (TIMESTAMP)
- `home_team` (VARCHAR)
- `away_team` (VARCHAR)
- `bet_type` (VARCHAR: h2h, spreads, totals)
- `selected_team` (VARCHAR)
- `odds` (DECIMAL)
- `stake` (DECIMAL)
- `potential_win` (DECIMAL)
- `status` (VARCHAR: pending, won, lost, cancelled, pushed)
- `result` (VARCHAR)
- `settled_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Transactions Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `bet_id` (UUID, Foreign Key)
- `type` (VARCHAR: bet_placed, bet_won, bet_lost, bet_refund, deposit, withdrawal)
- `amount` (DECIMAL)
- `balance_after` (DECIMAL)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with configurable expiration
- SQL injection protection via parameterized queries
- CORS configuration
- Input validation with express-validator
- Error sanitization in production mode

## Development

### Database Migrations

To reset the database:
```bash
psql -U postgres -d paper_bets -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```

### Testing API Endpoints

You can use tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

Example curl request:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'
```

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a strong `JWT_SECRET`
3. Configure PostgreSQL with proper security
4. Set up HTTPS/SSL
5. Configure rate limiting
6. Set up monitoring and logging
7. Use environment-specific database
8. Enable database backups

## License

ISC
