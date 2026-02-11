/**
 * Custom storage adapter that syncs between localStorage and cookies
 * This allows the middleware to read the session from cookies while
 * the client still uses localStorage for faster access
 */

export function createCookieStorage() {
  if (typeof window === 'undefined') {
    // Server-side: return a no-op storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Get project ref from URL to create the cookie name
  // Supabase uses: sb-<project-ref>-auth-token as the storage key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectRef = supabaseUrl.match(/https?:\/\/(.+?)\.supabase\.co/)?.[1];
  const authStorageKey = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
  const authCookieName = authStorageKey; // Use same name for cookie and localStorage key
  
  return {
    getItem: (key: string): string | null => {
      // First, try to get from localStorage (primary storage)
      try {
        const localStorageValue = localStorage.getItem(key);
        if (localStorageValue) {
          // Also sync to cookie if it's the auth token
          if (key === authStorageKey && localStorageValue) {
            // Sync to cookie in background (don't block)
            setTimeout(() => {
              try {
                const sessionData = JSON.parse(localStorageValue);
                let expires = '';
                if (sessionData?.expires_at) {
                  const expiryDate = new Date(sessionData.expires_at * 1000);
                  expires = `; expires=${expiryDate.toUTCString()}`;
                } else {
                  const oneYear = new Date();
                  oneYear.setFullYear(oneYear.getFullYear() + 1);
                  expires = `; expires=${oneYear.toUTCString()}`;
                }
                const cookieOptions = `${expires}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
                document.cookie = `${authCookieName}=${encodeURIComponent(localStorageValue)}${cookieOptions}`;
              } catch (e) {
                // Ignore sync errors
              }
            }, 0);
          }
          return localStorageValue;
        }
      } catch (e) {
        console.warn('Failed to read from localStorage:', e);
      }

      // Fallback: try to get from cookies
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === key || name === authCookieName) {
            const cookieValue = decodeURIComponent(value);
            // Sync back to localStorage if found in cookie
            if (cookieValue && key === authStorageKey) {
              try {
                localStorage.setItem(key, cookieValue);
              } catch (e) {
                // Ignore sync errors
              }
            }
            return cookieValue;
          }
        }
      } catch (e) {
        console.warn('Failed to read from cookies:', e);
      }

      return null;
    },
    
    setItem: (key: string, value: string): void => {
      try {
        // Store in localStorage
        localStorage.setItem(key, value);
        
        // Debug log in development
        if (process.env.NODE_ENV === 'development' && key.includes('auth')) {
          console.log('Cookie Storage: Setting auth token in localStorage', {
            key,
            hasValue: !!value,
            valueLength: value?.length,
          });
        }
      } catch (e) {
        console.warn('Failed to write to localStorage:', e);
      }

      // Also store in cookie so middleware can access it
      // This is CRITICAL - the middleware needs cookies, not localStorage
      try {
        // Parse the session data to get expiration
        let expires = '';
        try {
          const sessionData = JSON.parse(value);
          if (sessionData?.expires_at) {
            const expiryDate = new Date(sessionData.expires_at * 1000);
            expires = `; expires=${expiryDate.toUTCString()}`;
          } else {
            // Default: 1 year
            const oneYear = new Date();
            oneYear.setFullYear(oneYear.getFullYear() + 1);
            expires = `; expires=${oneYear.toUTCString()}`;
          }
        } catch {
          // If parsing fails, use 1 year default
          const oneYear = new Date();
          oneYear.setFullYear(oneYear.getFullYear() + 1);
          expires = `; expires=${oneYear.toUTCString()}`;
        }

        // Set cookie with proper domain and path
        // Important: Don't set Secure for localhost
        const isSecure = window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
        const cookieOptions = `${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        
        // Always set the auth cookie if this is an auth-related key
        if (key === authStorageKey || key.includes('auth') || key.includes('token')) {
          const cookieString = `${authCookieName}=${encodeURIComponent(value)}${cookieOptions}`;
          document.cookie = cookieString;
          
          // Verify cookie was set
          const cookieWasSet = document.cookie.includes(authCookieName);
          
          // Debug log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Cookie Storage: Setting auth cookie', {
              cookieName: authCookieName,
              key,
              hasValue: !!value,
              valueLength: value?.length,
              expires,
              cookieWasSet,
              allCookies: document.cookie,
            });
          }
          
          if (!cookieWasSet) {
            console.error('Failed to set auth cookie!', {
              cookieName: authCookieName,
              cookieString,
            });
          }
        }
        
        // Also set the key-based cookie as fallback
        if (key !== authCookieName && key !== authStorageKey) {
          document.cookie = `${key}=${encodeURIComponent(value)}${cookieOptions}`;
        }
      } catch (e) {
        console.error('Failed to write to cookies:', e);
      }
    },
    
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove from localStorage:', e);
      }

      // Remove from cookies
      try {
        document.cookie = `${authCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        if (key !== authCookieName) {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      } catch (e) {
        console.warn('Failed to remove from cookies:', e);
      }
    },
  };
}
