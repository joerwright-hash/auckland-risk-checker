import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GreenClaimCheck/1.0)',
      },
      // Set timeout to 30 seconds
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check if response is HTML
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return NextResponse.json(
        { error: 'URL does not point to an HTML page' },
        { status: 400 }
      );
    }

    // Get HTML content
    const html = await response.text();

    // Extract text from HTML (simple approach - remove script, style tags, etc.)
    let text = html
      // Remove script and style elements
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove HTML tags but keep text
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Replace multiple whitespace with single space
      .replace(/\s+/g, ' ')
      // Trim
      .trim();

    // Decode remaining HTML entities (basic)
    const decodeHtmlEntities = (text: string) => {
      const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
      };
      return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity);
    };

    text = decodeHtmlEntities(text);

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: 'No text content found on the page' },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse (e.g., 1MB of text)
    const maxLength = 1024 * 1024; // 1MB
    if (text.length > maxLength) {
      text = text.substring(0, maxLength);
    }

    return NextResponse.json({
      text,
      url: url,
      length: text.length,
    });
  } catch (error: any) {
    console.error('Error fetching URL:', error);

    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout. The URL took too long to respond.' },
        { status: 408 }
      );
    }

    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Failed to connect to URL. Please check if the URL is correct and accessible.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch URL content' },
      { status: 500 }
    );
  }
}
