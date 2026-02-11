import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create Supabase client for middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // In development, allow access if env vars are missing
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing Supabase environment variables in middleware');
      // Continue without auth check in development
      return res;
    }
    // In production, block access
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Extract cookies from request
  const cookieHeader = req.headers.get('cookie') || '';
  
  // Helper to extract cookie values
  const getCookieValue = (name: string): string | null => {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`(^| )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // Extract project ref from URL to find the correct cookie name
  const projectRef = supabaseUrl.match(/https?:\/\/(.+?)\.supabase\.co/)?.[1];
  const authCookieName = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
  
  // Create Supabase client with custom storage adapter that reads from cookies
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string): string | null => {
          // First, try to get the auth token cookie
          const authToken = getCookieValue(authCookieName);
          if (authToken) {
            // If the key is 'auth-token' or we're looking for the session, return the cookie value
            if (key === 'auth-token' || key.includes('auth')) {
              return authToken;
            }
            // For other keys, try to parse and extract
            try {
              const sessionData = JSON.parse(authToken);
              if (key === 'access_token' && sessionData?.access_token) {
                return sessionData.access_token;
              }
              if (key === 'refresh_token' && sessionData?.refresh_token) {
                return sessionData.refresh_token;
              }
            } catch {
              // If parsing fails, return the raw value for auth-related keys
              if (key.includes('auth')) {
                return authToken;
              }
            }
          }
          
          // Fallback: try to find cookie by key name directly
          return getCookieValue(key);
        },
        setItem: () => {}, // No-op in middleware
        removeItem: () => {}, // No-op in middleware
      },
    },
    global: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const { pathname } = req.nextUrl;

  // Protected routes - require authentication
  const protectedRoutes = ['/app'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protected API routes
  const protectedApiRoutes = ['/api/scan'];
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get session
  let session = null;
  try {
    // First, try to get the raw cookie value
    const rawCookieValue = getCookieValue(authCookieName);
    
    if (rawCookieValue) {
      try {
        // Try to parse the cookie value directly
        const parsedSession = JSON.parse(rawCookieValue);
        
        // If we have a valid session structure with access_token and user, we have a valid session
        if (parsedSession?.access_token && parsedSession?.user) {
          // Create session object that matches Supabase's session format
          session = {
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token,
            expires_at: parsedSession.expires_at,
            expires_in: parsedSession.expires_in,
            token_type: parsedSession.token_type || 'bearer',
            user: parsedSession.user,
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Session found in cookie and parsed successfully:', {
              hasAccessToken: !!session.access_token,
              hasUser: !!session.user,
              userId: session.user?.id,
              email: session.user?.email,
            });
          }
        } else {
          // Cookie exists but doesn't have valid session structure
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Cookie found but invalid session structure:', {
              hasAccessToken: !!parsedSession?.access_token,
              hasUser: !!parsedSession?.user,
              keys: Object.keys(parsedSession || {}),
            });
          }
          session = null;
        }
      } catch (parseError) {
        // Failed to parse cookie
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Failed to parse session cookie:', parseError);
        }
        session = null;
      }
    } else {
      // No cookie found
      if (process.env.NODE_ENV === 'development' && (isProtectedRoute || isProtectedApiRoute)) {
        console.warn('⚠️ No auth cookie found');
      }
      session = null;
    }
  } catch (error) {
    // If session check fails, treat as unauthenticated
    console.error('❌ Error checking session in middleware:', error);
    session = null;
  }

  // Public routes - allow access without authentication
  const publicRoutes = ['/', '/auth', '/pricing', '/api/webhook', '/api/fetch-url'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Debug: Log session status in development
  if (process.env.NODE_ENV === 'development' && (isProtectedRoute || isProtectedApiRoute)) {
    // Extract all cookies for debugging
    const allCookies: Record<string, string> = {};
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) {
          allCookies[name] = value ? decodeURIComponent(value).substring(0, 50) + '...' : '';
        }
      });
    }
    
    console.log('Middleware auth check:', {
      pathname,
      hasSession: !!session,
      hasCookies: !!cookieHeader,
      cookieCount: cookieHeader ? cookieHeader.split(';').length : 0,
      cookieNames: Object.keys(allCookies),
      lookingForCookie: authCookieName,
      foundAuthCookie: !!getCookieValue(authCookieName),
    });
  }

  // If accessing protected route and not authenticated, redirect to login
  if ((isProtectedRoute || isProtectedApiRoute) && !session) {
    // Only redirect if we're actually trying to access a protected route
    // Don't redirect if we're already on the login page
    if (pathname !== '/auth/login' && pathname !== '/auth/signup') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: res.headers,
      });
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
