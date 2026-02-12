import { NextRequest, NextResponse } from "next/server";
import { scanText } from "@/lib/scanner-logic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: "Text exceeds maximum length of 10,000 characters" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const result = scanText(text);

    return NextResponse.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
