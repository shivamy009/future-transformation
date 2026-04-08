import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useAuthStore } from './store/authStore'

function LoginPanel() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('ChangeThisAdminPassword123')

  const loading = useAuthStore((state) => state.loading)
  const login = useAuthStore((state) => state.login)

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      await login(email, password)
      toast.success('Login successful')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    }
  }

  return (
    <div className="glass-card w-full max-w-md">
      <p className="eyebrow">Future Transformation</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-100">Auth Console</h1>
      <p className="mt-2 text-sm text-slate-300">
        Sign in with your backend credentials to access role-based controls.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="field-label">Email</span>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

function RegisterPanel() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')

  const createUser = useAuthStore((state) => state.createUser)

  const onCreate = async (event) => {
    event.preventDefault()
    try {
      await createUser({ email, full_name: fullName, password, role })
      toast.success('User created successfully')
      setEmail('')
      setFullName('')
      setPassword('')
      setRole('user')
    } catch (error) {
      toast.error(error.message || 'Unable to create user')
    }
  }

  return (
    <div className="glass-card">
      <h2 className="text-xl font-semibold text-slate-100">Create User (Admin)</h2>
      <p className="mt-1 text-sm text-slate-300">Admin can create both user and admin accounts.</p>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onCreate}>
        <label className="block md:col-span-2">
          <span className="field-label">Full Name</span>
          <input
            className="field-input"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="field-label">Email</span>
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="field-label">Role</span>
          <select className="field-input" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button className="btn-primary md:col-span-2" type="submit">
          Create Account
        </button>
      </form>
    </div>
  )
}

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)
  const checkAdminAccess = useAuthStore((state) => state.checkAdminAccess)

  const onAdminCheck = async () => {
    try {
      const data = await checkAdminAccess()
      toast.success(data.message)
    } catch (error) {
      toast.error(error.message || 'Admin check failed')
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      <header className="glass-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Authenticated</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-100">Welcome, {user?.full_name}</h2>
          <p className="mt-1 text-sm text-slate-300">
            Email: <span className="text-slate-100">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="role-chip">Role: {role}</span>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-slate-100">RBAC Access Test</h3>
          <p className="mt-2 text-sm text-slate-300">
            This calls a backend endpoint protected by admin role middleware.
          </p>
          <button className="btn-primary mt-5" onClick={onAdminCheck}>
            Verify Admin Access
          </button>
        </div>

        {role === 'admin' ? (
          <RegisterPanel />
        ) : (
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-slate-100">Admin Area</h3>
            <p className="mt-2 text-sm text-slate-300">
              You are logged in as user. Admin-only actions are hidden by frontend RBAC.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const token = useAuthStore((state) => state.token)
  const hydrated = useAuthStore((state) => state.hydrated)
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser)

  useEffect(() => {
    if (hydrated && token) {
      loadCurrentUser()
    }
  }, [hydrated, token, loadCurrentUser])

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="glass-card text-center">
          <p className="text-slate-200">Preparing session...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {!token ? (
        <section className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-4 py-8">
          <LoginPanel />
        </section>
      ) : (
        <Dashboard />
      )}
    </main>
  )
}

export default App
