'use client'

import { useState } from 'react'
import { grantAccess, revokeAccess, deleteUser, changePassword } from '@/app/(admin)/admin/actions'

export type UserRow = {
  id: string
  display_name: string | null
  email: string | null
  role: 'student' | 'admin'
  created_at: string
  has_access: boolean
}

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(users.map((u) => [u.id, u.has_access]))
  )
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [rows, setRows] = useState(users)

  const [changePwdId, setChangePwdId] = useState<string | null>(null)
  const [newPwd, setNewPwd] = useState('')
  const [pwdPending, setPwdPending] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)

  async function toggle(userId: string, currentAccess: boolean) {
    setPending((p) => ({ ...p, [userId]: true }))
    setAccessMap((m) => ({ ...m, [userId]: !currentAccess }))
    try {
      if (currentAccess) {
        await revokeAccess(userId)
      } else {
        await grantAccess(userId)
      }
    } catch {
      setAccessMap((m) => ({ ...m, [userId]: currentAccess }))
    } finally {
      setPending((p) => ({ ...p, [userId]: false }))
    }
  }

  async function handleDelete(userId: string) {
    setDeletingId(userId)
    setConfirmDeleteId(null)
    try {
      await deleteUser(userId)
      setRows((r) => r.filter((u) => u.id !== userId))
    } catch {
      // keep the row on error
    } finally {
      setDeletingId(null)
    }
  }

  async function handleChangePassword(userId: string) {
    if (!newPwd.trim()) return
    setPwdPending(userId)
    setPwdError(null)
    try {
      await changePassword(userId, newPwd)
      setChangePwdId(null)
      setNewPwd('')
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Error')
    } finally {
      setPwdPending(null)
    }
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-3)' }}>
        No users yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['User', 'Email', 'Role', 'Registered', 'Access', ''].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-3)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => {
            const hasAccess = accessMap[user.id] ?? user.has_access
            const isPending = pending[user.id]
            const isChangingPwd = changePwdId === user.id
            return (
              <tr
                key={user.id}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="px-4 py-3" style={{ color: 'var(--text)' }}>
                  {user.display_name ?? '—'}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-2)' }}>
                  {user.email ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={
                      user.role === 'admin'
                        ? { background: 'var(--sky-t)', color: 'var(--sky-d)' }
                        : { background: 'var(--acc-t)', color: 'var(--accent)' }
                    }
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-3)' }}>
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  {user.role === 'admin' ? (
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      full access
                    </span>
                  ) : (
                    <button
                      onClick={() => toggle(user.id, hasAccess)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity disabled:opacity-50"
                      style={
                        hasAccess
                          ? { background: 'rgba(220,50,50,.1)', color: '#e05555' }
                          : { background: 'var(--sky-t)', color: 'var(--sky-d)' }
                      }
                    >
                      {isPending ? (
                        '...'
                      ) : hasAccess ? (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Revoke
                        </>
                      ) : (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Grant
                        </>
                      )}
                    </button>
                  )}
                </td>

                {/* Actions: change password + delete */}
                <td className="px-4 py-3">
                  {isChangingPwd ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="password"
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          placeholder="New password"
                          className="px-2 py-1 rounded-lg text-xs outline-none w-32"
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                          }}
                        />
                        <button
                          onClick={() => handleChangePassword(user.id)}
                          disabled={pwdPending === user.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50"
                          style={{ background: 'var(--sky-t)', color: 'var(--sky-d)' }}
                        >
                          {pwdPending === user.id ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => { setChangePwdId(null); setNewPwd(''); setPwdError(null) }}
                          className="px-2.5 py-1 rounded-lg text-xs"
                          style={{ color: 'var(--text-3)' }}
                        >
                          Cancel
                        </button>
                      </div>
                      {pwdError && (
                        <p className="text-xs" style={{ color: '#e05555' }}>{pwdError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {/* Change password */}
                      <button
                        onClick={() => { setChangePwdId(user.id); setNewPwd(''); setPwdError(null); setConfirmDeleteId(null) }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-3)' }}
                        aria-label="Change password"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </button>

                      {/* Delete */}
                      {confirmDeleteId === user.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50"
                            style={{ background: 'rgba(220,50,50,.15)', color: '#e05555' }}
                          >
                            {deletingId === user.id ? '...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs"
                            style={{ color: 'var(--text-3)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setConfirmDeleteId(user.id); setChangePwdId(null) }}
                          disabled={deletingId === user.id}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                          style={{ color: 'var(--text-3)' }}
                          aria-label="Delete user"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
