'use client'
import { createClient } from '@/utils/supabase'

export default function LoginPage() {
  const supabase = createClient()
  const handleLogin = () => {
    const redirectBase = (process.env.NEXT_PUBLIC_APP_URL as string) || window.location.origin

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${redirectBase}/callback` },
    })
  }

  return (
   <div className="vh-100 bg-light">
      <div className="container py-4">
        <header className="mb-4">
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Garner</h1>
            <div className="text-muted small">collect your favorites with ease</div>
          </div>
        </header>

        <main className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
          <div className="card p-5 shadow-sm border-0 text-center">
            <h2 className="fw-bold text-primary mb-3">Login</h2>
            <button onClick={handleLogin} className="btn btn-dark btn-lg px-5 rounded-pill">
              Sign in with Google
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}