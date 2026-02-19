import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const cookieStore = await cookies()

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            // Provide the getAll/setAll interface expected by @supabase/ssr
            getAll() {
              return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                // cookieStore.set expects { name, value, ...options }
                cookieStore.set({ name, value, ...options })
              })
            },
          },
        }
      )

      // Exchange the temporary code for a session and log the result for debugging
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) console.error('exchangeCodeForSession error:', error)
      else console.log('exchangeCodeForSession success:', !!data?.session)

      if (!error) {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } catch (err) {
      console.error('Callback route error:', err)
    }
  }

  // If there's an error, send them home
  return NextResponse.redirect(`${origin}/dashboard`)
}