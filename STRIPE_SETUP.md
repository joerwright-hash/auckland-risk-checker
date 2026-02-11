# Stripe Integration Setup Guide

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Supabase Service Role Key (for webhooks)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Base URL
NEXT_PUBLIC_URL=http://localhost:3000
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to Stripe Dashboard → Products
2. Create products for:
   - **Starter** (Monthly & Yearly)
   - **Pro** (Monthly & Yearly)
3. Copy the Price IDs and add them to `.env.local`

### 2. Configure Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

This will give you a webhook secret for local testing.

## Test Cards

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Database Migration

Run the migration to create the `user_subscriptions` table:

```sql
-- See: supabase/migrations/002_create_user_subscriptions_table.sql
```

## Testing Flow

1. Sign up for an account
2. Go to Pricing page
3. Click "Start Trial" on Starter or Pro plan
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Verify subscription in database
7. Check webhook logs in Stripe Dashboard
