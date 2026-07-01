const headings = [
  { key: 'id', label: 'ID' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' }
]

const sortArrow = (current, field, direction) => {
  if (current !== field) return ''
  return direction === 'asc' ? ' ▲' : ' ▼'
}

export default function UserTable({ users, onEdit, onDelete, sortField, sortDir, onSort }) {
  return (
    <div className="table-wrap">
      <table className="user-table">
        <thead>
          <tr>
            {headings.map((column) => (
              <th key={column.key} onClick={() => onSort(column.key)}>
                {column.label}
                <span className="sort-indicator">{sortArrow(sortField, column.key, sortDir)}</span>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={headings.length + 1} className="empty-row">
                No users match the current search or filters.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td className="action-cell">
                  <button className="button secondary small" onClick={() => onEdit(user)}>
                    Edit
                  </button>
                  <button className="button danger small" onClick={() => onDelete(user)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
