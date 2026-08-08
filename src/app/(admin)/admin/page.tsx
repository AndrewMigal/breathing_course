import { createAdminClient } from '@/lib/supabase/admin'
import { BREATHWORK_COURSE_ID } from '@/lib/constants'
import UsersTable, { type UserRow } from '@/components/admin/UsersTable'
import AddLessonForm from '@/components/admin/AddLessonForm'
import Link from 'next/link'

export default async function AdminPage() {
  const admin = createAdminClient()

  // Fetch all profiles
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name, email, role, created_at')
    .order('created_at', { ascending: false })

  // Fetch all purchases for this course
  const { data: purchases } = await admin
    .from('purchases')
    .select('user_id, status')
    .eq('course_id', BREATHWORK_COURSE_ID)

  const accessMap = new Set(
    (purchases ?? []).filter((p) => p.status === 'active').map((p) => p.user_id)
  )

  const users: UserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    email: p.email,
    role: p.role as 'student' | 'admin',
    created_at: p.created_at,
    has_access: accessMap.has(p.id),
  }))

  // Fetch existing modules for AddLessonForm
  const { data: lessons } = await admin
    .from('lessons')
    .select('module_id, module_name, order_index')
    .order('order_index', { ascending: true })

  const modulesMap = new Map<number, { module_name: string; max_order: number }>()
  for (const l of lessons ?? []) {
    const existing = modulesMap.get(l.module_id)
    modulesMap.set(l.module_id, {
      module_name: l.module_name,
      max_order: Math.max(l.order_index, existing?.max_order ?? 0),
    })
  }
  const modules = Array.from(modulesMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([module_id, { module_name, max_order }]) => ({
      module_id,
      module_name,
      next_order_index: max_order + 1,
    }))

  const totalLessons = lessons?.length ?? 0
  const activeAccess = accessMap.size
  const totalUsers = users.filter((u) => u.role !== 'admin').length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 px-6 h-14"
        style={{ background: 'var(--hdr)', borderBottom: '1px solid var(--hdr-2)' }}
      >
        <span className="font-semibold text-sm" style={{ color: '#F0E8D6' }}>
          Admin Panel
        </span>
        <span style={{ color: 'var(--text-3)' }}>·</span>
        <span className="text-sm" style={{ color: 'var(--text-3)' }}>
          Inhale Exhale Co.
        </span>
        <div className="flex-1" />
        <Link
          href="/course"
          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-3)', border: '1px solid var(--hdr-2)' }}
        >
          ← Back to Course
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Students', value: totalUsers },
            { label: 'Active Access', value: activeAccess },
            { label: 'Lessons', value: totalLessons },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-md)', border: '1px solid var(--border)' }}
            >
              <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Users
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-md)' }}
          >
            <UsersTable users={users} />
          </div>
        </section>

        {/* Add lesson */}
        <section>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Add Lesson
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>
            New lessons appear immediately in the course.
          </p>
          <div
            className="rounded-2xl p-6"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-md)' }}
          >
            <AddLessonForm modules={modules} />
          </div>
        </section>

      </div>
    </div>
  )
}
