import { useEffect, useState } from 'react'

const initialState = { firstName: '', lastName: '', email: '', department: '' }

export default function UserForm({ mode, user, onCancel, onSubmit }) {
  const [formValues, setFormValues] = useState(initialState)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setFormValues({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      department: user.department || ''
    })
  }, [user])

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const success = await onSubmit({ ...user, ...formValues })
    if (success) {
      setFormValues(initialState)
    }
    setSubmitting(false)
  }

  return (
    <div className="form-card">
      <h2>{mode === 'add' ? 'Add New User' : 'Edit User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-grid">
          <label>
            First Name
            <input type="text" value={formValues.firstName} onChange={handleChange('firstName')} required />
          </label>
          <label>
            Last Name
            <input type="text" value={formValues.lastName} onChange={handleChange('lastName')} required />
          </label>
          <label>
            Email
            <input type="email" value={formValues.email} onChange={handleChange('email')} required />
          </label>
          <label>
            Department
            <input type="text" value={formValues.department} onChange={handleChange('department')} required />
          </label>
        </div>
        <div className="form-actions">
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button className="button secondary" type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
