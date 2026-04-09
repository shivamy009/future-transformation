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
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  UserPlus,
  X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { useAppStore } from './store/appStore'
import { useAuthStore } from './store/authStore'

function SkeletonLine({ className = '' }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />
}

function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={`task-skeleton-${idx}`} className="rounded-xl border border-slate-200/10 bg-slate-950/40 p-4">
          <SkeletonLine className="mb-3 h-4 w-2/5" />
          <SkeletonLine className="mb-2 h-3.5 w-full" />
          <SkeletonLine className="mb-3 h-3.5 w-4/5" />
          <div className="flex items-center justify-between gap-3">
            <SkeletonLine className="h-6 w-20 rounded-full" />
            <div className="flex items-center gap-2">
              <SkeletonLine className="h-8 w-8 rounded-lg" />
              <SkeletonLine className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function UsersTableSkeleton() {
  return (
    <div className="p-4 space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={`users-skeleton-${idx}`} className="grid grid-cols-2 gap-3">
          <SkeletonLine className="h-4 w-4/5" />
          <SkeletonLine className="h-4 w-11/12" />
        </div>
      ))}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={`metric-skeleton-${idx}`} className="metric-card">
          <SkeletonLine className="h-3 w-2/3" />
          <SkeletonLine className="mt-3 h-7 w-1/2" />
        </div>
      ))}
    </div>
  )
}

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
      <div className="grid gap-4 lg:gap-5 lg:grid-cols-[260px_1fr] lg:items-stretch">
        <aside className="glass-card sidebar-card flex h-full flex-col lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Future Transformation</p>
            <p className="eyebrow">{role?.toUpperCase()} Dashboard</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">{user?.full_name}</h2>
            <p className="text-sm text-slate-300 break-all">{user?.email}</p>
          </div>

          <nav className="sidebar-nav mt-5">
            {links.map((link) => {
              const active = location.pathname === link.to
              const Icon = link.icon
              return (
                <Link key={link.to} to={link.to} className={active ? 'nav-pill sidebar-link nav-pill-active w-full' : 'nav-pill sidebar-link w-full'}>
                  <Icon className="icon-inline" aria-hidden="true" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <button className="btn-secondary sidebar-logout-btn mt-auto w-full" onClick={onLogout}>
            <LogOut className="icon-inline" aria-hidden="true" />
            Logout
          </button>
        </aside>

        <section>{children}</section>
      </div>
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
  const adminUpdateTask = useAppStore((state) => state.adminUpdateTask)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [savingTaskEdit, setSavingTaskEdit] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState('pending')
  const [editAssignedTo, setEditAssignedTo] = useState('')

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
    setCreatingTask(true)
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
      setShowCreateTaskModal(false)
      setPage(1)
      await fetchTasks(token, {
        page: 1,
        page_size: 10,
        status: statusFilter || undefined,
        assigned_to: role === 'admin' ? assignedFilter || undefined : undefined,
      })
    } catch (error) {
      toast.error(error.message || 'Unable to create task')
    } finally {
      setCreatingTask(false)
    }
  }

  const onCloseCreateTaskModal = () => {
    setShowCreateTaskModal(false)
    setTaskTitle('')
    setTaskDescription('')
    setTaskAssignee('')
  }

  const onToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    setUpdatingTaskId(taskId)
    try {
      await updateTaskStatus(token, taskId, nextStatus)
      toast.success(`Task marked ${nextStatus}`)
    } catch (error) {
      toast.error(error.message || 'Unable to update task')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const formatStatusLabel = (status) =>
    status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : 'Pending'

  const onStartEditTask = (task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title || '')
    setEditDescription(task.description || '')
    setEditStatus(task.status || 'pending')
    setEditAssignedTo(String(task.assigned_to || ''))
  }

  const onCancelEditTask = () => {
    setEditingTaskId(null)
    setEditTitle('')
    setEditDescription('')
    setEditStatus('pending')
    setEditAssignedTo('')
  }

  const onSaveEditTask = async (event) => {
    event.preventDefault()
    if (!editingTaskId) {
      return
    }

    setSavingTaskEdit(true)
    try {
      await adminUpdateTask(token, editingTaskId, {
        title: editTitle,
        description: editDescription || null,
        status: editStatus,
        assigned_to: Number(editAssignedTo),
      })
      toast.success('Task updated')
      onCancelEditTask()
    } catch (error) {
      toast.error(error.message || 'Unable to update task')
    } finally {
      setSavingTaskEdit(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="glass-card">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-slate-100"><LayoutList className="icon-inline" aria-hidden="true" />Tasks</h3>
          {role === 'admin' && (
            <button className="btn-primary" type="button" onClick={() => setShowCreateTaskModal(true)}>
              <Plus className="icon-inline" aria-hidden="true" />
              Create Task
            </button>
          )}
        </div>

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
              placeholder="Filter by assignee id"
              value={assignedFilter}
              onChange={(event) => { setAssignedFilter(event.target.value); setPage(1) }}
            />
          ) : (
            <div />
          )}
          <button
            className="btn-secondary md:col-span-2"
            disabled={tasksLoading}
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
          {tasksLoading && <TaskListSkeleton />}
          {!tasksLoading && tasks.length === 0 && <p className="text-sm text-slate-300">No tasks found.</p>}
          {!tasksLoading && tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-slate-200/10 bg-slate-950/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{task.title}</p>
                  <p className="text-sm text-slate-300">{task.description || 'No description'}</p>
                  <p className="mt-1 text-xs text-slate-400">Task #{task.id} | Assigned: {task.assigned_to}</p>
                </div>
                <div className="task-actions">
                  <span className={`status-chip ${task.status === 'completed' ? 'status-done' : 'status-pending'}`}>
                    {formatStatusLabel(task.status)}
                  </span>
                  {role === 'admin' && (
                    <button
                      className="task-action-btn task-edit-btn"
                      onClick={() => onStartEditTask(task)}
                      disabled={creatingTask || savingTaskEdit || updatingTaskId === task.id}
                      aria-label="Edit task"
                      title="Edit task"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    className="task-action-btn task-toggle-btn"
                    onClick={() => onToggleStatus(task.id, task.status)}
                    disabled={creatingTask || savingTaskEdit || updatingTaskId === task.id}
                    aria-label={task.status === 'pending' ? 'Mark completed' : 'Mark pending'}
                    title={task.status === 'pending' ? 'Mark completed' : 'Mark pending'}
                  >
                    {updatingTaskId === task.id ? (
                      <span className="btn-spinner" aria-hidden="true" />
                    ) : task.status === 'pending' ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {role === 'admin' && editingTaskId === task.id && (
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSaveEditTask}>
                  <label className="block md:col-span-2">
                    <span className="field-label">Title</span>
                    <input className="field-input" placeholder="Task title" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} required />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="field-label">Description</span>
                    <textarea className="field-input min-h-24" placeholder="Task description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="field-label">Status</span>
                    <select className="field-input" value={editStatus} onChange={(event) => setEditStatus(event.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="field-label">Assign User</span>
                    <select className="field-input" value={editAssignedTo} onChange={(event) => setEditAssignedTo(event.target.value)} required>
                      <option value="">Select user</option>
                      {assignableUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                      ))}
                    </select>
                  </label>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <button className="btn-primary" disabled={savingTaskEdit} type="submit">{savingTaskEdit ? 'Saving...' : 'Save Changes'}</button>
                    <button className="btn-secondary" disabled={savingTaskEdit} type="button" onClick={onCancelEditTask}>
                      <X className="icon-inline" aria-hidden="true" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
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

      {role === 'admin' && showCreateTaskModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create Task">
          <div className="modal-panel">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-100">Create Task</h3>
              <button className="task-action-btn task-edit-btn" type="button" onClick={onCloseCreateTaskModal} aria-label="Close create task modal">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateTask}>
              <label className="block md:col-span-2">
                <span className="field-label">Title</span>
                <input className="field-input" placeholder="Enter task title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required />
              </label>
              <label className="block md:col-span-2">
                <span className="field-label">Description</span>
                <textarea className="field-input min-h-24" placeholder="Add details for this task" value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} />
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
              <div className="md:col-span-2 flex items-center gap-2">
                <button className="btn-primary" disabled={creatingTask} type="submit">{creatingTask ? 'Creating...' : 'Create Task'}</button>
                <button className="btn-secondary" disabled={creatingTask} type="button" onClick={onCloseCreateTaskModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      toast.error('Please choose a .txt or .pdf file')
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
          <input className="field-input" placeholder="Document title" value={docTitle} onChange={(event) => setDocTitle(event.target.value)} required />
        </label>
        <label className="block">
          <span className="field-label">Document File</span>
          <input
            className="field-input"
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(event) => setDocFile(event.target.files?.[0] || null)}
            required
          />
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

  const formatLlmAnswer = (answer) => (answer || '').replace(/`/g, '').trim()

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      await runSearch(token, { query, top_k: 5, include_answer: true })
      toast.success('Answer generated')
      if (role === 'admin') await fetchAnalytics(token)
    } catch (error) {
      toast.error(error.message || 'Search failed')
    }
  }

  return (
    <div className="glass-card">
      <h3 className="text-lg font-semibold text-slate-100"><BrainCircuit className="icon-inline" aria-hidden="true" />Semantic Search + LLM (K=5)</h3>
      <form className="mt-4 grid gap-3 md:grid-cols-1" onSubmit={onSubmit}>
        <label className="block">
          <span className="field-label">Query</span>
          <input className="field-input" placeholder="Ask from uploaded documents" value={query} onChange={(event) => setQuery(event.target.value)} required />
        </label>
        <button className="btn-primary" disabled={searchLoading} type="submit">{searchLoading ? 'Searching...' : 'Search'}</button>
      </form>

      {latestSearch && (
        <div className="mt-5 space-y-4">
          {searchLoading ? (
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4" aria-hidden="true">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="mt-3 h-4 w-full" />
              <SkeletonLine className="mt-2 h-4 w-11/12" />
              <SkeletonLine className="mt-2 h-4 w-4/5" />
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">LLM Answer</p>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-slate-100">
                <Sparkles className="icon-inline" aria-hidden="true" />
                {formatLlmAnswer(latestSearch.answer) || 'No grounded answer found in uploaded documents.'}
              </p>
            </div>
          )}
        </div>
      )}

      {searchLoading && !latestSearch && (
        <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-4" aria-hidden="true">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="mt-3 h-4 w-full" />
          <SkeletonLine className="mt-2 h-4 w-11/12" />
          <SkeletonLine className="mt-2 h-4 w-4/5" />
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
          <input className="field-input" placeholder="Enter full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          <input className="field-input" type="email" placeholder="Enter email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="field-input" type="password" placeholder="Create password" value={password} onChange={(event) => setPassword(event.target.value)} required />
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
          {usersLoading && <UsersTableSkeleton />}
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
      {analyticsLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="metric-card"><p className="metric-label">Total Tasks</p><p className="metric-value">{analytics?.total_tasks ?? 0}</p></div>
          <div className="metric-card"><p className="metric-label">Completed</p><p className="metric-value">{analytics?.completed_tasks ?? 0}</p></div>
          <div className="metric-card"><p className="metric-label">Pending</p><p className="metric-value">{analytics?.pending_tasks ?? 0}</p></div>
          <div className="metric-card"><p className="metric-label">Searches</p><p className="metric-value">{analytics?.total_searches_performed ?? 0}</p></div>
        </div>
      )}
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
          <SkeletonLine className="h-4 w-48" />
          <SkeletonLine className="mt-3 h-3.5 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  return <AppRoutes />
}

export default App
