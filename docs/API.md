# API Documentation

This document describes all API endpoints available in the Green Claim Check application.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## Authentication

Most API endpoints require authentication. Authentication is handled via Supabase Auth cookies. The middleware automatically validates authentication for protected routes.

### Headers

All authenticated requests should include:
```
Cookie: sb-<project-ref>-auth-token=<session-token>
```

## Endpoints

### 1. Scan Text

Scans marketing text for banned terms and returns compliance findings.

**Endpoint**: `POST /api/scan`

**Authentication**: Required

**Request Body**:
```json
{
  "text": "string (max 10,000 characters)"
}
```

**Response** (200 OK):
```json
{
  "results": {
    "inputText": "string",
    "timestamp": "2025-01-19T12:00:00.000Z",
    "riskScore": 45,
    "findings": {
      "critical": [
        {
          "term": {
            "term": "klimaneutral",
            "regex": "string",
            "language": "de",
            "category": "string",
            "regulation": "EU 2024/825",
            "penaltyRange": "€40,000+",
            "description": "string",
            "alternatives": ["string"],
            "severity": "critical"
          },
          "matchText": "klimaneutral",
          "position": 123,
          "lineNumber": 5,
          "context": "...context around match..."
        }
      ],
      "warnings": [],
      "minor": []
    },
    "summary": {
      "totalFindings": 1,
      "uniqueTerms": 1,
      "estimatedPenalty": "€40,000+"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid input (text too long, missing text)
- `500 Internal Server Error`: Server error

**Example**:
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=xxx" \
  -d '{"text": "Our product is klimaneutral and sustainable."}'
```

---

### 2. Fetch URL Content

Fetches and extracts text content from a URL.

**Endpoint**: `POST /api/fetch-url`

**Authentication**: Required

**Request Body**:
```json
{
  "url": "https://example.com/page"
}
```

**Response** (200 OK):
```json
{
  "text": "Extracted text content from URL",
  "title": "Page Title",
  "url": "https://example.com/page"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid URL
- `404 Not Found`: URL not accessible
- `500 Internal Server Error`: Server error

---

### 3. Create Checkout Session

Creates a Stripe checkout session for subscription.

**Endpoint**: `POST /api/create-checkout`

**Authentication**: Required

**Request Body**:
```json
{
  "plan": "starter" | "pro",
  "billingPeriod": "monthly" | "yearly",
  "cancelUrl": "https://yourdomain.com/pricing"
}
```

**Response** (200 OK):
```json
{
  "url": "https://checkout.stripe.com/pay/xxx"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid plan or billing period
- `500 Internal Server Error`: Stripe error

---

### 4. Create Portal Session

Creates a Stripe customer portal session for subscription management.

**Endpoint**: `POST /api/create-portal-session`

**Authentication**: Required

**Request Body**:
```json
{
  "returnUrl": "https://yourdomain.com/app/billing"
}
```

**Response** (200 OK):
```json
{
  "url": "https://billing.stripe.com/p/session/xxx"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Missing returnUrl
- `500 Internal Server Error`: Stripe error

---

### 5. Decrement Scans

Decrements user's scan count after a scan is performed.

**Endpoint**: `POST /api/decrement-scans`

**Authentication**: Required

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "scansRemaining": 99
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: No scans remaining
- `500 Internal Server Error`: Database error

**Note**: This endpoint is called automatically by the frontend after a successful scan.

---

### 6. Stripe Webhook

Handles Stripe webhook events for subscription management.

**Endpoint**: `POST /api/webhook/stripe`

**Authentication**: Stripe webhook signature verification

**Supported Events**:
- `checkout.session.completed`: New subscription created
- `customer.subscription.created`: Subscription created
- `customer.subscription.updated`: Subscription updated
- `customer.subscription.deleted`: Subscription cancelled

**Request**: Raw Stripe webhook payload

**Response** (200 OK):
```json
{
  "received": true
}
```

**Error Responses**:
- `400 Bad Request`: Invalid webhook signature
- `500 Internal Server Error`: Processing error

**Note**: Configure this endpoint URL in your Stripe Dashboard webhook settings.

---

## Rate Limiting

Currently, rate limiting is handled per subscription tier:
- **Free**: 3 scans/month
- **Starter**: 100 scans/month
- **Pro**: Unlimited scans

Rate limits are enforced at the application level, not via API headers.

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## CORS

CORS is configured for API routes. The following headers are set:
- `Access-Control-Allow-Origin: *` (for public endpoints)
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Webhooks

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing

Use tools like:
- **cURL**: Command-line HTTP client
- **Postman**: API testing tool
- **Insomnia**: REST client

Example with authentication:
```bash
# First, login via browser and copy the auth cookie
# Then use it in API requests:
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=your-token-here" \
  -d '{"text": "Test text"}'
```

## Future API Features

- Public API with API keys
- Rate limiting headers
- API versioning
- OpenAPI/Swagger documentation
- GraphQL endpoint
