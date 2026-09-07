import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { requestPasswordReset, ResetPasswordError } from '../api/accounts'
import './Login.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
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
            <span className="eyebrow">Check your email</span>
            <h1>
              <FontAwesomeIcon icon={faCheck} /> Email sent
            </h1>
            <p className="lead">
              If an account exists for {email}, we've sent instructions to reset your password.
            </p>
            <Link className="btn btn-primary" to="/login">
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <span className="eyebrow">Forgot your password?</span>
            <h1>Reset password</h1>
            <p className="lead">
              Enter your email and we'll send you a link to reset your password.
            </p>

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

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send reset link'}
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>

            <Link className="login-links" to="/login">
              Back to log in
            </Link>
          </>
        )}
      </div>
    </section>
  )
}

export default ForgotPassword
