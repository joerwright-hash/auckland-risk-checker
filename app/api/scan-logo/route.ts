import { NextRequest, NextResponse } from 'next/server';
import { analyseLogo } from '@/lib/logo-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileSize, extractedText, manualLabelName } = body;

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'fileName is required and must be a string' },
        { status: 400 }
      );
    }

    if (!fileSize || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'fileSize is required and must be a number' },
        { status: 400 }
      );
    }

    const results = analyseLogo(
      fileName,
      fileSize,
      extractedText || undefined,
      manualLabelName || undefined,
    );

    return NextResponse.json(results, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error in logo scan API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
