import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { DuplicateEmailError, registerCustomer } from '../data/auth'

export function SignupCustomer() {
  const navigate = useNavigate()
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const [error, setError] = useState('')

  return (
    <AuthShell>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          const formData = new FormData(e.currentTarget)
          const name = String(formData.get('name') ?? '')
          const email = String(formData.get('email') ?? '')
          const password = String(formData.get('password') ?? '')

          if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
          }

          try {
            registerCustomer({ name, email, password })
            navigate('/login/customer')
          } catch (err) {
            if (err instanceof DuplicateEmailError) {
              setError('That email is already registered. Please sign in instead.')
            } else {
              setError('Could not create account. Please try again.')
            }
          }
        }}
      >
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-2">
          <label htmlFor={nameId} className="text-xs font-black tracking-wider text-zinc-100">
            FULL NAME
          </label>
          <input
            id={nameId}
            name="name"
            required
            placeholder="Your name"
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white placeholder:text-zinc-400 outline-none transition focus:border-white/25 focus:bg-black/35"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor={emailId} className="text-xs font-black tracking-wider text-zinc-100">
            EMAIL
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            placeholder="you@dairy.com"
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white placeholder:text-zinc-400 outline-none transition focus:border-white/25 focus:bg-black/35"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor={passwordId} className="text-xs font-black tracking-wider text-zinc-100">
            PASSWORD
          </label>
          <input
            id={passwordId}
            name="password"
            type="password"
            required
            placeholder="At least 6 characters"
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white placeholder:text-zinc-400 outline-none transition focus:border-white/25 focus:bg-black/35"
          />
        </div>

        <button
          type="submit"
          className="mt-1 h-11 rounded-xl bg-white text-sm font-black tracking-wide text-zinc-950 transition hover:bg-zinc-100 active:scale-[0.99]"
        >
          Create account
        </button>

        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-300">
          <span>Already registered?</span>
          <Link to="/login/customer" className="text-xs font-black tracking-wider text-white">
            Sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}

