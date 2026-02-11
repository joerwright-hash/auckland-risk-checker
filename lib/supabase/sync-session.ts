/**
 * Utility to sync Supabase session from localStorage to cookies
 * This ensures the middleware can read the session
 */

export function syncSessionToCookies() {
  if (typeof window === 'undefined') return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectRef = supabaseUrl.match(/https?:\/\/(.+?)\.supabase\.co/)?.[1];
  const authStorageKey = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
  const authCookieName = authStorageKey;

  try {
    // Get session from localStorage
    const sessionData = localStorage.getItem(authStorageKey);
    
    if (!sessionData) {
      console.log('No session found in localStorage to sync');
      return;
    }

    // Parse expiration
    let expires = '';
    try {
      const parsed = JSON.parse(sessionData);
      if (parsed?.expires_at) {
        const expiryDate = new Date(parsed.expires_at * 1000);
        expires = `; expires=${expiryDate.toUTCString()}`;
      } else {
        const oneYear = new Date();
        oneYear.setFullYear(oneYear.getFullYear() + 1);
        expires = `; expires=${oneYear.toUTCString()}`;
      }
    } catch {
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      expires = `; expires=${oneYear.toUTCString()}`;
    }

    // Set cookie
    const isSecure = window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
    const cookieOptions = `${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    document.cookie = `${authCookieName}=${encodeURIComponent(sessionData)}${cookieOptions}`;

    console.log('Session synced to cookies', {
      cookieName: authCookieName,
      hasData: !!sessionData,
      expires,
    });
  } catch (error) {
    console.error('Failed to sync session to cookies:', error);
  }
}
