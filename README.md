# Paper Bets 🎰

Paper trading but with sports betting - A full-stack sports betting application using **fake money** for practice and fun.

## 🎯 Overview

Paper Bets is a sports betting simulator that allows users to place bets on real sporting events using virtual currency. Perfect for learning how sports betting works without any financial risk!

### Features

- 💰 **Virtual Currency**: Start with $10,000 fake money
- 🏈 **Real Sports Odds**: Live odds from The Odds API
- 📊 **Statistics Tracking**: Win/loss records, profit/loss, and more
- 🔐 **Secure Authentication**: JWT-based user authentication
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎲 **Multiple Bet Types**: Moneyline (h2h), spreads, and totals
- 📈 **Bet History**: Track all your bets and outcomes

## 🏗️ Tech Stack

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **The Odds API** - Live sports odds data

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing

## 📁 Project Structure

```
Paper-bets/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, error handling
│   │   ├── database/       # DB connection & schema
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- The Odds API key (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Paper-bets
```

### 2. Set Up Backend

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paper_bets
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# The Odds API
ODDS_API_KEY=your_odds_api_key_here
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4

# Initial user balance
INITIAL_BALANCE=10000
```

### 3. Set Up Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE paper_bets;"

# Run migrations
npm run migrate
```

### 4. Start Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or build and run production
npm run build
npm start
```

Backend will run on `http://localhost:5000`

### 5. Set Up Frontend

```bash
cd ../frontend
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🎮 Usage

### 1. Register an Account
- Navigate to `http://localhost:3000`
- Click "Register" and create an account
- You'll start with $10,000 virtual currency

### 2. Browse Sports Odds
- View available sports and upcoming games on the Dashboard
- Filter by sport type (Football, Basketball, Baseball, etc.)
- See real-time odds from multiple bookmakers

### 3. Place Bets
- Click on odds to add them to your bet slip
- Enter your stake amount
- Review potential winnings
- Confirm to place your bet

### 4. Track Your Bets
- View active bets on the Dashboard
- Check bet history in the "My Bets" section
- See your statistics (win rate, total profit/loss, etc.)

### 5. Settle Bets (Admin)
- Bets can be settled manually through the API
- In a production app, this would be automated

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/balance` - Get user balance

### Sports Odds
- `GET /api/odds/sports` - Get available sports
- `GET /api/odds/:sportKey` - Get odds for a sport
- `GET /api/odds/:sportKey/events/:eventId` - Get event odds
- `POST /api/odds/calculate` - Calculate potential winnings

### Betting
- `POST /api/bets` - Place a bet
- `GET /api/bets` - Get user's bets
- `GET /api/bets/stats` - Get user statistics
- `GET /api/bets/transactions` - Get transaction history
- `GET /api/bets/:betId` - Get specific bet
- `PUT /api/bets/:betId/cancel` - Cancel a bet
- `PUT /api/bets/:betId/settle` - Settle a bet (admin)

## 🔑 Getting The Odds API Key

1. Visit [The Odds API](https://the-odds-api.com/)
2. Sign up for a free account
3. Get your API key (500 requests/month free)
4. Add it to your `.env` file

## 🗄️ Database Schema

### Users
```sql
id, email, username, password, balance, created_at, updated_at
```

### Bets
```sql
id, user_id, game_id, sport_key, sport_title, commence_time,
home_team, away_team, bet_type, selected_team, odds, stake,
potential_win, status, result, settled_at, created_at, updated_at
```

### Transactions
```sql
id, user_id, bet_id, type, amount, balance_after,
description, created_at
```

## 🛠️ Development

### Backend Commands

```bash
npm run dev      # Start dev server with auto-reload
npm run build    # Compile TypeScript
npm start        # Run production build
npm run migrate  # Run database migrations
```

### Frontend Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🧪 Testing the API

Use curl, Postman, or any HTTP client:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get sports (with auth token)
curl http://localhost:5000/api/odds/sports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎨 Customization

### Change Initial Balance
Edit `INITIAL_BALANCE` in backend `.env` file

### Add More Sports
The Odds API supports many sports. Check their documentation for available sports keys.

### Styling
Frontend uses Tailwind CSS. Customize colors in `frontend/tailwind.config.js`

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check credentials in `.env` file
- Verify database exists: `psql -U postgres -l`

### API Key Issues
- Verify your Odds API key is valid
- Check you haven't exceeded rate limits (500/month free)
- Test API key directly: `curl "https://api.the-odds-api.com/v4/sports?apiKey=YOUR_KEY"`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.ts`

### CORS Errors
- Ensure frontend and backend URLs match in configurations
- Check CORS settings in `backend/src/server.ts`

## 📚 Additional Documentation

- Backend: See `backend/README.md` for detailed API documentation
- Frontend: See `frontend/README.md` for component documentation
- Setup Guide: See `backend/SETUP_GUIDE.md` for detailed setup instructions

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

## ⚖️ Legal Disclaimer

This application is for **educational and entertainment purposes only**. No real money is involved. Users must be of legal age in their jurisdiction. Always gamble responsibly.

## 📝 License

ISC

## 🙏 Acknowledgments

- [The Odds API](https://the-odds-api.com/) for providing sports odds data
- Built as a learning project for full-stack development

---

**Happy Betting! 🎲** (with fake money, of course!)