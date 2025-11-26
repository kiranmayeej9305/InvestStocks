# InvestStocks - AI-Powered Stock Market Investment Platform

A comprehensive, production-ready stock market investment platform with AI assistance, real-time data, portfolio management, and complete admin panel.

## 🚀 Features

- **AI-Powered Chat** - Get investment advice using Groq LLaMA 3 70B
- **Real-Time Stock Data** - Live quotes, charts, and market data
- **Cryptocurrency Market** - Complete crypto tracking with CoinGecko integration
- **Paper Trading Simulator** - Practice trading with virtual money using real market data
- **Portfolio Management** - Track and manage stocks and crypto investments
- **Admin Panel** - Complete management system for users, subscriptions, and settings
- **Subscription System** - Stripe integration with multiple plans
- **Analytics Dashboard** - Track usage and platform statistics
- **Audit Logging** - Complete audit trail of all admin actions

## 📚 Documentation

- **[User Documentation](USER_DOCUMENTATION.md)** - Complete user guide
- **[Admin Quick Start](ADMIN_QUICK_START.md)** - 5-minute admin setup guide
- **[Admin Setup Guide](ADMIN_SETUP.md)** - How to grant admin access
- **[Read-Only Mode Guide](ADMIN_READ_ONLY_MODE.md)** - Demo mode configuration
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🎯 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your API keys in .env.local
# Then run:
npm run dev
```

### First Admin Setup

```bash
# Create an admin user
node scripts/make-admin.mjs your-email@example.com

# Log out and log back in
# Navigate to /admin
```

### Demo Mode (CodeCanyon)

Add to `.env.local`:
```bash
ADMIN_DEMO_MODE=true
```

## 📖 Key Documentation Files

| File | Description |
|------|-------------|
| `USER_DOCUMENTATION.md` | Complete user guide with all features |
| `ADMIN_QUICK_START.md` | Quick 5-minute setup guide |
| `ADMIN_SETUP.md` | How to grant admin access |
| `ADMIN_READ_ONLY_MODE.md` | Demo mode configuration |
| `CHANGELOG.md` | Complete version history |
| `ADMIN_PANEL_PLAN.md` | Admin panel implementation plan |

## 🛠️ Admin Panel Features

- **Dashboard** - Overview statistics and metrics
- **User Management** - View, edit, delete users
- **Subscription Management** - Manage user plans
- **Plan Management** - Configure plan limits
- **Site Settings** - Configure website settings
- **Analytics** - Platform usage statistics
- **Audit Logs** - Complete action history
- **API Keys** - View and manage API keys

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Admin route protection
- Audit logging
- Read-only demo mode
- Secure cookie handling

## 🎨 Design

- Modern glass morphism design
- Dark/Light theme support
- Fully responsive
- Orange color scheme (#ff4618)
- Beautiful gradients and animations

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Charts:** TradingView Widgets
- **Payments:** Stripe
- **AI:** Groq (LLaMA 3)

## 🌐 API Integrations

- **Groq API** - AI chat functionality
- **Finnhub API** - Real-time stock data
- **Alpha Vantage API** - Sentiment analysis
- **CoinGecko API** - Cryptocurrency market data and prices
- **Stripe API** - Payment processing
- **elbstream.com** - Stock logos (400k+ logos)

## 📝 License

Regular License from CodeCanyon - Envato Market

## 💬 Support

- **Documentation:** `/docs/index.html`
- **Community:** [Telegram Bot](https://t.me/webbuddyenvato_bot)
- **Direct Support:** [WebBuddy Support](https://envato.webbuddy.agency/)

## 📋 Recent Updates

### v1.3.0 (Latest)
- ✅ Paper Trading Simulator with $100,000 virtual account
- ✅ Buy/sell stocks and crypto with real-time prices
- ✅ Virtual portfolio tracking with performance analytics
- ✅ Transaction history with filtering
- ✅ Win rate and trade statistics
- ✅ Real-time portfolio value updates

### v1.2.0
- ✅ Complete cryptocurrency market tracking
- ✅ Crypto portfolio management
- ✅ CoinMarketCap-style market overview
- ✅ Individual coin detail pages
- ✅ Crypto categories (DeFi, NFT, Stablecoins, Meme)
- ✅ Market heatmaps and trending coins
- ✅ Real-time crypto price updates
- ✅ Integrated crypto/stocks portfolio

### v1.1.0
- ✅ Complete admin panel system
- ✅ Read-only demo mode for CodeCanyon
- ✅ User management with full CRUD
- ✅ Subscription and plan management
- ✅ Site settings configuration
- ✅ Analytics dashboard
- ✅ Audit logging system

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

**Made with ❤️ by WebBuddy**

For detailed documentation, see [USER_DOCUMENTATION.md](USER_DOCUMENTATION.md)

