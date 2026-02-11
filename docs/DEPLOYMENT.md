# Deployment Guide

This guide covers deploying Green Claim Check to production environments, with detailed instructions for Vercel (recommended) and other platforms.

## Prerequisites

- Node.js 18+ installed locally
- Accounts for:
  - Vercel (or your hosting platform)
  - Supabase
  - Stripe
- Git repository access

## Quick Start (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)

### 3. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Detailed Setup

### Supabase Configuration

#### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

#### 2. Run Database Migrations

In Supabase Dashboard → SQL Editor, run migrations in order:

1. `001_create_scans_table.sql`
2. `002_create_user_subscriptions_table.sql`
3. `003_add_scans_tracking.sql`
4. `004_add_summary_column_if_missing.sql`

#### 3. Configure Row Level Security (RLS)

RLS policies are included in migrations. Verify they're enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### 4. Set Up Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure OAuth providers (Google, GitHub) if needed
4. Set redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### Stripe Configuration

#### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Switch to test mode for development

#### 2. Create Products and Prices

1. Go to Products → Add Product
2. Create products for each plan:
   - **Starter Monthly**: €19/month
   - **Starter Yearly**: €15/month (billed annually)
   - **Pro Monthly**: €49/month
   - **Pro Yearly**: €39/month (billed annually)

3. Copy Price IDs from each product
4. Add Price IDs to environment variables

#### 3. Configure Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to environment variables as `STRIPE_WEBHOOK_SECRET`

#### 4. Configure Customer Portal

1. Go to Settings → Billing → Customer portal
2. Enable customer portal
3. Configure branding and features

### Environment Variables

Create `.env.local` for local development:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to Git!

## Deployment Platforms

### Vercel (Recommended)

**Why Vercel?**
- Optimized for Next.js
- Automatic deployments from Git
- Built-in CI/CD
- Edge functions support
- Analytics included

**Steps**:
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

**Custom Domain**:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

### Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

### Self-Hosted (Docker)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t green-claim-check .
docker run -p 3000:3000 --env-file .env.local green-claim-check
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test authentication (signup/login)
- [ ] Test text scanning functionality
- [ ] Verify Stripe checkout flow
- [ ] Test webhook endpoint (use Stripe CLI)
- [ ] Check database connections
- [ ] Verify email sending (if configured)
- [ ] Test PDF export
- [ ] Check mobile responsiveness
- [ ] Verify analytics tracking

## Monitoring

### Vercel Analytics

Automatically enabled when `@vercel/analytics` is installed. View in Vercel Dashboard → Analytics.

### Error Monitoring

Consider adding:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: APM and logging

## Performance Optimization

### Build Optimization

- Enable Next.js Image Optimization
- Use `next/image` for images
- Enable compression
- Configure CDN caching

### Database Optimization

- Add indexes for frequently queried columns
- Use connection pooling (Supabase handles this)
- Monitor query performance

## Security Checklist

- [ ] Environment variables secured
- [ ] RLS policies enabled on all tables
- [ ] API routes protected by middleware
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common deployment issues.

## Rollback

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Manual Rollback

```bash
git revert HEAD
git push origin main
# Vercel will automatically redeploy
```

## CI/CD

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Support

For deployment issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review Vercel build logs
3. Check Supabase logs
4. Contact support
