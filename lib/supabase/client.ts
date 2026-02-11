import { createClient } from '@supabase/supabase-js';
import { createCookieStorage } from './cookie-storage';

// For client components only
// This file should NOT import next/headers as it's used in client components
export const createSupabaseClient = () => {
  // In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available in the browser
  // They need to be accessed directly, not via process.env at build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  // Validate that we have both required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = `Missing Supabase environment variables. 
      Please check your .env.local file and ensure:
      - NEXT_PUBLIC_SUPABASE_URL is set
      - NEXT_PUBLIC_SUPABASE_ANON_KEY is set
      
      Current values:
      - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'MISSING'}`;
    
    console.error(errorMessage);
    
    // In development, show a helpful error
    if (typeof window !== 'undefined') {
      throw new Error('Supabase configuration missing. Please check your .env.local file.');
    }
    
    // Fallback for server-side rendering
    throw new Error('Missing Supabase environment variables');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. URL must start with http:// or https://`);
  }

  // Validate URL contains supabase.co or supabase.in
  if (!supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('supabase.in')) {
    console.warn(`Warning: Supabase URL doesn't look like a valid Supabase URL: ${supabaseUrl}`);
  }

  // Create a Supabase client that syncs between localStorage and cookies
  // This allows the middleware to read the session from cookies
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? createCookieStorage() : undefined,
    },
  });

  // Log configuration in development (without sensitive data)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Supabase Client initialized:', {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey,
      storage: 'cookie-synced',
    });
  }

  return client;
};
