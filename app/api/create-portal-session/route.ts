import { NextRequest, NextResponse } from 'next/server';

// Stripe portal disabled - this is a free app
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'This app is free and does not require payment' },
    { status: 404 }
  );
}
