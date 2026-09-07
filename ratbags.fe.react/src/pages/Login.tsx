import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../hooks/useAuth'
import { LoginError } from '../api/accounts'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err instanceof LoginError
          ? err.message
          : 'Unable to reach the server. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="login">
      <div className="login-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in</h1>
        <p className="lead">Enter your details to access your account.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <Link className="login-links" to="/forgot-password">
            Forgot your password?
          </Link>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
            <FontAwesomeIcon icon={faArrowRightToBracket} />
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
