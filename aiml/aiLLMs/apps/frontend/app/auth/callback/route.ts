import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  //directed towards route after login by supabase
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
//code is token which supabase sends to represent login attempt
// next is basically where to go
  if (code) {
    const cookieStore = await cookies() 
    //cookies are given access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // `setAll` called from a Server Component.
              // can be ignored if middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
// client can read/write cookies , exchange auth codes, set session tokens
// if server then ignore
// access and refresh tokens
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    //sends the code to supabase , verifies it, returns access, referesh token with user info
    // these tokens are saved in cookies
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url))
}
// if sucessful to redirect to dashboard and if not then login page