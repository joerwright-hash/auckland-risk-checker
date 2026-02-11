import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Mark route as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to landing page
    }
    
    // Redirect to landing page
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    // Always redirect to landing page even on error
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }
}
