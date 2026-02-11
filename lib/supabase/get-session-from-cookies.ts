/**
 * Utility to extract Supabase session from cookies in server context
 * This is more reliable than getSession() when using cookie-based auth
 */

import { cookies } from 'next/headers';

export interface SessionFromCookie {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Gets the Supabase session directly from cookies
 * This is more reliable than getSession() when using cookie-based auth
 */
export async function getSessionFromCookies(): Promise<SessionFromCookie | null> {
  try {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectRef = supabaseUrl.match(/https?:\/\/(.+?)\.supabase\.co/)?.[1];
    const authCookieName = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
    
    const authCookie = cookieStore.get(authCookieName);
    
    if (!authCookie?.value) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  No auth cookie found:', {
          cookieName: authCookieName,
          allCookies: cookieStore.getAll().map(c => c.name),
        });
      }
      return null;
    }

    try {
      const parsedSession = JSON.parse(authCookie.value);
      
      // Validate session structure
      if (parsedSession?.access_token && parsedSession?.user) {
        const session: SessionFromCookie = {
          access_token: parsedSession.access_token,
          refresh_token: parsedSession.refresh_token,
          expires_at: parsedSession.expires_at,
          expires_in: parsedSession.expires_in,
          token_type: parsedSession.token_type || 'bearer',
          user: parsedSession.user,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Session extracted from cookie:', {
            userId: session.user?.id,
            email: session.user?.email,
          });
        }
        
        return session;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️  Invalid session structure in cookie:', {
            hasAccessToken: !!parsedSession?.access_token,
            hasUser: !!parsedSession?.user,
            keys: Object.keys(parsedSession || {}),
          });
        }
        return null;
      }
    } catch (parseError) {
      console.error('❌ Failed to parse session cookie:', parseError);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting session from cookies:', error);
    return null;
  }
}
