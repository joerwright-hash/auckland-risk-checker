import { NextRequest, NextResponse } from 'next/server';

// Scan limits removed - this is a free app with unlimited scans
export async function POST(req: NextRequest) {
  return NextResponse.json({
    success: true,
    scansRemaining: null,
    isUnlimited: true,
  });
}
