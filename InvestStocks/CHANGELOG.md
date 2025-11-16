# Changelog

All notable changes to StokAlert will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-23

### 🎉 Initial Release

The first public release of StokAlert - AI-Powered Stock Market Investment Platform.

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
- Cryptocurrency tracking
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

### What's New in v1.0.0
This is the initial release of StokAlert, a complete AI-powered stock market platform. We've built a comprehensive solution that combines real-time market data, AI assistance, portfolio management, and monetization features all in one beautiful package.

### Installation
1. Extract the ZIP file
2. Run `npm install` or `pnpm install`
3. Copy `.env.example` to `.env.local`
4. Configure your API keys
5. Run `npm run dev`

See the complete documentation in the `/docs` folder for detailed setup instructions.

### Upgrade Path
This is the first release, so no upgrade is needed.

### Breaking Changes
None - initial release.

---

**Full Changelog**: Initial Release (v1.0.0)

For support and updates, visit [WebBuddy Support](https://envato.webbuddy.agency/)

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

