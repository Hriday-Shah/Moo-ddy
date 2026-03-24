import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { validateCustomerLogin } from '../data/auth'
import { setCustomerSession } from '../data/session'

export function LoginCustomer() {
  const navigate = useNavigate()
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
          const email = String(formData.get('email') ?? '')
          const password = String(formData.get('password') ?? '')
          const err = validateCustomerLogin(email, password)
          if (err) {
            setError(err)
            return
          }
          setCustomerSession(email)
          navigate('/customer')
        }}
      >
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        ) : null}

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
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white placeholder:text-zinc-400 outline-none transition focus:border-white/25 focus:bg-black/35"
          />
        </div>

        <button
          type="submit"
          className="mt-1 h-11 rounded-xl bg-white text-sm font-black tracking-wide text-zinc-950 transition hover:bg-zinc-100 active:scale-[0.99]"
        >
          Sign in
        </button>

        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-zinc-300">
          <span>New here?</span>
          <Link to="/signup/customer" className="text-xs font-black tracking-wider text-white">
            Create an account
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}

