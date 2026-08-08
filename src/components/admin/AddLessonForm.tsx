'use client'

import { useState } from 'react'
import { addLesson } from '@/app/(admin)/admin/actions'

type Module = { module_id: number; module_name: string; next_order_index: number }

const EMPTY = {
  module_id: '',
  module_name: '',
  order_index: '',
  title: '',
  youtube_id: '',
  description: '',
  objectives: '',
}

export default function AddLessonForm({ modules }: { modules: Module[] }) {
  const [form, setForm] = useState(EMPTY)
  const [isNewModule, setIsNewModule] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleModuleSelect(value: string) {
    if (value === '__new__') {
      setIsNewModule(true)
      setForm((f) => ({ ...f, module_id: '', module_name: '', order_index: '' }))
    } else {
      const mod = modules.find((m) => String(m.module_id) === value)
      setIsNewModule(false)
      setForm((f) => ({
        ...f,
        module_id: value,
        module_name: mod?.module_name ?? '',
        order_index: String(mod?.next_order_index ?? ''),
      }))
    }
  }

  function set(key: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function setYoutubeId(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.trim()
    // Accept full URL or short URL and extract the ID
    const match =
      val.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
      val.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
      val.match(/embed\/([a-zA-Z0-9_-]{11})/)
    const id = match ? match[1] : val
    setForm((f) => ({ ...f, youtube_id: id }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const moduleId = parseInt(form.module_id)
    const orderIndex = parseInt(form.order_index)

    if (!form.title.trim()) return setError('Title is required')
    if (!form.youtube_id.trim()) return setError('YouTube ID is required')
    if (isNaN(moduleId) || moduleId < 1) return setError('Module ID must be a positive number')
    if (isNaN(orderIndex) || orderIndex < 1) return setError('Order index must be a positive number')
    if (!form.module_name.trim()) return setError('Module name is required')

    setLoading(true)
    try {
      await addLesson({
        module_id: moduleId,
        module_name: form.module_name.trim(),
        order_index: orderIndex,
        title: form.title.trim(),
        youtube_id: form.youtube_id.trim(),
        description: form.description.trim(),
        objectives: form.objectives
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean),
      })
      setForm(EMPTY)
      setIsNewModule(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
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
      {/* Module select */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Module</label>
        <select
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={inputStyle}
          value={isNewModule ? '__new__' : form.module_id}
          onChange={(e) => handleModuleSelect(e.target.value)}
          required
        >
          <option value="">— Select module —</option>
          {modules.map((m) => (
            <option key={m.module_id} value={String(m.module_id)}>
              {m.module_id}. {m.module_name}
            </option>
          ))}
          <option value="__new__">+ New module</option>
        </select>
      </div>

      {/* New module fields */}
      {isNewModule && (
        <div className="grid grid-cols-2 gap-3 pl-3 border-l-2" style={{ borderColor: 'var(--sky-b)' }}>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Module ID</label>
            <input
              type="number" min="1" value={form.module_id} onChange={set('module_id')}
              placeholder="4" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Module Name</label>
            <input
              type="text" value={form.module_name} onChange={set('module_name')}
              placeholder="e.g. Expert Techniques"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} required
            />
          </div>
        </div>
      )}

      {/* Order index */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Order Index</label>
        <input
          type="number" min="1" value={form.order_index} onChange={set('order_index')}
          placeholder="11" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={inputStyle} required
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>Lesson Title</label>
        <input
          type="text" value={form.title} onChange={set('title')}
          placeholder="e.g. Alternate Nostril Breathing"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={inputStyle} required
        />
      </div>

      {/* YouTube ID */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
          YouTube URL or Video ID
          <span className="ml-1 font-normal" style={{ color: 'var(--text-3)' }}>
            (paste full link or just the ID)
          </span>
        </label>
        <input
          type="text" value={form.youtube_id} onChange={setYoutubeId}
          placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={inputStyle} required
        />
        {form.youtube_id.length > 5 && (
          <img
            src={`https://img.youtube.com/vi/${form.youtube_id}/mqdefault.jpg`}
            alt="Preview"
            className="mt-2 rounded-lg w-48 h-auto"
          />
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
          Description <span className="font-normal" style={{ color: 'var(--text-3)' }}>(optional)</span>
        </label>
        <textarea
          value={form.description} onChange={set('description')}
          rows={3} placeholder="Brief description of the lesson..."
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={inputStyle}
        />
      </div>

      {/* Objectives */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={labelStyle}>
          Learning Objectives <span className="font-normal" style={{ color: 'var(--text-3)' }}>(optional, one per line)</span>
        </label>
        <textarea
          value={form.objectives} onChange={set('objectives')}
          rows={3} placeholder={"Understand X\nPractice Y\nLearn Z"}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
          style={inputStyle}
        />
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
          Lesson added successfully.
        </p>
      )}

      <button
        type="submit" disabled={loading}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
        style={{ background: 'var(--accent)', color: 'var(--bg)' }}
      >
        {loading ? 'Saving...' : 'Add Lesson'}
      </button>
    </form>
  )
}
