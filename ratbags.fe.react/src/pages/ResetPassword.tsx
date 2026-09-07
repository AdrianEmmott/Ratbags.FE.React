import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faKey } from '@fortawesome/free-solid-svg-icons'
import { resetPassword, ResetPasswordError } from '../api/accounts'
import './Login.css'

function ResetPassword() {
  const { userId, token } = useParams<{ userId: string; token: string }>()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!userId || !token) {
      setError('This reset link is invalid. Please request a new one.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ userId, token, password })
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof ResetPasswordError
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
        {submitted ? (
          <>
            <span className="eyebrow">All set</span>
            <h1>
              <FontAwesomeIcon icon={faCheck} /> Password reset
            </h1>
            <p className="lead">Your password has been updated. You can now log in.</p>
            <Link className="btn btn-primary" to="/login">
              Log in
            </Link>
          </>
        ) : (
          <>
            <span className="eyebrow">Reset your password</span>
            <h1>Choose a new password</h1>
            <p className="lead">Enter and confirm your new password below.</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="password">
                New password
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm password
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Resetting…' : 'Reset password'}
                <FontAwesomeIcon icon={faKey} />
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

export default ResetPassword
