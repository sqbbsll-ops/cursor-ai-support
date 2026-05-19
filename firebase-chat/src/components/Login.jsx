import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegister) {
        await signUp(email, password, displayName)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.logoMark} aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="url(#logoGrad)" />
            <path
              d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M18 30c2 3 5 5 9 5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#4f8ef7" />
                <stop offset="1" stopColor="#6c63ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 className={styles.title}>Firebase Chat</h1>
        <p className={styles.subtitle}>
          {isRegister ? 'Create an account to start chatting' : 'Sign in to continue'}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {isRegister && (
          <label className={styles.field}>
            <span>Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How others see you"
              required
            />
          </label>
        )}

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.primary} disabled={submitting}>
          {submitting ? 'Please wait…' : isRegister ? 'Sign up' : 'Sign in'}
        </button>
      </form>

      <button
        type="button"
        className={styles.switch}
        onClick={() => {
          setIsRegister((v) => !v)
          setError('')
        }}
      >
        {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}
