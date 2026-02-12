import { NextRequest, NextResponse } from 'next/server';

// Stripe webhooks disabled - this is a free app with no payments
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Webhooks are not enabled for this application' },
    { status: 404 }
  );
}
