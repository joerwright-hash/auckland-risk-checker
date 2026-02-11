import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const demoText = requestUrl.searchParams.get("demoText");
  const next = requestUrl.searchParams.get("next") || "/app";

  if (code) {
    try {
      // Use Server Supabase Client to properly handle cookies
      const supabase = createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Auth callback error:", error);
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }

      // Success - get the session to ensure it's set
      const { data: { session: callbackSession } } = await supabase.auth.getSession();
      
      if (callbackSession) {
        // Success - redirect to app with session in cookies
        // If demoText is present, pass it as query parameter for auto-scan
        const redirectUrl = demoText 
          ? new URL(`${next}?autoScan=true&demoText=${encodeURIComponent(demoText)}`, requestUrl.origin)
          : new URL(next, requestUrl.origin);
        
        const response = NextResponse.redirect(redirectUrl);
        
        // Ensure cookies are set properly
        // The session should already be in cookies from exchangeCodeForSession
        // but we make sure by refreshing
        return response;
      } else {
        // Session not found after exchange - this shouldn't happen
        console.error('Session not found after code exchange');
        return NextResponse.redirect(
          new URL('/auth/login?error=Session not created', requestUrl.origin)
        );
      }
    } catch (error: any) {
      console.error("Unexpected error in auth callback:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
      );
    }
  }

  // No code parameter - redirect to login
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
