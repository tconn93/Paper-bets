# Paper Bets Backend - Quick Setup Guide

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL v14+ installed and running (`psql --version`)
- [ ] An account and API key from [The Odds API](https://the-odds-api.com/)
- [ ] A PostgreSQL user with database creation privileges

## Step-by-Step Setup

### 1. Install Node.js Dependencies

```bash
cd /home/user/Paper-bets/backend
npm install
```

This will install all required packages including:
- express, cors, dotenv
- bcryptjs, jsonwebtoken
- pg (PostgreSQL client)
- axios
- express-validator
- TypeScript and development tools

### 2. Set Up PostgreSQL Database

#### Option A: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE paper_bets;

# Exit psql
\q
```

#### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" > "Database..."
4. Name it "paper_bets"
5. Click "Save"

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

**Required Configuration:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Update these with your PostgreSQL credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paper_bets
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD

# JWT - Generate a secure random string
JWT_SECRET=YOUR_SECURE_RANDOM_STRING_HERE
JWT_EXPIRES_IN=7d

# The Odds API - Get your key from https://the-odds-api.com/
ODDS_API_KEY=YOUR_ODDS_API_KEY_HERE
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:3000

# Initial user balance (in dollars)
INITIAL_BALANCE=10000
```

**Tips for JWT_SECRET:**
```bash
# Generate a secure random string (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables:
- `users` - User accounts and balances
- `bets` - Betting history
- `transactions` - Transaction ledger

Expected output:
```
Starting database migration...
Database connected successfully
Migration completed successfully!
Database tables created:
  - users
  - bets
  - transactions
```

### 5. Start the Development Server

```bash
npm run dev
```

Expected output:
```
=================================
Paper Bets API Server
Environment: development
Port: 5000
Started at: 2024-01-15T10:30:00.000Z
=================================
Database connected successfully
```

### 6. Verify the Server is Running

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "username": "testuser",
      "balance": 10000,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "User registered successfully"
}
```

## Common Issues and Solutions

### Issue: "Cannot find module 'pg'"

**Solution:**
```bash
npm install
```

### Issue: "connect ECONNREFUSED 127.0.0.1:5432"

**Solution:** PostgreSQL is not running. Start it:

```bash
# Linux
sudo systemctl start postgresql

# macOS
brew services start postgresql

# Windows
# Start PostgreSQL from Services or pgAdmin
```

### Issue: "password authentication failed for user"

**Solution:** Check your DB_PASSWORD in `.env` matches your PostgreSQL user password

```bash
# Reset PostgreSQL password
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
\q

# Update .env file with the new password
```

### Issue: "relation 'users' does not exist"

**Solution:** Run the migration script:
```bash
npm run migrate
```

### Issue: "JWT_SECRET is not defined"

**Solution:** Ensure `.env` file exists and contains JWT_SECRET:
```bash
# Check if .env exists
ls -la .env

# If not, copy from example
cp .env.example .env

# Edit and add JWT_SECRET
nano .env
```

### Issue: "Odds API Error: 401 Unauthorized"

**Solution:**
1. Verify your API key is correct in `.env`
2. Check if your API key is active at https://the-odds-api.com/
3. Ensure you haven't exceeded your API quota

### Issue: Port 5000 already in use

**Solution:** Change the PORT in `.env`:
```env
PORT=5001
```

## Next Steps

1. **Install and set up the frontend** (in `/home/user/Paper-bets/frontend`)
2. **Test all API endpoints** using Postman or similar tools
3. **Review the API documentation** in `README.md`
4. **Configure your Odds API preferences** (sports, markets, etc.)

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run migrations
npm run migrate

# Lint code
npm run lint

# Format code
npm run format
```

## Testing the API

### Using curl

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","username":"user1"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# Get odds (replace YOUR_TOKEN with the token from login)
curl -X GET http://localhost:5000/api/odds/americanfootball_nfl \
  -H "Authorization: Bearer YOUR_TOKEN"

# Place a bet
curl -X POST http://localhost:5000/api/bets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "event_id",
    "sport_key": "americanfootball_nfl",
    "sport_title": "NFL",
    "commence_time": "2024-12-31T18:00:00Z",
    "home_team": "Team A",
    "away_team": "Team B",
    "bet_type": "h2h",
    "selected_team": "Team A",
    "odds": -110,
    "stake": 100
  }'
```

### Using Postman

1. Import the API endpoints from the README.md
2. Create an environment with `baseUrl = http://localhost:5000`
3. Set up authentication with the JWT token

## Database Management

### View all tables
```bash
psql -U postgres -d paper_bets -c "\dt"
```

### View users
```bash
psql -U postgres -d paper_bets -c "SELECT id, email, username, balance FROM users;"
```

### View bets
```bash
psql -U postgres -d paper_bets -c "SELECT * FROM bets ORDER BY created_at DESC LIMIT 10;"
```

### Reset database
```bash
psql -U postgres -d paper_bets -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```

## Getting Help

- Check the main [README.md](README.md) for API documentation
- Review error messages in the terminal
- Check PostgreSQL logs for database issues
- Verify environment variables in `.env`
- Ensure all dependencies are installed with `npm install`

## Production Checklist

Before deploying to production:

- [ ] Change `NODE_ENV` to `production`
- [ ] Use a strong, unique `JWT_SECRET`
- [ ] Set up SSL/HTTPS
- [ ] Configure production database
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Review security settings
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Set up error tracking (e.g., Sentry)

---

**Need Help?** Review the full documentation in [README.md](README.md) or check the inline code comments.
