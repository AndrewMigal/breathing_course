'use client'

import { useState } from 'react'
import { createUser } from '@/app/(admin)/admin/actions'

const EMPTY = {
  email: '',
  password: '',
  display_name: '',
  role: 'student' as 'student' | 'admin',
  grant_access: true,
}

export default function AddUserForm() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function set(key: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await createUser(form)
      setSuccess(`User ${form.email} created successfully.`)
      setForm(EMPTY)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  }
  const labelStyle = { color: 'var(--text-2)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

      {/* Email + Display name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Email</label>
          <input
            type="email" value={form.email} onChange={set('email')}
            placeholder="user@example.com" required
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Display Name</label>
          <input
            type="text" value={form.display_name} onChange={set('display_name')}
            placeholder="John Doe" required
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Password</label>
        <input
          type="password" value={form.password} onChange={set('password')}
          placeholder="Min 6 characters" required minLength={6}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={inputStyle}
        />
      </div>

      {/* Role + Grant access */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Role</label>
          <select
            value={form.role}
            onChange={set('role')}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
          >
            <option value="student">student</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <label className="flex items-center gap-2.5 pb-2.5 cursor-pointer select-none">
          <div
            onClick={() => setForm((f) => ({ ...f, grant_access: !f.grant_access }))}
            className="w-10 h-5 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5"
            style={{
              background: form.grant_access ? 'var(--sky)' : 'var(--bg-dk)',
              cursor: 'pointer',
            }}
          >
            <div
              className="w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: form.grant_access ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
          <span className="text-sm" style={{ color: 'var(--text-2)' }}>
            Grant course access
          </span>
        </label>
      </div>

      {error && (
        <p className="text-xs px-3 py-2 rounded-lg"
           style={{ background: 'rgba(220,50,50,.12)', color: '#e05555' }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs px-3 py-2 rounded-lg"
           style={{ background: 'var(--sky-t)', color: 'var(--sky-d)' }}>
          {success}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: 'var(--accent)', color: 'var(--bg)' }}
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
