import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  BookUser,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutList,
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  UserPlus,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { useAppStore } from './store/appStore'
import { useAuthStore } from './store/authStore'

function LoginPage() {
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('ChangeThisAdminPassword123')

  const loading = useAuthStore((state) => state.loading)
  const login = useAuthStore((state) => state.login)
  const signup = useAuthStore((state) => state.signup)
  const token = useAuthStore((state) => state.token)

  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate('/tasks', { replace: true })
    }
  }, [token, navigate])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (mode === 'login') {
      try {
        await login(email, password)
        toast.success('Login successful')
        navigate('/tasks', { replace: true })
      } catch (error) {
        toast.error(error.message || 'Login failed')
      }
      return
    }

    try {
      await signup({ email, full_name: fullName, password })
      toast.success('Signup successful. You can now use the app as a user.')
      await login(email, password)
      navigate('/tasks', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Signup failed')
    }
  }

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-2 lg:items-center">
      <div className="hero-panel">
        <p className="eyebrow">Future Transformation</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-100 md:text-5xl">
          Build knowledge-driven workflows with AI confidence.
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-300">
          Manage documents, semantic search, and tasks in one modern workspace optimized for teams.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="feature-tile">
            <Search className="feature-icon" aria-hidden="true" />
            <p className="feature-title">Smart Search</p>
            <p className="feature-copy">OpenAI embeddings + LLM answers from your indexed documents.</p>
          </div>
          <div className="feature-tile">
            <ShieldCheck className="feature-icon" aria-hidden="true" />
            <p className="feature-title">Role Controls</p>
            <p className="feature-copy">Admin and user workflows with clean RBAC boundaries.</p>
          </div>
        </div>
      </div>

      <div className="glass-card w-full max-w-lg justify-self-center">
        <div className="auth-switcher">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => setMode('login')}
          >
            <LogIn className="icon-inline" aria-hidden="true" />
            Login
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => setMode('signup')}
          >
            <UserPlus className="icon-inline" aria-hidden="true" />
            Signup
          </button>
        </div>

        <h2 className="mt-5 text-2xl font-semibold text-slate-100">
          {mode === 'login' ? 'Welcome back' : 'Create user account'}
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          {mode === 'login'
            ? 'Use your existing credentials to continue.'
            : 'Signup creates only user role accounts. Admin creation remains restricted.'}
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <label className="block">
              <span className="field-label">Full Name</span>
              <input
                className="field-input"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="field-label">Email</span>
            <input className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label className="block">
            <span className="field-label">Password</span>
            <input className="field-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {mode === 'login' ? <LogIn className="icon-inline" aria-hidden="true" /> : <UserPlus className="icon-inline" aria-hidden="true" />}
            {loading
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create User Account'}
          </button>
        </form>
      </div>
    </section>
  )
}

function AppShell({ children }) {
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)
  const logout = useAuthStore((state) => state.logout)
  const resetAppState = useAppStore((state) => state.resetAppState)
  const location = useLocation()
  const navigate = useNavigate()

  const links = useMemo(() => {
    const base = [
      { to: '/tasks', label: 'Tasks', icon: LayoutList },
      { to: '/search', label: 'Search', icon: Search },
    ]
    if (role === 'admin') {
      base.push({ to: '/documents', label: 'Documents', icon: FileText })
      base.push({ to: '/users', label: 'Users', icon: BookUser })
      base.push({ to: '/analytics', label: 'Analytics', icon: BarChart3 })
    }
    return base
  }, [role])

  const onLogout = () => {
    resetAppState()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="glass-card mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow">{role?.toUpperCase()} Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-100">Welcome, {user?.full_name}</h2>
          <p className="text-sm text-slate-300">{user?.email}</p>
        </div>
        <button className="btn-secondary" onClick={onLogout}><LogOut className="icon-inline" aria-hidden="true" />Logout</button>
      </header>

      <nav className="glass-card mb-5 overflow-x-auto p-2">
        <div className="flex min-w-max gap-2">
          {links.map((link) => {
            const active = location.pathname === link.to
            const Icon = link.icon
            return (
              <Link key={link.to} to={link.to} className={active ? 'nav-pill nav-pill-active' : 'nav-pill'}>
                <Icon className="icon-inline" aria-hidden="true" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <section>{children}</section>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const role = useAuthStore((state) => state.role)
  if (role !== 'admin') return <Navigate to="/tasks" replace />
  return children
}

function TasksPage() {
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)

  const tasks = useAppStore((state) => state.tasks)
  const tasksMeta = useAppStore((state) => state.tasksMeta)
  const tasksLoading = useAppStore((state) => state.tasksLoading)
  const users = useAppStore((state) => state.users)
  const usersLoading = useAppStore((state) => state.usersLoading)

  const fetchTasks = useAppStore((state) => state.fetchTasks)
  const fetchUsers = useAppStore((state) => state.fetchUsers)
  const createTask = useAppStore((state) => state.createTask)
  const updateTaskStatus = useAppStore((state) => state.updateTaskStatus)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [page, setPage] = useState(1)

  const assignableUsers = useMemo(
    () => users.filter((u) => (u.role || '').toLowerCase() === 'user'),
    [users],
  )

  useEffect(() => {
    fetchTasks(token, {
      page,
      page_size: 10,
      status: statusFilter || undefined,
      assigned_to: role === 'admin' ? assignedFilter || undefined : undefined,
    }).catch((error) => toast.error(error.message || 'Unable to fetch tasks'))
  }, [fetchTasks, token, page, statusFilter, assignedFilter])

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers(token).catch((error) => toast.error(error.message || 'Unable to fetch users'))
    }
  }, [fetchUsers, role, token])

  const onCreateTask = async (event) => {
    event.preventDefault()
    try {
      await createTask(token, {
        title: taskTitle,
        description: taskDescription || null,
        assigned_to: Number(taskAssignee),
      })
      toast.success('Task created')
      setTaskTitle('')
      setTaskDescription('')
      setTaskAssignee('')
      setPage(1)
      await fetchTasks(token, {
        page: 1,
        page_size: 10,
        status: statusFilter || undefined,
        assigned_to: role === 'admin' ? assignedFilter || undefined : undefined,
      })
    } catch (error) {
      toast.error(error.message || 'Unable to create task')
    }
  }

  const onToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      await updateTaskStatus(token, taskId, nextStatus)
      toast.success(`Task marked ${nextStatus}`)
    } catch (error) {
      toast.error(error.message || 'Unable to update task')
    }
  }

  return (
    <div className="space-y-5">
      {role === 'admin' && (
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-slate-100"><LayoutList className="icon-inline" aria-hidden="true" />Create Task</h3>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateTask}>
            <label className="block md:col-span-2">
              <span className="field-label">Title</span>
              <input className="field-input" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required />
            </label>
            <label className="block md:col-span-2">
              <span className="field-label">Description</span>
              <textarea className="field-input min-h-24" value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} />
            </label>
            <label className="block md:col-span-2">
              <span className="field-label">Assign User</span>
              <select className="field-input" value={taskAssignee} onChange={(event) => setTaskAssignee(event.target.value)} required>
                <option value="">{usersLoading ? 'Loading users...' : 'Select user'}</option>
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </label>
            <button className="btn-primary md:col-span-2" type="submit">Create Task</button>
          </form>
        </div>
      )}

      <div className="glass-card">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="field-input" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          {role === 'admin' ? (
            <input
              className="field-input"
              type="number"
              min="1"
              placeholder="assigned_to"
              value={assignedFilter}
              onChange={(event) => { setAssignedFilter(event.target.value); setPage(1) }}
            />
          ) : (
            <div />
          )}
          <button
            className="btn-secondary md:col-span-2"
            onClick={() =>
              fetchTasks(token, {
                page,
                page_size: 10,
                status: statusFilter || undefined,
                assigned_to: role === 'admin' ? assignedFilter || undefined : undefined,
              })
            }
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {tasksLoading && <p className="text-sm text-slate-300">Loading tasks...</p>}
          {!tasksLoading && tasks.length === 0 && <p className="text-sm text-slate-300">No tasks found.</p>}
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-200/10 bg-slate-950/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{task.title}</p>
                  <p className="text-sm text-slate-300">{task.description || 'No description'}</p>
                  <p className="mt-1 text-xs text-slate-400">Task #{task.id} | Assigned: {task.assigned_to}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-chip ${task.status === 'completed' ? 'status-done' : 'status-pending'}`}>{task.status}</span>
                  <button className="btn-secondary" onClick={() => onToggleStatus(task.id, task.status)}>
                    {task.status === 'pending' ? <CheckCircle2 className="icon-inline" aria-hidden="true" /> : <RotateCcw className="icon-inline" aria-hidden="true" />}
                    {task.status === 'pending' ? 'Mark Completed' : 'Mark Pending'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">Total: {tasksMeta.total || 0}</p>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}><ChevronLeft className="icon-inline" aria-hidden="true" /></button>
            <span className="text-sm text-slate-300">Page {page}</span>
            <button className="btn-secondary" onClick={() => setPage((prev) => prev + 1)} disabled={page * 10 >= (tasksMeta.total || 0)}><ChevronRight className="icon-inline" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsPage() {
  const token = useAuthStore((state) => state.token)
  const uploadLoading = useAppStore((state) => state.uploadLoading)
  const uploadDocument = useAppStore((state) => state.uploadDocument)

  const [docTitle, setDocTitle] = useState('')
  const [docFile, setDocFile] = useState(null)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!docFile) {
      toast.error('Please choose a .txt file')
      return
    }
    try {
      const data = await uploadDocument(token, { title: docTitle, file: docFile })
      toast.success(`Indexed ${data.chunks_indexed} chunks`)
      setDocTitle('')
      setDocFile(null)
      event.target.reset()
    } catch (error) {
      toast.error(error.message || 'Upload failed')
    }
  }

  return (
    <div className="glass-card">
      <h3 className="text-lg font-semibold text-slate-100"><FileText className="icon-inline" aria-hidden="true" />Upload Document</h3>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="field-label">Title</span>
          <input className="field-input" value={docTitle} onChange={(event) => setDocTitle(event.target.value)} required />
        </label>
        <label className="block">
          <span className="field-label">TXT File</span>
          <input className="field-input" type="file" accept=".txt,text/plain" onChange={(event) => setDocFile(event.target.files?.[0] || null)} required />
        </label>
        <button className="btn-primary w-full" disabled={uploadLoading} type="submit">{uploadLoading ? 'Uploading...' : 'Upload & Index'}</button>
      </form>
    </div>
  )
}

function SearchPage() {
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)
  const searchLoading = useAppStore((state) => state.searchLoading)
  const latestSearch = useAppStore((state) => state.latestSearch)
  const runSearch = useAppStore((state) => state.runSearch)
  const fetchAnalytics = useAppStore((state) => state.fetchAnalytics)

  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(5)
  const [includeAnswer, setIncludeAnswer] = useState(true)

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      const data = await runSearch(token, { query, top_k: Number(topK), include_answer: includeAnswer })
      toast.success(`Found ${data.results.length} matches`)
      if (role === 'admin') await fetchAnalytics(token)
    } catch (error) {
      toast.error(error.message || 'Search failed')
    }
  }

  return (
    <div className="glass-card">
      <h3 className="text-lg font-semibold text-slate-100"><BrainCircuit className="icon-inline" aria-hidden="true" />Semantic Search + LLM</h3>
      <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
        <label className="block md:col-span-2">
          <span className="field-label">Query</span>
          <input className="field-input" value={query} onChange={(event) => setQuery(event.target.value)} required />
        </label>
        <label className="block">
          <span className="field-label">Top K</span>
          <input className="field-input" type="number" min="1" max="20" value={topK} onChange={(event) => setTopK(event.target.value)} />
        </label>
        <label className="block">
          <span className="field-label">LLM Answer</span>
          <select className="field-input" value={includeAnswer ? 'yes' : 'no'} onChange={(event) => setIncludeAnswer(event.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <button className="btn-primary md:col-span-4" disabled={searchLoading} type="submit">{searchLoading ? 'Searching...' : 'Search'}</button>
      </form>

      {latestSearch && (
        <div className="mt-5 space-y-4">
          {latestSearch.answer && (
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">LLM Answer</p>
              <p className="mt-1 text-sm text-slate-100"><Sparkles className="icon-inline" aria-hidden="true" />{latestSearch.answer}</p>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {latestSearch.results.map((result, idx) => (
              <div key={`${result.document_id}-${idx}`} className="rounded-xl border border-slate-200/10 bg-slate-950/40 p-4">
                <p className="text-xs text-cyan-300">Doc #{result.document_id} | Score: {result.score.toFixed(4)}</p>
                <p className="mt-2 text-sm text-slate-200">{result.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UsersPage() {
  const token = useAuthStore((state) => state.token)
  const users = useAppStore((state) => state.users)
  const usersLoading = useAppStore((state) => state.usersLoading)
  const fetchUsers = useAppStore((state) => state.fetchUsers)

  const createUser = useAuthStore((state) => state.createUser)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [usersTab, setUsersTab] = useState('user')

  const filteredUsers = useMemo(
    () => users.filter((u) => (u.role || '').toLowerCase() === usersTab),
    [users, usersTab],
  )

  useEffect(() => {
    fetchUsers(token).catch((error) => toast.error(error.message || 'Unable to fetch users'))
  }, [fetchUsers, token])

  const onCreate = async (event) => {
    event.preventDefault()
    try {
      await createUser({ email, full_name: fullName, password, role })
      toast.success('User created')
      setEmail('')
      setFullName('')
      setPassword('')
      setRole('user')
      await fetchUsers(token)
    } catch (error) {
      toast.error(error.message || 'Unable to create user')
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="glass-card">
        <h3 className="text-lg font-semibold text-slate-100"><UserPlus className="icon-inline" aria-hidden="true" />Create User</h3>
        <form className="mt-4 space-y-3" onSubmit={onCreate}>
          <input className="field-input" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          <input className="field-input" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="field-input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <select className="field-input" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn-primary w-full" type="submit">Create Account</button>
        </form>
      </div>

      <div className="glass-card">
        <h3 className="text-lg font-semibold text-slate-100"><BookUser className="icon-inline" aria-hidden="true" />Users</h3>
        <div className="auth-switcher mt-4">
          <button
            type="button"
            className={usersTab === 'user' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => setUsersTab('user')}
          >
            User
          </button>
          <button
            type="button"
            className={usersTab === 'admin' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => setUsersTab('admin')}
          >
            Admin
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/10 bg-slate-950/40">
          {usersLoading && <p className="text-sm text-slate-300">Loading users...</p>}
          {!usersLoading && filteredUsers.length === 0 && <p className="p-4 text-sm text-slate-300">No users found.</p>}
          {!usersLoading && filteredUsers.length > 0 && (
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="border-b border-slate-200/10 bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-200/10 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-100">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function AnalyticsPage() {
  const token = useAuthStore((state) => state.token)
  const analytics = useAppStore((state) => state.analytics)
  const analyticsLoading = useAppStore((state) => state.analyticsLoading)
  const fetchAnalytics = useAppStore((state) => state.fetchAnalytics)

  useEffect(() => {
    fetchAnalytics(token).catch((error) => toast.error(error.message || 'Unable to fetch analytics'))
  }, [fetchAnalytics, token])

  return (
    <div className="glass-card">
      <h3 className="text-lg font-semibold text-slate-100"><BarChart3 className="icon-inline" aria-hidden="true" />Analytics</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card"><p className="metric-label">Total Tasks</p><p className="metric-value">{analyticsLoading ? '...' : analytics?.total_tasks ?? 0}</p></div>
        <div className="metric-card"><p className="metric-label">Completed</p><p className="metric-value">{analyticsLoading ? '...' : analytics?.completed_tasks ?? 0}</p></div>
        <div className="metric-card"><p className="metric-label">Pending</p><p className="metric-value">{analyticsLoading ? '...' : analytics?.pending_tasks ?? 0}</p></div>
        <div className="metric-card"><p className="metric-label">Searches</p><p className="metric-value">{analyticsLoading ? '...' : analytics?.total_searches_performed ?? 0}</p></div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const token = useAuthStore((state) => state.token)

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to={token ? '/tasks' : '/login'} replace />} />

      <Route
        path="/tasks"
        element={(
          <ProtectedRoute>
            <AppShell>
              <TasksPage />
            </AppShell>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/documents"
        element={(
          <ProtectedRoute>
            <AdminRoute>
              <AppShell>
                <DocumentsPage />
              </AppShell>
            </AdminRoute>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/search"
        element={(
          <ProtectedRoute>
            <AppShell>
              <SearchPage />
            </AppShell>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users"
        element={(
          <ProtectedRoute>
            <AdminRoute>
              <AppShell>
                <UsersPage />
              </AppShell>
            </AdminRoute>
          </ProtectedRoute>
        )}
      />
      <Route
        path="/analytics"
        element={(
          <ProtectedRoute>
            <AdminRoute>
              <AppShell>
                <AnalyticsPage />
              </AppShell>
            </AdminRoute>
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<Navigate to={token ? '/tasks' : '/login'} replace />} />
    </Routes>
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

  return <AppRoutes />
}

export default App
