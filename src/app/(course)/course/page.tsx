import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BREATHWORK_COURSE_ID } from '@/lib/constants'
import CourseLayout from '@/components/course/CourseLayout'
import PaywallBlock from '@/components/course/PaywallBlock'

export default async function CoursePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Access check (server-side, cannot be bypassed) ──────────────────────
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', BREATHWORK_COURSE_ID)
    .eq('status', 'active')
    .maybeSingle()

  if (!purchase) {
    return <PaywallBlock />
  }

  // ── Fetch course data ────────────────────────────────────────────────────
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .order('module_id', { ascending: true })
    .order('order_index', { ascending: true })

  if (lessonsError) throw new Error(lessonsError.message)

  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('lesson_id, is_completed')
    .eq('user_id', user.id)

  const completedSet = new Set(
    (progressRows ?? [])
      .filter((p) => p.is_completed)
      .map((p) => p.lesson_id)
  )

  const lessonsWithProgress = (lessons ?? []).map((lesson) => ({
    ...lesson,
    is_completed: completedSet.has(lesson.id),
  }))

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <CourseLayout
      lessons={lessonsWithProgress}
      userEmail={user.email ?? ''}
      displayName={profile?.display_name ?? user.email ?? 'Student'}
    />
  )
}
