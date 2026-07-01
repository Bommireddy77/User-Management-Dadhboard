import { useState, useEffect } from 'react'

export default function FilterModal({ filters, onApply, onClear, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleChange = (field) => (event) => {
    setLocalFilters((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleClear = () => {
    setLocalFilters({ firstName: '', lastName: '', email: '', department: '' })
    onClear()
  }

  const handleApply = () => {
    onApply(localFilters)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Filter users</h3>
          <button className="button icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="field-grid">
          <label>
            First Name
            <input value={localFilters.firstName} onChange={handleChange('firstName')} placeholder="Search first name" />
          </label>
          <label>
            Last Name
            <input value={localFilters.lastName} onChange={handleChange('lastName')} placeholder="Search last name" />
          </label>
          <label>
            Email
            <input value={localFilters.email} onChange={handleChange('email')} placeholder="Search email" />
          </label>
          <label>
            Department
            <input value={localFilters.department} onChange={handleChange('department')} placeholder="Search department" />
          </label>
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={handleClear}>
            Clear
          </button>
          <button className="button primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
