import { useEffect, useMemo, useState } from 'react'
import FilterModal from './components/FilterModal.jsx'
import UserForm from './components/UserForm.jsx'
import UserTable from './components/UserTable.jsx'

const API_URL = 'https://jsonplaceholder.typicode.com/users'
const defaultForm = { id: '', firstName: '', lastName: '', email: '', department: '' }
const STORAGE_KEY = 'user-management-dashboard-users'

const parseUser = (raw) => {
  const nameParts = raw.name?.trim().split(' ') || []
  const firstName = nameParts.shift() || ''
  const lastName = nameParts.join(' ') || ''
  const department = raw.company?.name || 'General'
  return {
    id: raw.id,
    firstName,
    lastName,
    email: raw.email || '',
    department
  }
}

const formatPayload = (user) => ({
  id: user.id,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  company: { name: user.department }
})

const loadLocalState = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { added: [], updated: {}, deleted: [], nextId: 11 }
  }
  try {
    return JSON.parse(stored)
  } catch {
    return { added: [], updated: {}, deleted: [], nextId: 11 }
  }
}

const saveLocalState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const mergeRemoteUsers = (remoteUsers) => {
  const stored = loadLocalState()
  const deleted = new Set(stored.deleted || [])
  const updated = stored.updated || {}
  const baseUsers = remoteUsers
    .filter((user) => !deleted.has(user.id))
    .map((user) => (updated[user.id] ? { ...user, ...updated[user.id] } : user))
  return [...(stored.added || []), ...baseUsers]
}

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('view')
  const [activeUser, setActiveUser] = useState(defaultForm)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({ firstName: '', lastName: '', email: '', department: '' })
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [pageSize, search, filters, sortField, sortDir])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Unable to load users from API.')
      const data = await response.json()
      setUsers(mergeRemoteUsers(data.map(parseUser)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const showError = (message) => {
    setError(message)
    window.setTimeout(() => setError(''), 5000)
  }

  const handleCreate = () => {
    setMode('add')
    setActiveUser(defaultForm)
  }

  const handleEdit = (user) => {
    setMode('edit')
    setActiveUser(user)
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}?`)) return
    try {
      const response = await fetch(`${API_URL}/${user.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete user.')
      const stored = loadLocalState()
      const isAdded = (stored.added || []).some((item) => item.id === user.id)
      if (isAdded) {
        stored.added = stored.added.filter((item) => item.id !== user.id)
      } else {
        stored.deleted = Array.from(new Set([...(stored.deleted || []), user.id]))
        if (stored.updated) {
          delete stored.updated[user.id]
        }
      }
      saveLocalState(stored)
      setUsers((prev) => prev.filter((item) => item.id !== user.id))
    } catch (err) {
      showError(err.message)
    }
  }

  const handleSubmit = async (values) => {
    if (!values.firstName.trim() || !values.lastName.trim() || !values.email.trim() || !values.department.trim()) {
      showError('All fields are required.')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      showError('Please enter a valid email address.')
      return false
    }

    try {
      const payload = formatPayload(values)
      const stored = loadLocalState()
      if (mode === 'add') {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) throw new Error('Unable to add user.')
        const nextId = stored.nextId || 11
        const created = { ...values, id: nextId }
        stored.added = [created, ...(stored.added || [])]
        stored.nextId = nextId + 1
        saveLocalState(stored)
        setUsers((prev) => [created, ...prev])
      } else {
        const response = await fetch(`${API_URL}/${values.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!response.ok) throw new Error('Unable to update user.')
        const existingAdded = (stored.added || []).some((item) => item.id === values.id)
        if (existingAdded) {
          stored.added = (stored.added || []).map((item) => (item.id === values.id ? values : item))
        } else {
          stored.updated = {
            ...(stored.updated || {}),
            [values.id]: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              department: values.department
            }
          }
        }
        saveLocalState(stored)
        setUsers((prev) => prev.map((item) => (item.id === values.id ? values : item)))
      }
      setMode('view')
      setActiveUser(defaultForm)
      return true
    } catch (err) {
      showError(err.message)
      return false
    }
  }

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const searchTerm = search.trim().toLowerCase()
        const matchesSearch =
          !searchTerm ||
          [user.firstName, user.lastName, user.email, user.department]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm)
        const matchesFilters =
          (!filters.firstName || user.firstName.toLowerCase().includes(filters.firstName.toLowerCase())) &&
          (!filters.lastName || user.lastName.toLowerCase().includes(filters.lastName.toLowerCase())) &&
          (!filters.email || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
          (!filters.department || user.department.toLowerCase().includes(filters.department.toLowerCase()))
        return matchesSearch && matchesFilters
      })
      .sort((a, b) => {
        const leftValue = a[sortField]
        const rightValue = b[sortField]
        const isNumeric = sortField === 'id'
        const left = isNumeric ? Number(leftValue) : `${leftValue}`.toLowerCase()
        const right = isNumeric ? Number(rightValue) : `${rightValue}`.toLowerCase()
        if (left < right) return sortDir === 'asc' ? -1 : 1
        if (left > right) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [users, filters, search, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageSlice = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>User Management Dashboard</h1>
          <p>View, add, edit, delete, search, filter, and paginate users from a mock API.</p>
        </div>
        <div className="header-actions">
          <button className="button secondary" onClick={() => setShowFilter(true)}>
            Filter
          </button>
          <button className="button primary" onClick={handleCreate}>
            Add User
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total users fetched</span>
          <strong>{users.length}</strong>
        </article>
        <article className="stat-card">
          <span>Filtered results</span>
          <strong>{filteredUsers.length}</strong>
        </article>
        <article className="stat-card">
          <span>Page size</span>
          <strong>{pageSize}</strong>
        </article>
        <article className="stat-card">
          <span>Current page</span>
          <strong>{currentPage}</strong>
        </article>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="toolbar-row">
        <label className="toolbar-item">
          Search
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, department"
          />
        </label>

        <label className="toolbar-item">
          Page size
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="panel">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <UserTable
              users={pageSlice}
              onEdit={handleEdit}
              onDelete={handleDelete}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />

            <div className="pagination-row">
              <div>
                Showing {pageSlice.length} of {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
              </div>
              <div className="page-buttons">
                <button className="button secondary" disabled={currentPage === 1} onClick={() => setPage(1)}>
                  First
                </button>
                <button className="button secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  Prev
                </button>
                <span className="page-label">
                  Page {currentPage} of {totalPages}
                </span>
                <button className="button secondary" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                  Next
                </button>
                <button className="button secondary" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>
                  Last
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {(mode === 'add' || mode === 'edit') && (
        <section className="panel form-panel">
          <UserForm
            mode={mode}
            user={activeUser}
            onCancel={() => {
              setMode('view')
              setActiveUser(defaultForm)
            }}
            onSubmit={handleSubmit}
          />
        </section>
      )}

      {showFilter && (
        <FilterModal
          filters={filters}
          onClose={() => setShowFilter(false)}
          onApply={(newFilters) => {
            setFilters(newFilters)
            setShowFilter(false)
          }}
          onClear={() => setFilters({ firstName: '', lastName: '', email: '', department: '' })}
        />
      )}
    </div>
  )
}

export default App
