import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isBenignPopupClosure } from '../lib/googleAuth'
import './LoginPage.css'

export function LoginPage() {
  const { logIn, signUp, logInWithGoogle, user, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  if (!isConfigured) {
    return (
      <div className="login-page">
        <LoginBrand />
        <div className="login-card">
          <p className="login-page__notice">
            Firebase isn't configured. Add credentials to <code>.env.local</code>, or jump straight
            in.
          </p>
          <Link to="/" className="login-page__submit">
            Continue without an account
          </Link>
        </div>
      </div>
    )
  }

  const handleGoogle = async () => {
    setError('')
    setSubmitting(true)
    try {
      await logInWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      // Popup closed/cancelled (or a COOP false-positive): if sign-in actually
      // went through, the auth-state listener redirects us, so stay quiet.
      if (!isBenignPopupClosure(err)) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Name is required')
          return
        }
        await signUp(email, password, name.trim())
      } else {
        await logIn(email, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <LoginBrand />

      <div className="login-card">
        <h2 className="login-card__heading">
          {mode === 'signup' ? 'Start counting' : 'Welcome back'}
        </h2>
        <p className="login-card__sub">
          {mode === 'signup'
            ? 'Build your first decision tree in two minutes.'
            : 'Pick up your streak where you left off.'}
        </p>

      <button
        type="button"
        className="login-page__google"
        onClick={handleGoogle}
        disabled={submitting}
      >
        <svg className="login-page__google-icon" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="login-page__divider">
        <span>or</span>
      </div>

      <form className="login-page__form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="login-page__field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}
        <div className="login-page__field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="login-page__field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        {error && <p className="login-page__error">{error}</p>}

        <button type="submit" className="login-page__submit" disabled={submitting}>
          {mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>

      <button
        type="button"
        className="login-page__toggle"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
      </div>
    </div>
  )
}

function LoginBrand() {
  return (
    <div className="login-brand">
      <svg className="login-brand__mark" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="20" cy="20" r="5" />
        <circle cx="44" cy="20" r="5" />
        <circle cx="32" cy="32" r="5" className="login-brand__dot-pick" />
        <circle cx="20" cy="44" r="5" />
        <circle cx="44" cy="44" r="5" />
      </svg>
      <div className="login-brand__text">
        <span className="eyebrow">AP Statistics</span>
        <h1 className="login-brand__name">Combinatorics</h1>
      </div>
    </div>
  )
}
