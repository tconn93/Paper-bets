# Paper Bets Backend - Quick Start

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies (1 minute)
```bash
cd /home/user/Paper-bets/backend
npm install
```

### 2. Set Up Environment (2 minutes)
```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

**Minimum required changes in .env:**
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_random_secret_key_here
ODDS_API_KEY=your_odds_api_key_from_the-odds-api.com
```

### 3. Create Database (1 minute)
```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE paper_bets;"

# Run migrations
npm run migrate
```

### 4. Start Server (1 minute)
```bash
npm run dev
```

**Expected output:**
```
=================================
Paper Bets API Server
Environment: development
Port: 5000
Started at: 2024-01-15T10:30:00.000Z
=================================
Database connected successfully
```

### 5. Test It Works
```bash
# In a new terminal
curl http://localhost:5000/health
```

**Success!** You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📚 Next Steps

1. **Read the full documentation**: [README.md](README.md)
2. **Follow detailed setup**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. **Understand the project**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
4. **Test the API endpoints** (see examples below)

---

## 🧪 Quick API Tests

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

**Save the token from the response!**

### Get Available Sports
```bash
curl http://localhost:5000/api/odds/sports
```

### Get NFL Odds
```bash
curl http://localhost:5000/api/odds/americanfootball_nfl
```

### Get Your Profile (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ❓ Common Issues

**Issue**: `npm install` fails
- **Fix**: Make sure you have Node.js v18+ installed

**Issue**: Database connection fails
- **Fix**: Make sure PostgreSQL is running and password in `.env` is correct

**Issue**: Migration fails
- **Fix**: Make sure the database `paper_bets` exists

**Issue**: Can't get odds
- **Fix**: Make sure your ODDS_API_KEY in `.env` is valid

---

## 📋 Available Commands

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run migrate  # Run database migrations
npm run lint     # Check code quality
npm run format   # Format code with Prettier
```

---

## 🎯 What's Included

✅ **23 Files Created**
- 15 TypeScript source files (~2,062 lines)
- 5 configuration files
- 3 documentation files
- 1 SQL schema
- 1 environment template

✅ **20+ API Endpoints**
- Authentication (register, login, profile)
- Odds (sports, games, calculations)
- Bets (place, view, cancel, settle)
- Statistics and transactions

✅ **3 Database Tables**
- Users (authentication and balance)
- Bets (betting history)
- Transactions (ledger)

✅ **Complete Features**
- JWT authentication
- Password hashing
- Real-time odds
- Bet management
- Transaction tracking
- Statistics dashboard
- Error handling
- Input validation

---

## 🔗 Useful Links

- **The Odds API**: https://the-odds-api.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **JWT.io**: https://jwt.io/

---

**Ready to build the frontend?** Head over to `/home/user/Paper-bets/frontend`

**Need help?** Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.
