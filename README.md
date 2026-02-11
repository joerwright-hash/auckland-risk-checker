# Green Claim Check

A production-ready SaaS web application that scans marketing text for potentially illegal environmental claims under EU regulation 2024/825 (effective September 2026). Built with Next.js 14, TypeScript, Supabase, and Stripe.

## 🎯 Overview

Green Claim Check helps businesses ensure their marketing materials comply with EU Green Claims Directive regulations. The application scans text for 260+ banned terms and phrases, categorizes findings by severity, and provides actionable compliance reports.

## ✨ Features

### Core Functionality
- **Text Scanning**: Real-time scanning of marketing text for banned terms
- **260+ Banned Terms**: Comprehensive database covering critical, warning, and minor violations
- **Risk Scoring**: Weighted scoring system (0-100%) based on violation severity
- **PDF Export**: Professional compliance reports with findings and recommendations
- **Scan History**: Cloud-based storage of scan history with search functionality
- **Multi-Input Support**: Text input, document upload (.txt, .docx, .pdf), and URL fetching

### User Management
- **Authentication**: Email/password and OAuth (Google, GitHub) via Supabase
- **User Profiles**: Account management with profile editing
- **Subscription Management**: Stripe integration for subscription plans
- **Usage Tracking**: Scan limits and usage analytics per subscription tier

### User Interface
- **Modern Design**: Clean, professional UI with green/amber color scheme
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive**: Mobile-first design, fully responsive across all devices
- **Internationalization**: English and German language support
- **Animations**: Smooth transitions and animations using Framer Motion

### Subscription Tiers
- **Free**: 3 scans/month, 500 characters limit
- **Starter**: 100 scans/month, unlimited characters
- **Pro**: Unlimited scans, API access, team features
- **Premium**: Enterprise features, white-label options

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: Zod validation
- **Notifications**: Sonner (toast notifications)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **File Processing**: Mammoth (DOCX), PDF.js (PDF)

### Payments
- **Payment Processor**: Stripe
- **Subscription Management**: Stripe Subscriptions API
- **Webhooks**: Stripe webhook handling

### PDF Generation
- **Library**: jsPDF with jspdf-autotable
- **Features**: Professional reports with tables, charts, and formatting

### Analytics
- **Platform**: Vercel Analytics

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Supabase Account**: For database and authentication
- **Stripe Account**: For payment processing
- **Vercel Account**: (Recommended) For deployment

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/green-claim-check.git
cd green-claim-check
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx

# Application URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed setup instructions.

### 4. Database Setup

Run the Supabase migrations in order:

```bash
# Apply migrations via Supabase Dashboard SQL Editor or CLI
# Files are located in: supabase/migrations/
```

Required migrations:
- `001_create_scans_table.sql`
- `002_create_user_subscriptions_table.sql`
- `003_add_scans_tracking.sql`
- `004_add_summary_column_if_missing.sql`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
green-claim-check/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── create-checkout/     # Stripe checkout creation
│   │   ├── create-portal-session/ # Stripe customer portal
│   │   ├── decrement-scans/     # Scan usage tracking
│   │   ├── fetch-url/            # URL content fetching
│   │   ├── scan/                 # Text scanning endpoint
│   │   └── webhook/stripe/      # Stripe webhook handler
│   ├── app/                     # Protected app routes
│   │   ├── account/              # User account management
│   │   ├── billing/              # Subscription & billing
│   │   ├── history/              # Scan history
│   │   ├── reports/               # Usage reports
│   │   ├── settings/             # User settings
│   │   └── page.tsx              # Main scanner interface
│   ├── auth/                     # Authentication pages
│   │   ├── callback/             # OAuth callback handler
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   ├── logout/                   # Logout route
│   ├── pricing/                  # Pricing page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── app/                      # App-specific components
│   ├── auth/                     # Auth components
│   ├── landing/                  # Landing page components
│   ├── layout/                    # Layout components
│   ├── scanner/                  # Scanner components
│   └── ui/                       # Reusable UI components
├── contexts/                     # React contexts
│   └── LanguageContext.tsx       # i18n context
├── lib/                          # Utility libraries
│   ├── banned-terms.ts           # Banned terms database
│   ├── data/                     # Data files
│   ├── pdf-export.ts             # PDF generation
│   ├── scanner-logic.ts          # Core scanning algorithm
│   ├── stripe/                    # Stripe utilities
│   ├── supabase/                 # Supabase utilities
│   ├── subscription-limits.ts    # Subscription logic
│   └── translations.ts           # i18n translations
├── middleware.ts                  # Next.js middleware (auth)
├── supabase/
│   └── migrations/               # Database migrations
└── public/                        # Static assets
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier (recommended) for formatting

## 📚 Documentation

- [API Documentation](./docs/API.md) - API endpoints and usage
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment instructions
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🔐 Security

- Authentication via Supabase Auth
- Row Level Security (RLS) enabled on database tables
- API routes protected by middleware
- Environment variables for sensitive data
- CORS configured for API routes

## 🧪 Testing

Currently, testing is manual. Future plans include:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

## 🚢 Deployment

The application is optimized for deployment on Vercel. See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## 📊 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `STRIPE_PRICE_*` | Stripe price IDs | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This tool is for guidance only and does not constitute legal advice. Always consult with legal experts for final compliance verification. The application helps identify potential issues but cannot guarantee full compliance with EU regulations.

## 📞 Support

For support, email support@greenclaimcheck.com or open an issue on GitHub.

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and improvements.

---

Built with ❤️ for EU compliance
