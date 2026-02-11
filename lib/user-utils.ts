import { createSupabaseClient } from "@/lib/supabase/client";

/**
 * Get user display name from auth user metadata
 */
export function getUserDisplayName(user: any): string {
  const displayName = user?.user_metadata?.display_name;
  const fullName = user?.user_metadata?.full_name;
  const email = user?.email;
  
  return displayName || fullName || email?.split("@")[0] || "User";
}

/**
 * Get user initials from auth user metadata
 */
export function getUserInitials(user: any): string {
  const displayName = user?.user_metadata?.display_name;
  const fullName = user?.user_metadata?.full_name;
  const email = user?.email;
  
  const name = displayName || fullName;
  
  if (name) {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (email) {
    return email[0].toUpperCase();
  }
  
  return "U";
}

/**
 * Get cached user info from sessionStorage (if available)
 */
export function getCachedUserInfo(): { userName: string; userInitials: string } | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = sessionStorage.getItem("userInfo");
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (less than 5 minutes old)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return {
          userName: parsed.userName,
          userInitials: parsed.userInitials,
        };
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return null;
}

/**
 * Cache user info to sessionStorage
 */
export function cacheUserInfo(userName: string, userInitials: string): void {
  if (typeof window === "undefined") return;
  
  try {
    sessionStorage.setItem("userInfo", JSON.stringify({
      userName,
      userInitials,
      timestamp: Date.now(),
    }));
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Fetch current user and return display name and initials
 */
export async function getCurrentUserInfo(): Promise<{
  userName: string;
  userInitials: string;
  userId: string | null;
}> {
  // Try to get cached user info first
  const cached = getCachedUserInfo();
  if (cached) {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        userName: cached.userName,
        userInitials: cached.userInitials,
        userId: user.id,
      };
    }
  }
  
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      userName: "User",
      userInitials: "U",
      userId: null,
    };
  }
  
  const userName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);
  
  // Cache the user info
  cacheUserInfo(userName, userInitials);
  
  return {
    userName,
    userInitials,
    userId: user.id,
  };
}
