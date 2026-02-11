import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// For server components and API routes only
// This file can use next/headers as it's only used in server contexts
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client in development if env vars are missing
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing Supabase environment variables. Using mock client.');
      return createClient(
        'https://placeholder.supabase.co',
        'placeholder-key'
      );
    }
    throw new Error('Missing Supabase environment variables');
  }
  
  const cookieStore = cookies();
  
  // Build cookie header string from cookie store
  const cookieHeader = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');
  
  // Extract project ref for auth cookie name
  const projectRef = supabaseUrl.match(/https?:\/\/(.+?)\.supabase\.co/)?.[1];
  const authCookieName = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
  
  // Helper to get cookie value
  const getCookieValue = (name: string): string | null => {
    const cookie = cookieStore.get(name);
    return cookie ? cookie.value : null;
  };
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string): string | null => {
          // Try to get auth token from cookie
          if (key === authCookieName || key.includes('auth')) {
            const authToken = getCookieValue(authCookieName);
            if (authToken) {
              return authToken;
            }
          }
          
          // Fallback: try to get by key name
          return getCookieValue(key);
        },
        setItem: () => {}, // No-op in server context
        removeItem: () => {}, // No-op in server context
      },
    },
    global: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });
};
