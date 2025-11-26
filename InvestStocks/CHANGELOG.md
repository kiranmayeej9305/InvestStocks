# Changelog

All notable changes to InvestStocks will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-21

### 🎉 Major Features Release

Complete cryptocurrency market tracking, paper trading simulator, feature flagging system, and comprehensive market tools - a massive update with 8+ major feature categories.

**Release Statistics:**
- 8 Major Feature Categories Added
- 30+ New API Endpoints
- 15+ New Pages & Components
- 10+ New Custom Hooks
- 5 New Database Schemas
- Complete Documentation Update

### ✨ Features Added

#### Paper Trading Simulator
- **Virtual Trading Account** - Start with $100,000 virtual cash
- **Real-time Price Execution** - Trades execute at current market prices
- **Stock Trading** - Buy and sell stocks with real-time quotes
- **Crypto Trading** - Buy and sell cryptocurrencies with real-time prices
- **Portfolio Tracking** - Track virtual holdings with real-time values
- **Transaction History** - Complete history of all trades with filtering
- **Performance Analytics** - Track total return, win rate, best/worst trades
- **Account Summary** - View cash balance, total portfolio value, and returns

#### Trading Features
- **Buy Orders** - Execute buy orders for stocks and crypto
- **Sell Orders** - Execute sell orders from existing holdings
- **Price Validation** - Real-time price fetching before execution
- **Balance Validation** - Prevents trades exceeding available cash
- **Average Cost Basis** - Automatic calculation for multiple purchases
- **Gain/Loss Tracking** - Real-time P&L for each holding

#### Performance Metrics
- **Total Return** - Dollar amount and percentage return
- **Win Rate** - Percentage of profitable trades
- **Best Trade** - Highest profit trade
- **Worst Trade** - Largest loss trade
- **Trade Statistics** - Total trades, winning trades, losing trades

#### User Interface
- **Trading Panel** - Prominent order placement interface with buy/sell tabs
- **Trading Interface** - Intuitive buy/sell dialog with asset search
- **Virtual Portfolio Table** - Display holdings with current values and P&L
- **Clickable Holdings** - Select holdings from portfolio for quick sell orders
- **Transaction History** - Filterable transaction list
- **Performance Dashboard** - Visual performance metrics cards
- **Account Summary Card** - Quick view of account status
- **Professional Trading Layout** - Trading platform-style design with prominent order panel

#### Feature Flagging System
- **Admin Feature Flags Panel** - Centralized control for all platform features at `/admin/feature-flags`
- **Global Feature Toggle** - Enable/disable features across the entire platform instantly
- **Plan-Specific Access Control** - Enable features for specific plans (Free, Pro, Enterprise) with checkboxes
- **Category Organization** - Group flags by category (AI, Stocks, Crypto, Trading, Analytics, Other)
- **Real-time Changes** - Feature changes take effect immediately without code deployment or restart
- **Search & Filter** - Find feature flags quickly by name, key, or filter by category
- **Audit Logging** - Track all feature flag changes with timestamps and admin identification
- **Default Flags** - Pre-configured for all existing features (10 default flags)
- **Custom Flag Creation** - Create new feature flags with key, name, description, category, and plan access
- **Flag Deletion** - Remove unused or deprecated feature flags with confirmation
- **Read-Only Mode Support** - Respects demo mode restrictions to prevent changes
- **Client-Side Hooks** - `useFeatureFlag()` and `useFeatureFlags()` for checking flags in components
- **Server-Side Integration** - `canUseFeatureWithFlags()` for API route and server component checks
- **Visual Status Indicators** - Badge indicators showing enabled/disabled status with icons
- **Plan Checkboxes** - Easy-to-use checkboxes for selecting which plans have access to each feature

#### Price Alerts & Notifications System
- **Comprehensive Alert System** - Create price alerts for both stocks and cryptocurrencies
- **Multiple Alert Types** - Price Above, Price Below, Percentage Change, Volume Spike
- **Dual Notification Channels** - Email and in-app notifications for triggered alerts
- **Real-time Monitoring** - Continuous price monitoring with automatic alert checking
- **Alert Management Dashboard** - Dedicated page at `/alerts` for managing all alerts
- **Status Filtering** - Filter alerts by Active, Triggered, Cancelled status
- **Alert History** - Track when alerts were created and triggered with timestamps
- **Notification Center** - Real-time notification center with unread count badge
- **Auto-refresh System** - Notifications refresh every 30 seconds automatically
- **Alert Actions** - Cancel active alerts or delete alerts permanently
- **Current Price Display** - Shows current asset price alongside alert threshold
- **Time Tracking** - Display time since alert creation and triggering using date-fns

#### Market News & Information Hub
- **Comprehensive News Feed** - Dedicated news page at `/news` with multi-source aggregation
- **Category-Based Filtering** - Filter news by General, Forex, Crypto, Merger categories
- **Symbol-Specific Search** - Search and filter news for specific stock symbols
- **Personalized News Feed** - AI-powered personalized feed based on user's watchlist and portfolio holdings
- **Saved Articles** - Save news articles for later reading with dedicated saved articles view
- **Real-time Updates** - Live news feed with automatic refresh functionality
- **Sentiment Indicators** - News sentiment analysis with bullish/bearish indicators
- **Social Sharing** - Share news articles to social media platforms
- **Debounced Search** - Smooth search experience with 500ms debounce delay
- **Source Attribution** - Display news source and publication timestamps
- **News Cards** - Rich news cards with images, summaries, and related stocks
- **Search History** - Track recent news searches for quick access

#### Earnings Calendar System
- **Earnings Tracking** - Dedicated earnings calendar page at `/earnings`
- **30-Day View** - View upcoming earnings announcements for the next 30 days
- **EPS Estimates** - Display earnings per share estimates and actuals
- **Revenue Estimates** - Track revenue estimates vs actual results
- **Symbol Search** - Search for specific company earnings by symbol
- **Calendar View** - Date-based organization with calendar interface
- **iCal Export** - Export earnings to personal calendar in iCal format
- **Earnings Surprises** - Visual indicators for earnings beats and misses
- **Historical Data** - Access to historical earnings results and trends
- **Company Details** - Quick access to company profile from earnings view

#### Trade Ideas & Recommendations Engine
- **AI-Powered Recommendations** - Intelligent trade suggestions using machine learning
- **Technical Analysis Ideas** - Trade ideas based on technical indicators and patterns
- **News-Driven Opportunities** - Trading opportunities derived from breaking news
- **Trending Stocks** - Momentum plays and trending stocks identification
- **Buy/Sell/Hold Signals** - Clear recommendations with detailed reasoning
- **Risk/Reward Analysis** - Risk assessment and reward potential for each trade idea
- **Entry/Exit Prices** - Suggested entry points and profit targets
- **Real-time Updates** - Trade ideas refresh in real-time as market conditions change
- **Multiple Sources** - Aggregated from technical analysis, news, and recommendations APIs
- **Trade Idea Cards** - Rich cards with charts, analysis, and actionable insights

#### Advanced Sentiment Analysis Suite
- **Multi-Source Sentiment** - Aggregate sentiment from Alpha Vantage and Finnhub APIs
- **Bullish/Bearish Indicators** - Clear sentiment direction with percentage scores
- **News Sentiment Scoring** - Automated sentiment analysis of news articles
- **Social Media Tracking** - Monitor social media sentiment for stocks and crypto
- **Historical Sentiment Trends** - Track sentiment changes over time with charts
- **Sentiment-Based Screening** - Filter stocks by sentiment scores
- **Real-time Sentiment Updates** - Live sentiment data with auto-refresh
- **Sentiment Visualization** - Charts and gauges for sentiment display
- **Combined Sentiment Score** - Weighted average from multiple sources
- **Sentiment Alerts** - Get notified when sentiment changes significantly

#### Email Notifications & Digests
- **Email Preferences Management** - Dedicated API endpoint for managing email preferences
- **Automated Email Digests** - Daily and weekly portfolio summary emails
- **Performance Summaries** - Email summaries of portfolio performance and gains/losses
- **Alert Notifications** - Email notifications when price alerts trigger
- **Personalized Content** - Email content based on user's watchlist and holdings
- **Customizable Frequency** - Choose daily, weekly, or monthly digest frequency
- **Unsubscribe Controls** - Easy opt-out options for each email type
- **HTML Email Templates** - Beautiful, branded HTML email templates
- **News Digest** - Curated news relevant to user's interests
- **Earnings Reminders** - Email reminders for upcoming earnings of tracked stocks

#### Export & Import Functionality
- **Portfolio Export** - Export complete portfolio to CSV or JSON formats
- **Transaction Export** - Export transaction history for tax reporting and record keeping
- **Watchlist Export** - Export watchlist for sharing or backup purposes
- **Trade Import** - Import trades from CSV files with validation
- **Bulk Import Support** - Import multiple trades at once with error handling
- **Data Backup** - Complete data backup and restore functionality
- **Broker Format Compatibility** - Support for major broker CSV formats
- **Paper Trading Export** - Export virtual trading history and performance
- **Portfolio Analytics Export** - Export detailed portfolio analytics and metrics
- **Validation & Error Handling** - Comprehensive validation for imported data

### 🔧 Technical Implementation

#### Database Schema
- `paper_accounts` - Virtual account balances and values
- `paper_stock_holdings` - Virtual stock holdings with average cost basis
- `paper_crypto_holdings` - Virtual crypto holdings with average cost basis
- `paper_transactions` - Complete transaction history
- `feature_flags` - Feature flag configurations with plan-specific settings
  - Stores: key, name, description, enabled status, plans array, category, default value
  - Supports: MongoDB queries with category filtering and sorted results
  - Includes: createdAt and updatedAt timestamps for audit trail
- `alerts` - Price alerts with notification preferences
  - Stores: userId, assetType, symbol, name, alertType, threshold, status
  - Tracks: currentValue, triggeredAt, emailNotification, inAppNotification
  - Supports: Status-based filtering (active, triggered, cancelled)
- `saved_news` - Saved news articles for users
  - Stores: userId, article data, source, timestamps
  - Supports: User-specific queries and article management
- `email_preferences` - User email notification settings
  - Stores: userId, digest frequency, notification types enabled/disabled
  - Controls: Alert emails, digest emails, news emails

#### API Routes Created
- `/api/paper-trading/account` - Account management (GET/POST)
- `/api/paper-trading/portfolio` - Portfolio data with current values
- `/api/paper-trading/stocks/buy` - Execute stock buy orders
- `/api/paper-trading/stocks/sell` - Execute stock sell orders
- `/api/paper-trading/crypto/buy` - Execute crypto buy orders
- `/api/paper-trading/crypto/sell` - Execute crypto sell orders
- `/api/paper-trading/transactions` - Transaction history with filtering
- `/api/paper-trading/performance` - Performance metrics calculation
- `/api/admin/feature-flags` - Feature flags CRUD operations (GET/POST/PATCH/DELETE)
- `/api/feature-flags/check` - Public endpoint to check feature status
- `/api/alerts/create` - Create new price alerts (POST)
- `/api/alerts/list` - List user's alerts with optional status filter (GET)
- `/api/alerts/[id]` - Update or delete specific alert (PUT/DELETE)
- `/api/alerts/check` - Check and trigger alerts based on current prices (GET)
- `/api/alerts/notifications` - Get unread notifications and recent alerts (GET)
- `/api/news/route` - Market news feed with filtering (GET)
- `/api/news/saved` - Saved news articles (GET/POST/DELETE)
- `/api/news/check-saved` - Check if article is saved (GET)
- `/api/earnings/calendar` - Earnings calendar data (GET)
- `/api/trade-ideas/recommendations` - AI-powered trade recommendations (GET)
- `/api/trade-ideas/technical` - Technical analysis based ideas (GET)
- `/api/trade-ideas/news` - News-driven trading opportunities (GET)
- `/api/trade-ideas/trending` - Trending stocks and momentum plays (GET)
- `/api/sentiment/route` - Combined sentiment analysis (GET)
- `/api/sentiment/alpha-vantage` - Alpha Vantage sentiment (GET)
- `/api/sentiment/finnhub` - Finnhub sentiment (GET)
- `/api/email-preferences/route` - Email notification preferences (GET/PUT)
- `/api/email-digest/send` - Send automated email digests (POST)
- `/api/export/portfolio` - Export portfolio data (GET)
- `/api/export/transactions` - Export transaction history (GET)
- `/api/export/watchlist` - Export watchlist (GET)
- `/api/import/trades` - Import trades from CSV (POST)

#### React Components Created
- `TradingPanel` - Prominent trading interface with buy/sell tabs
- `TradingInterface` - Buy/sell dialog with asset search
- `VirtualPortfolioTable` - Holdings display with tabs and clickable selection
- `TransactionHistory` - Transaction list with filters
- `PerformanceDashboard` - Performance metrics cards
- `AccountSummary` - Account balance and returns card
- `FeatureFlagsPage` - Admin page for managing feature flags
- `NewsFeed` - Comprehensive news feed component with filtering
- `NewsCard` - Individual news article card with save/share actions
- `CalendarView` - Earnings calendar with date-based view
- `ExportButton` - Reusable export button for data download
- `NotificationsCenter` - Real-time notifications dropdown

#### Custom Hooks Created
- `usePaperAccount` - Fetch and manage virtual account
- `usePaperPortfolio` - Fetch portfolio with real-time values
- `usePaperTransactions` - Fetch transaction history
- `usePaperPerformance` - Fetch performance metrics
- `useFeatureFlag` - Check if a feature is enabled (single flag)
- `useFeatureFlags` - Check multiple feature flags at once
- `useAlerts` - Manage price alerts (create, update, delete, fetch)
- `useNotifications` - Real-time notifications with unread count
- `useDebounce` - Debounce user input for search functionality
- `useNews` - Fetch and filter news feed
- `useSavedNews` - Manage saved news articles
- `useEarningsCalendar` - Fetch earnings calendar data
- `useTradeIdeas` - Fetch trade recommendations
- `useSentiment` - Fetch sentiment analysis data

### 🔒 Plan Limits Integration

#### Paper Trading Feature Gating
- **Paper Trading Access** - Available to all plans (Free, Pro, Enterprise)
- **Trade Limits** - Free: 10 trades/day, Pro/Enterprise: Unlimited
- **Feature Flag** - `hasPaperTrading` and `maxPaperTrades` added to plan limits

#### Cryptocurrency Feature Gating
- **Crypto Tracking Limits** - Free: 3 coins, Pro/Enterprise: Unlimited
- **Crypto Heatmaps** - Pro and Enterprise plans only
- **Market Data Access** - Pro and Enterprise plans only
- **Upgrade Prompts** - Clear upgrade messages for premium features

#### Plan Limits Updated
- Added `maxCryptoTracking` limit
- Added `hasCryptoHeatmaps` feature flag
- Added `hasCryptoMarketData` feature flag
- Added `hasPaperTrading` feature flag
- Added `maxPaperTrades` limit
- Integrated with existing plan system
- Added `canUseFeatureWithFlags()` for server-side feature checks
- Feature flags now override plan limits when disabled globally
- Feature flag system provides granular control over plan limits
- Admins can disable features globally regardless of plan permissions
- Feature flag checks happen before plan limit validation

### 🎨 UI/UX Enhancements

#### Design Improvements
- **Clean Trading Interface** - Intuitive buy/sell dialogs
- **Real-time Price Display** - Current prices shown before execution
- **Visual Feedback** - Success/error toasts for all actions
- **Loading States** - Skeleton loaders for better UX
- **Responsive Design** - Works perfectly on all devices

#### User Experience
- **Auto-initialization** - Account created automatically on first access
- **Real-time Updates** - Portfolio values refresh every 30 seconds
- **Performance Auto-refresh** - Performance metrics update automatically after trades
- **Transaction Filtering** - Filter by type (buy/sell) and asset type
- **Price Validation** - Shows current price before confirming trade
- **Balance Warnings** - Clear messages for insufficient funds
- **Holding Selection** - Click holdings to auto-populate sell form
- **Visual Selection Feedback** - Selected holdings highlighted in portfolio
- **Auto-switch to Sell** - Automatically switches to sell tab when holding selected

### 🐛 Bug Fixes

#### Paper Trading Fixes
- Fixed missing import in stock buy route
- Fixed price fetching for both stocks and crypto
- Fixed transaction recording with proper balance tracking
- Fixed average cost basis calculation for multiple purchases
- Fixed performance metrics not updating after trades
- Fixed total portfolio value calculation after trades
- Fixed performance dashboard refresh mechanism

#### Cryptocurrency Fixes
- Fixed crypto logo visibility issues
- Fixed image URL handling for CoinGecko
- Fixed navigation issues in coin detail pages
- Fixed React hook errors in dynamic routes
- Fixed TypeScript type errors
- Fixed URL encoding/decoding for coin IDs
- Fixed tab component defaultValue requirement
- Fixed price data property access errors

#### General Fixes
- Fixed `charCodeAt` errors for undefined ticker values
- Fixed `toUpperCase` errors for undefined symbol values
- Enhanced error handling for undefined/null values throughout
- Fixed MongoDB client-side bundling issues with dynamic imports
- Fixed feature flag API route for proper server/client separation

### 📦 New Dependencies

No new dependencies required - uses existing Next.js and React infrastructure.

### 📚 Documentation Updates

- Updated CHANGELOG.md with both crypto and paper trading features
- Updated README.md with crypto and paper trading in features list
- Updated docs/index.html with comprehensive feature documentation
- Added crypto and paper trading to plan limits documentation
- Documented trading panel redesign and UI improvements
- Documented all bug fixes and error handling improvements

### 🌟 Highlights

- **Complete Trading Simulator** - Full virtual trading experience with $100K starting balance
- **Feature Flagging System** - Centralized control for all platform features without code changes
- **Price Alerts & Notifications** - Smart alert system with real-time monitoring and dual notification channels
- **Comprehensive News Hub** - Personalized news feed with category filtering and saved articles
- **Earnings Calendar** - Track earnings with 30-day view and iCal export
- **Trade Ideas Engine** - AI-powered recommendations from multiple sources
- **Advanced Sentiment Analysis** - Multi-source sentiment tracking with historical trends
- **Email Digests** - Automated portfolio summaries and personalized content
- **Export/Import Tools** - Complete data portability with CSV/JSON support
- **Real Market Data** - Uses actual stock and crypto prices from real-time APIs
- **Educational Value** - Perfect for learning and practicing trading strategies
- **Performance Tracking** - Comprehensive analytics and metrics with auto-refresh
- **User-Friendly** - Intuitive interface for all skill levels
- **Admin Control** - Powerful admin panel with feature toggles and plan management
- **Mobile Responsive** - Works perfectly on all devices and screen sizes
- **Production Ready** - Battle-tested with comprehensive error handling

### 📝 Files Added

**Pages:**
- `app/paper-trading/page.tsx` - Main paper trading dashboard
- `app/paper-trading/layout.tsx` - Paper trading layout
- `app/alerts/page.tsx` - Price alerts management page
- `app/news/page.tsx` - Market news feed page
- `app/earnings/page.tsx` - Earnings calendar page

**Components:**
- `components/paper-trading/trading-panel.tsx` - Prominent trading interface
- `components/paper-trading/trading-interface.tsx` - Buy/sell dialog
- `components/paper-trading/virtual-portfolio-table.tsx` - Holdings display
- `components/paper-trading/transaction-history.tsx` - Transaction list
- `components/paper-trading/performance-dashboard.tsx` - Performance metrics
- `components/paper-trading/account-summary.tsx` - Account overview
- `components/news/news-feed.tsx` - Market news feed component
- `components/news/news-card.tsx` - Individual news article card
- `components/earnings/calendar-view.tsx` - Earnings calendar component
- `components/export-import/export-button.tsx` - Data export button
- `components/notifications-center.tsx` - Real-time notifications dropdown

**API Routes:**
- `app/api/paper-trading/account/route.ts`
- `app/api/paper-trading/portfolio/route.ts`
- `app/api/paper-trading/stocks/buy/route.ts`
- `app/api/paper-trading/stocks/sell/route.ts`
- `app/api/paper-trading/crypto/buy/route.ts`
- `app/api/paper-trading/crypto/sell/route.ts`
- `app/api/paper-trading/transactions/route.ts`
- `app/api/paper-trading/performance/route.ts`
- `app/api/alerts/create/route.ts` - Create price alerts
- `app/api/alerts/list/route.ts` - List alerts with filtering
- `app/api/alerts/[id]/route.ts` - Update/delete alerts
- `app/api/alerts/check/route.ts` - Check alert triggers
- `app/api/alerts/notifications/route.ts` - Get notifications
- `app/api/news/route.ts` - News feed endpoint
- `app/api/news/saved/route.ts` - Saved articles management
- `app/api/news/check-saved/route.ts` - Check if article saved
- `app/api/earnings/calendar/route.ts` - Earnings calendar
- `app/api/trade-ideas/recommendations/route.ts` - Trade recommendations
- `app/api/trade-ideas/technical/route.ts` - Technical analysis
- `app/api/trade-ideas/news/route.ts` - News-based ideas
- `app/api/trade-ideas/trending/route.ts` - Trending stocks
- `app/api/sentiment/route.ts` - Combined sentiment
- `app/api/sentiment/alpha-vantage/route.ts` - Alpha Vantage sentiment
- `app/api/sentiment/finnhub/route.ts` - Finnhub sentiment
- `app/api/email-preferences/route.ts` - Email preferences
- `app/api/email-digest/send/route.ts` - Send email digests
- `app/api/export/portfolio/route.ts` - Export portfolio
- `app/api/export/transactions/route.ts` - Export transactions
- `app/api/export/watchlist/route.ts` - Export watchlist
- `app/api/import/trades/route.ts` - Import trades

**Database:**
- `lib/db/paper-trading.ts` - Paper trading database functions
- `lib/db/feature-flags.ts` - Feature flags database functions
- `lib/db/alerts.ts` - Alerts database functions and schema
- `lib/db/saved-news.ts` - Saved news database functions

**Hooks:**
- `lib/hooks/use-paper-trading.ts` - Paper trading data hooks
- `lib/hooks/use-feature-flag.ts` - Feature flag checking hooks
- `lib/hooks/use-alerts.ts` - Alerts and notifications hooks
- `lib/hooks/use-debounce.ts` - Debounce utility hook
- `lib/hooks/use-news.ts` - News feed data hooks
- `lib/hooks/use-earnings.ts` - Earnings calendar hooks
- `lib/hooks/use-trade-ideas.ts` - Trade ideas hooks
- `lib/hooks/use-sentiment.ts` - Sentiment analysis hooks

**Admin Pages:**
- `app/admin/feature-flags/page.tsx` - Feature flags management page

**Feature Flag API Routes:**
- `app/api/admin/feature-flags/route.ts` - Admin CRUD for feature flags (GET/POST/PATCH/DELETE)
- `app/api/feature-flags/check/route.ts` - Public endpoint to check feature status

**Modified Files:**
- `lib/plan-limits.ts` - Added paper trading limits and feature flag integration with `canUseFeatureWithFlags()`
- `components/sidebar.tsx` - Added Paper Trading, Alerts, News, and Earnings navigation
- `components/admin/admin-sidebar.tsx` - Added Feature Flags navigation with Flag icon
- `lib/validation-utils.ts` - Updated to use `canUseFeatureWithFlags()` for validation
- `components/header.tsx` - Added notifications center with badge
- `components/user-profile-dropdown.tsx` - Added email preferences link
- `docs/index.html` - Updated with all new features documentation
- `CHANGELOG.md` - Comprehensive update with all features

### 🔮 Future Enhancements

#### Paper Trading
- Leaderboard for top performers
- Reset account option
- Multiple virtual portfolios
- Limit orders (buy/sell at target price)
- Stop-loss orders
- Trading competitions
- Advanced analytics and charts
- Export transaction history

#### Feature Flags
- Scheduled feature releases (enable at specific time)
- A/B testing support
- User-specific feature flags
- Feature flag analytics and usage tracking
- Rollout percentage (gradual feature releases)
- Feature dependencies (require other features to be enabled)

#### Cryptocurrency Market Overview
- **Comprehensive Market Dashboard** (`/crypto`) - CoinMarketCap-style market overview
- **Global Market Statistics** - Total market cap, 24h volume, BTC/ETH dominance, active cryptocurrencies
- **Market Cap Change Tracking** - 24-hour market cap percentage change with visual indicators
- **Volume/Market Cap Ratio** - Real-time liquidity metrics
- **Top Cryptocurrencies Table** - Sortable, searchable table with 50+ coins
- **Real-time Price Updates** - Live price data from CoinGecko API
- **Market Rankings** - Market cap rankings for all cryptocurrencies

#### Top Gainers & Losers
- **Top Gainers (24h)** - Biggest price increases with percentage changes
- **Top Losers (24h)** - Biggest price decreases with percentage changes
- **Visual Indicators** - Color-coded gains/losses with trend icons
- **Clickable Navigation** - Direct links to coin detail pages
- **Price Display** - Formatted prices with proper decimal precision

#### Cryptocurrency Categories
- **DeFi Tokens** - Decentralized Finance category with top tokens
- **NFT Tokens** - Non-fungible token projects and platforms
- **Stablecoins** - USD-pegged stablecoins (USDT, USDC, etc.)
- **Meme Tokens** - Popular meme cryptocurrencies
- **Tabbed Interface** - Easy navigation between categories
- **Category-specific Rankings** - Top coins within each category
- **Real-time Category Data** - Live prices and 24h changes

#### Individual Coin Detail Pages (`/crypto/[coinId]`)
- **Comprehensive Coin Information** - Full coin details from CoinGecko
- **Interactive Price Charts** - Multiple timeframe options (1H, 24H, 7D, 30D, 90D, 1Y, ALL)
- **Key Metrics Display**:
  - Current price with 24h change
  - Market capitalization
  - 24h trading volume
  - Circulating supply
  - Max supply
  - 24h price range (high/low)
  - All-time high/low prices
- **Markets Table** - List of exchanges where coin is traded
- **About Section** - Coin description and information
- **Price History** - Historical price data for charts
- **Navigation** - Back to market button

#### Crypto Portfolio Management
- **Integrated Portfolio** - Crypto holdings alongside stocks in `/portfolio` page
- **Tabbed Interface** - Switch between Stocks and Crypto tabs
- **Add Crypto Holdings** - Dialog with search functionality
- **Real-time Price Updates** - Live price tracking for all holdings
- **Gain/Loss Calculations** - Automatic profit/loss tracking
- **Portfolio Table** - Complete holdings table with:
  - Coin logo and information
  - Current price vs buy price
  - Total cost and current value
  - Gain/loss in dollars and percentage
  - Buy date and exchange information
  - Notes and additional details
- **Delete Holdings** - Remove crypto from portfolio
- **Edit Holdings** - Update crypto holding information
- **Notes System** - Add notes to crypto purchases

#### Crypto Watchlist
- **Crypto Watchlist Page** (`/crypto`) - Dedicated watchlist view
- **Chart Integration** - View charts for selected crypto
- **Watchlist Sidebar** - Quick access to all crypto holdings
- **Price Alerts** - Visual indicators for price changes
- **Click to View** - Navigate to coin details from watchlist

#### Market Visualizations
- **Crypto Heatmap** - Visual representation of top 50 cryptocurrencies
- **Color-coded Performance** - Green for gains, red for losses
- **Interactive Selection** - Click coins to view details
- **Trending Coins** - Most searched coins on CoinGecko
- **Market Trends** - Visual market sentiment indicators

#### Search & Discovery
- **Crypto Search** - Search cryptocurrencies by name or symbol
- **Search Results Dropdown** - Real-time search suggestions
- **Coin Selection** - Easy selection from search results
- **Auto-complete** - Intelligent search with CoinGecko integration

### 🔧 Technical Implementation

#### API Routes Created
- `/api/crypto/portfolio` - GET/POST crypto holdings
- `/api/crypto/portfolio/[id]` - PUT/DELETE specific holdings
- `/api/crypto/search` - Search cryptocurrencies
- `/api/crypto/prices` - Batch price fetching
- `/api/crypto/market` - Market overview data
- `/api/crypto/trending` - Trending coins
- `/api/crypto/history` - Historical price data
- `/api/crypto/coin/[coinId]` - Individual coin details
- `/api/crypto/category/[category]` - Category-specific coins

#### Database Schema
- **CryptoHolding Model** - MongoDB collection for crypto portfolio
  - User ID, Coin ID, Symbol, Name
  - Amount, Buy Price, Buy Date
  - Exchange, Notes
  - Image URL for logos
  - Timestamps (createdAt, updatedAt)

#### React Components Created
- `CryptoMarketTable` - Main market table component
- `CryptoPortfolioTable` - Portfolio holdings table
- `CryptoChartSection` - Price chart component
- `CryptoLogo` - Logo component with fallback
- `CryptoHeatmap` - Market heatmap visualization
- `CryptoTrending` - Trending coins component
- `CryptoCategories` - Category browsing component
- `MarketStats` - Enhanced market statistics
- `AddCryptoDialog` - Add crypto to portfolio dialog

#### Custom Hooks Created
- `useCryptoPrice` - Single coin price hook
- `useCryptoMarketData` - Market overview hook
- `useTrendingCrypto` - Trending coins hook
- `useCryptoSearch` - Search functionality hook
- `useBatchCryptoPrices` - Batch price fetching hook
- `useCryptoHistory` - Historical data hook

#### CoinGecko API Integration
- **Free Tier Support** - 10-50 calls/minute rate limiting
- **Caching System** - In-memory cache to reduce API calls
- **Error Handling** - Graceful fallbacks for API failures
- **Data Formatting** - Consistent data structure across components
- **Image URLs** - Proper handling of CoinGecko image URLs

### 🎨 UI/UX Enhancements

#### Design Improvements
- **CoinMarketCap-style Layout** - Professional market overview
- **Enhanced Statistics Cards** - Better visual hierarchy
- **Category Tabs** - Clean tabbed interface for categories
- **Responsive Tables** - Mobile-friendly market tables
- **Loading States** - Skeleton loaders for better UX
- **Error Handling** - User-friendly error messages
- **Empty States** - Helpful messages when no data

#### Navigation Improvements
- **Breadcrumb Navigation** - Easy navigation between pages
- **Back Buttons** - Quick return to market overview
- **Clickable Rows** - Entire rows clickable for navigation
- **Keyboard Navigation** - Accessible navigation support


### 📦 New Dependencies

No new dependencies required - uses existing Next.js and React infrastructure.

### 🔄 API Integration Details

#### CoinGecko API Endpoints Used
- `/api/v3/coins/markets` - Market data
- `/api/v3/global` - Global market statistics
- `/api/v3/search` - Coin search
- `/api/v3/search/trending` - Trending coins
- `/api/v3/coins/{id}` - Coin details
- `/api/v3/coins/{id}/market_chart` - Historical prices
- `/api/v3/simple/price` - Current prices


### 🌟 Highlights

- **Complete Crypto Integration** - Full cryptocurrency tracking alongside stocks
- **Professional UI** - CoinMarketCap-inspired design
- **Real-time Data** - Live prices and market updates
- **Portfolio Management** - Seamless crypto portfolio tracking
- **Category Browsing** - Easy discovery of crypto by category
- **Comprehensive Details** - Detailed coin information pages
- **Mobile Responsive** - Works perfectly on all devices
- **Performance Optimized** - Efficient API usage with caching

### 📝 Files Added

**Pages:**
- `app/crypto/page.tsx` - Main crypto market page
- `app/crypto/[coinId]/page.tsx` - Coin detail page
- `app/crypto/layout.tsx` - Crypto section layout
- `app/crypto/loading.tsx` - Loading component

**Components:**
- `components/crypto/crypto-market-table.tsx`
- `components/crypto/crypto-portfolio-table.tsx`
- `components/crypto/crypto-chart-section.tsx`
- `components/crypto/crypto-logo.tsx`
- `components/crypto/crypto-heatmap.tsx`
- `components/crypto/crypto-trending.tsx`
- `components/crypto/crypto-categories.tsx`
- `components/crypto/market-stats.tsx`
- `components/crypto/add-crypto-dialog.tsx`

**API Routes:**
- `app/api/crypto/portfolio/route.ts`
- `app/api/crypto/portfolio/[id]/route.ts`
- `app/api/crypto/search/route.ts`
- `app/api/crypto/prices/route.ts`
- `app/api/crypto/market/route.ts`
- `app/api/crypto/trending/route.ts`
- `app/api/crypto/history/route.ts`
- `app/api/crypto/coin/[coinId]/route.ts`
- `app/api/crypto/category/[category]/route.ts`

**Database:**
- `lib/db/crypto-portfolio.ts` - Crypto portfolio database functions

**API Client:**
- `lib/api/coingecko.ts` - CoinGecko API client functions

**Hooks:**
- `lib/hooks/use-crypto-data.ts` - Crypto data fetching hooks

**UI Components:**
- `components/ui/tabs.tsx` - Tab component for categories

### 🔮 Future Enhancements

- Price alerts for cryptocurrencies
- Crypto news integration
- Advanced charting tools
- Portfolio analytics and insights
- Crypto comparison tools
- Historical performance tracking
- Tax reporting for crypto
- Exchange integration
- DeFi protocol tracking
- NFT collection tracking

---

## [1.1.0] - 2025-10-31

### 🎉 Admin Panel Release

Complete admin panel system with comprehensive management features for user administration, subscription management, analytics, and site configuration.

### ✨ Features Added

#### Admin Panel System
- **Complete Admin Dashboard** with overview statistics and key metrics
- **User Management** - View, edit, delete, and manage all users
- **Subscription Management** - Manage user plans and subscriptions
- **Plan Management** - Configure plan limits and features
- **API Key Management** - View and manage API keys
- **Analytics & Insights** - Platform usage analytics and statistics
- **Audit Logs** - Complete audit trail of all admin actions
- **Site Settings** - Configure website name, logo, SEO, and maintenance mode
- **Read-Only Demo Mode** - Perfect for CodeCanyon demos

#### Admin Panel Features

**User Management:**
- List all users with search, filter, and pagination
- View detailed user information and usage statistics
- Edit user details (name, email, phone, location, plan, role)
- Suspend/activate user accounts
- Delete users with confirmation
- User activity tracking

**Subscription Management:**
- View all user subscriptions
- Change user plans (free, pro, enterprise)
- Update subscription IDs
- Filter by plan and status
- View subscription statistics

**Plan Management:**
- Configure plan limits (AI conversations, stock charts, stock tracking)
- Set plan pricing
- Enable/disable plan features
- Manage plan visibility

**Analytics Dashboard:**
- Total users and active users count
- New users today/month statistics
- Users by plan breakdown
- Feature usage analytics
- Daily usage charts
- Usage trends over time

**Site Settings:**
- Configure website name and logo
- SEO settings (meta title, description, keywords)
- Social media links (Facebook, Twitter, LinkedIn)
- Maintenance mode toggle
- Allow/disable registration
- Allow/disable public access
- Google Analytics integration
- Theme customization (primary/secondary colors)
- Footer configuration

**Audit Logs:**
- Track all admin actions
- View changes before/after
- Filter by action type
- Search by admin email or action
- IP address tracking
- Timestamp tracking

**Read-Only Demo Mode:**
- Enable demo mode via `ADMIN_DEMO_MODE=true` environment variable
- Prevents all modifications (edit, delete, add)
- Allows full viewing access
- Shows visual indicator banner
- Perfect for CodeCanyon demos

### 🔧 Technical Improvements

#### API Enhancements
- Added `export const dynamic = 'force-dynamic'` to all admin API routes
- Fixed dynamic server usage errors for Vercel deployment
- Improved error handling and logging
- Added read-only mode checks to all modifying endpoints
- Enhanced audit logging system

#### Performance Optimizations
- Fixed excessive API calls in `useBatchQuotes` and `useMultipleStockQuotes` hooks
- Removed array dependencies from useEffect hooks to prevent infinite loops
- Optimized Fear & Greed Index fetching with `useCallback`
- Reduced unnecessary re-renders

#### Build & Deployment
- Fixed all ESLint warnings and errors
- Configured ESLint to treat non-critical warnings appropriately
- Fixed TypeScript type errors
- Added proper error handling for SSR contexts
- Fixed `useContext` hooks to handle missing context gracefully

#### UI/UX Improvements
- Consistent orange color scheme across admin and user panels
- Improved admin dashboard UI with gradient backgrounds
- Enhanced user management table with avatars and badges
- Better empty states and loading indicators
- Improved filter and search functionality
- Enhanced audit logs display with action icons

### 🐛 Bug Fixes

- Fixed `useState is not defined` errors in admin pages
- Fixed `params.then is not a function` error in user details page
- Fixed `Cannot read properties of null` errors in context hooks
- Fixed `SelectItem` empty string value errors
- Fixed unescaped apostrophes causing build errors
- Fixed type errors in admin API routes
- Fixed duplicate `requireAdmin` calls
- Fixed maintenance mode blocking admin panel access
- Fixed registration and public access settings not working
- Fixed static audit logs - now shows real-time changes
- Fixed missing filter dropdown in audit logs page
- Fixed footer appearing on AI chat page
- Fixed excessive API calls causing performance issues

### 📚 Documentation

- Updated HTML documentation (`docs/index.html`) with complete admin panel guide
- Added admin panel setup instructions to installation section
- Added admin panel configuration to configuration section
- Added comprehensive admin panel section with feature overview
- Updated changelog with all recent changes

### 🔒 Security Enhancements

- Admin routes protected with `requireAdmin` middleware
- Read-only mode prevents unauthorized modifications
- Audit logging for all sensitive operations
- Self-deletion prevention (admins can't delete themselves)
- Self-suspension prevention
- Role-based access control throughout

### 📦 New Files

**Admin Components:**
- `components/admin/admin-layout.tsx` - Admin panel layout
- `components/admin/admin-protected-route.tsx` - Route protection
- `components/admin/admin-sidebar.tsx` - Navigation sidebar

**Admin Pages:**
- `app/admin/page.tsx` - Dashboard
- `app/admin/users/page.tsx` - User management
- `app/admin/users/[id]/page.tsx` - User details
- `app/admin/subscriptions/page.tsx` - Subscription management
- `app/admin/plans/page.tsx` - Plan management
- `app/admin/api-keys/page.tsx` - API key management
- `app/admin/analytics/page.tsx` - Analytics dashboard
- `app/admin/settings/page.tsx` - Site settings
- `app/admin/logs/page.tsx` - Audit logs

**API Routes:**
- `app/api/admin/users/route.ts` - User list API
- `app/api/admin/users/[id]/route.ts` - User CRUD API
- `app/api/admin/users/[id]/usage/route.ts` - User usage API
- `app/api/admin/subscriptions/route.ts` - Subscriptions API
- `app/api/admin/subscriptions/[userId]/route.ts` - Subscription update API
- `app/api/admin/plans/route.ts` - Plans API
- `app/api/admin/api-keys/route.ts` - API keys API
- `app/api/admin/analytics/overview/route.ts` - Analytics overview API
- `app/api/admin/analytics/stats/route.ts` - Detailed analytics API
- `app/api/admin/site-settings/route.ts` - Site settings API
- `app/api/admin/logs/route.ts` - Audit logs API
- `app/api/admin/read-only-mode/route.ts` - Read-only mode check API
- `app/api/admin/disable-maintenance/route.ts` - Maintenance mode disable API

**Database Functions:**
- `lib/db/plans.ts` - Plan management functions
- `lib/db/site-settings.ts` - Site settings functions
- `lib/db/audit-logs.ts` - Audit log functions

**Utilities:**
- `lib/auth/admin.ts` - Admin authentication middleware
- `lib/auth/read-only-mode.ts` - Read-only mode utilities
- `lib/utils/audit-logger.ts` - Audit logging utility
- `lib/hooks/use-read-only-mode.ts` - Read-only mode hook
- `lib/metadata.ts` - Dynamic metadata generation

**Scripts:**
- `scripts/make-admin.mjs` - Make user admin script
- `scripts/disable-maintenance.mjs` - Disable maintenance mode script

### 🔄 Breaking Changes

None - all changes are backward compatible.

### 📝 Migration Notes

No migration needed. The admin panel is ready to use after deployment.

### 🎯 Next Steps for Users

1. **Set up Admin Access:**
   - Run `node scripts/make-admin.mjs your-email@example.com` to grant admin access
   - User must log out and log back in after role update
   - See `docs/index.html` for detailed admin panel setup instructions

2. **Configure Demo Mode (Optional):**
   - Add `ADMIN_DEMO_MODE=true` to `.env.local` for CodeCanyon demos
   - Set to `false` or omit for production

3. **Access Admin Panel:**
   - Navigate to `/admin` after logging in as admin
   - All admin features are accessible from the sidebar

### 🌟 Highlights

- Complete admin panel system
- Production-ready codebase
- Comprehensive audit logging
- Read-only demo mode for safe demos
- Beautiful, consistent UI/UX
- Fully functional and integrated
- Performance optimized
- Secure and protected

---

## [1.0.1] - 2025-10-31

### 🐛 Bug Fixes

- Fixed stock logo API failing - switched to elbstream.com API
- Fixed Finnhub API 403 errors with improved error handling
- Fixed Fear & Greed Index connection timeout errors
- Fixed maintenance mode blocking admin panel access
- Fixed registration and public access settings enforcement
- Fixed excessive API calls in stock data hooks
- Fixed React Hook dependency warnings
- Fixed build errors for Vercel deployment

### 🔧 Technical Improvements

- Added connection timeout handling for external APIs
- Improved error messages for API failures
- Optimized API call frequency
- Fixed useEffect dependency arrays
- Added proper cleanup for intervals

---

## [1.0.0] - 2025-10-23

### 🎉 Initial Release

The first public release of InvestStocks - AI-Powered Stock Market Investment Platform.

### ✨ Features Added

#### AI & Chat
- AI-powered chat assistant using Groq LLaMA 3 70B model
- Context-aware responses with live data integration
- Natural language processing for stock queries
- Pattern-based query matching for instant responses
- Chat history and session management
- Usage limits based on subscription plans (5/day free, unlimited pro)

#### Market Data & Analytics
- Real-time stock quotes from Finnhub API (60 calls/minute)
- Stock sentiment analysis from Alpha Vantage API (500 calls/day)
- Interactive TradingView charts with 15+ technical indicators
- Stock screener with advanced filtering capabilities
- Market heatmaps for stocks and ETFs
- Market overview with major indices (S&P 500, NASDAQ, DOW)
- Trending stocks dashboard (Gainers, Losers, Most Active)
- Fear & Greed Index integration from CNN
- Company financial metrics and ratios
- Real-time stock news and events feed
- Stock logo integration with intelligent fallbacks
- Candlestick charts with customizable timeframes
- Symbol comparison charts (up to 5 symbols for Pro users)

#### Portfolio Management
- Create and manage multiple portfolios
- Real-time portfolio value tracking with auto-refresh
- Automatic gain/loss calculations
- Performance analytics with visual charts
- Transaction history with detailed records
- Portfolio diversity analysis
- Holdings breakdown by sector
- Real-time portfolio updates with live market data

#### Watchlist
- Save favorite stocks for quick access
- Real-time price updates for watchlist items
- Add/remove stocks with single click
- Watchlist visible across Dashboard and Stocks pages
- Price change alerts and notifications
- Bulk watchlist operations

#### Authentication & Security
- JWT-based authentication with 7-day sessions
- Secure password hashing with bcrypt
- User profile management system
- Session management with HTTP-only cookies
- Protected routes and API endpoints
- Email-based user identification
- Automatic session validation and refresh

#### Monetization & Billing
- Complete Stripe payment integration
- Three-tier subscription model:
  - **Starter Plan** ($0/month) - 5 AI chats/day, basic features
  - **Investor Plan** ($19/month) - Unlimited AI, advanced features
  - **Professional Plan** ($49/month) - Everything + priority support
- Subscription management with upgrade/downgrade
- Usage tracking and limits enforcement
- Webhook handling for payment events
- Billing portal integration for subscription management
- Secure payment processing with test/live modes
- Automatic plan updates via webhooks

#### User Interface & Experience
- Modern glass morphism design language
- Dark/Light theme toggle with persistence
- Fully responsive design (Mobile, Tablet, Desktop)
- Touch-optimized mobile interface
- Loading animations with Lottie
- Toast notifications with Sonner
- Beautiful gradient effects (Orange #ff4618 theme)
- Smooth page transitions with Framer Motion
- Skeleton loaders for better perceived performance
- Error boundaries for graceful error handling
- Optimized images with Next.js Image component

#### Dashboard
- Comprehensive portfolio overview
- Real-time market statistics
- Quick access to trending stocks
- Fear & Greed Index widget
- Recent watchlist items
- Portfolio performance charts
- Market indices summary

#### Pages & Routes
- Landing page with feature showcase
- Interactive stock charts page
- Portfolio management page
- Trade ideas and recommendations
- Fear & Greed Index dedicated page
- Stock screener page
- Market heatmaps view
- User profile and settings
- Billing and subscription management
- Authentication pages (Login/Signup)
- Legal pages (Terms, Privacy Policy)
- Contact and Community pages

#### Technical Infrastructure
- Built with Next.js 14 App Router
- React 18 with Server Components
- TypeScript for type safety
- MongoDB database integration
- Tailwind CSS for styling
- Radix UI components
- TradingView widgets integration
- API route handlers for backend logic
- Middleware for authentication
- Environment-based configuration

#### Developer Experience
- Comprehensive documentation (77KB HTML)
- Interactive documentation with search
- Code examples with copy buttons
- Step-by-step setup guides
- API integration tutorials
- Troubleshooting section
- ESLint and Prettier configuration
- TypeScript strict mode
- Hot module replacement (HMR)
- Fast Refresh for instant updates

### 🔒 Security Features
- Environment variables for sensitive data
- CORS protection
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention (NoSQL MongoDB)
- XSS protection
- CSRF token validation
- Secure cookie handling
- Password strength requirements

### 🎨 Design System
- Consistent color palette (Orange primary: #ff4618)
- Typography scale with Geist fonts
- Spacing system (0.25rem increments)
- Shadow system (sm, md, lg, xl)
- Border radius system
- Animation timing functions
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- Icon library (Lucide React)

### 📱 Mobile Optimizations
- Touch-friendly tap targets (44x44px minimum)
- Swipe gestures for navigation
- Mobile-optimized charts and tables
- Responsive typography scaling
- Mobile sidebar with smooth animations
- Bottom sheet components
- Pull-to-refresh functionality
- Mobile-optimized forms

### 🌐 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### 📚 Documentation
- Complete HTML documentation (132KB total)
- Installation guide with 4 steps
- Configuration guide for all environment variables
- MongoDB Atlas setup tutorial
- API keys acquisition guide (Groq, Finnhub, Alpha Vantage)
- Stripe integration walkthrough
- Deployment guide for Vercel
- Usage guide with examples
- Customization guide (colors, pricing, limits)
- Troubleshooting section with common issues
- FAQ with 10+ questions answered
- Support section with contact options
- Changelog (this file!)

### 🔧 Configuration Files
- `.env.example` - Complete environment variables template
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration
- `.eslintrc.json` - ESLint rules
- `prettier.config.cjs` - Prettier formatting
- `components.json` - Shadcn UI components config

### 📦 Dependencies
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons, Framer Motion
- **Data Fetching**: Native fetch, SWR (future)
- **Forms**: React Hook Form (future)
- **Charts**: TradingView Widgets, Recharts
- **Database**: MongoDB with official driver
- **Authentication**: JWT, bcrypt
- **Payments**: Stripe SDK
- **AI**: Groq SDK for LLaMA 3
- **Utilities**: date-fns, nanoid, clsx

### 🚀 Performance
- Server-side rendering (SSR) for SEO
- Static generation where possible
- Image optimization with next/image
- Code splitting and lazy loading
- Prefetching for faster navigation
- Caching strategies for API responses
- Optimized bundle size
- Lighthouse score: 90+ (Performance)

### 📈 Analytics Ready
- Google Analytics integration ready
- Custom event tracking setup
- User behavior analytics
- Conversion tracking for subscriptions
- Error tracking and monitoring

### 🛠️ API Integrations
- **Groq API** - AI chat functionality
- **Finnhub API** - Real-time stock data
- **Alpha Vantage API** - Sentiment analysis
- **Stripe API** - Payment processing
- **TradingView** - Interactive charts
- **MongoDB Atlas** - Cloud database

### 🌟 Highlights
- Lightning-fast AI responses (< 1 second)
- Real-time data updates
- Beautiful, modern UI
- Complete SaaS infrastructure
- Production-ready codebase
- Extensive documentation
- Mobile-first approach
- SEO optimized

### 📝 Known Limitations
- Finnhub free tier: 60 API calls/minute
- Alpha Vantage free tier: 500 calls/day
- U.S. stock markets only (no international)
- English language only
- No mobile app (web-only)

### 🔮 Future Enhancements
- Multi-language support
- Cryptocurrency tracking ✅ (Added in v1.2.0)
- International stock markets
- Portfolio import from brokers
- Price alerts system
- Advanced charting tools
- Social features (share portfolios)
- Mobile apps (iOS/Android)
- Real-time WebSocket data
- Advanced AI features (predictions, recommendations)
- Custom indicators
- Backtesting functionality
- API for developers
- White-label options

### 📞 Support
- Documentation: Available at `/docs/index.html`
- Community: [Telegram Bot](https://t.me/webbuddyenvato_bot)
- Direct Support: [WebBuddy Support](https://envato.webbuddy.agency/)
- Email: [Your support email]

### 🙏 Credits
- **TradingView** for excellent charting widgets
- **Groq** for ultra-fast AI inference
- **Finnhub** for reliable market data
- **Alpha Vantage** for sentiment analysis
- **Stripe** for robust payment processing
- **CoinGecko** for cryptocurrency market data
- **Vercel** for amazing hosting platform
- **Next.js team** for the incredible framework
- **MongoDB** for powerful database solution
- **Lottie/LottieFiles** by Airbnb for beautiful, lightweight animations
- **Radix UI** for accessible component primitives
- **Lucide React** for consistent icon system
- **Framer Motion** for smooth animations
- **Tailwind CSS** for utility-first styling
- **Font Awesome** for comprehensive icon library
- **Open source community** for tools and libraries that make this possible

### 📄 License
Regular License from CodeCanyon - Envato Market

---

## Release Notes

### What's New in v1.2.0
Massive features release including cryptocurrency market tracking, paper trading simulator, feature flagging system, price alerts, market news hub, earnings calendar, trade ideas engine, sentiment analysis, email notifications, and data export/import tools. This is the most comprehensive update yet with 8+ major feature categories, 30+ new API endpoints, and 15+ new pages/components. Users now have a complete investment platform with real-time alerts, personalized news, AI-powered recommendations, virtual trading, and comprehensive market analysis tools.

### What's New in v1.1.0
Complete admin panel system with comprehensive management features for user administration, subscription management, analytics, and site configuration.

### What's New in v1.0.0
This is the initial release of InvestStocks, a complete AI-powered stock market platform. We've built a comprehensive solution that combines real-time market data, AI assistance, portfolio management, and monetization features all in one beautiful package.

### Installation
1. Extract the ZIP file
2. Run `npm install` or `pnpm install`
3. Copy `.env.example` to `.env.local`
4. Configure your API keys
5. Run `npm run dev`

See the complete documentation in the `/docs` folder for detailed setup instructions.

### Upgrade Path
- **v1.2.0**: No migration needed. Both crypto and paper trading features are ready to use.
- **v1.1.0**: No migration needed. Admin panel is ready to use after deployment.
- **v1.0.0**: This is the first release, so no upgrade is needed.

### Breaking Changes
None - all changes are backward compatible.

---

**Full Changelog**: See version history above

For support and updates, visit [WebBuddy Support](https://envato.webbuddy.agency/)
