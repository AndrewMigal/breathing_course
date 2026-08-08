'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BREATHWORK_COURSE_ID } from '@/lib/constants'

export async function markLessonComplete(lessonId: string, completed: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Server-side access guard — cannot be bypassed from the frontend
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', BREATHWORK_COURSE_ID)
    .eq('status', 'active')
    .maybeSingle()

  if (!purchase) throw new Error('No active purchase')

  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,lesson_id' }
    )

  if (error) throw new Error(error.message)

  revalidatePath('/course')
}

export async function mockPurchase() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('purchases')
    .upsert(
      {
        user_id: user.id,
        course_id: BREATHWORK_COURSE_ID,
        status: 'active',
      },
      { onConflict: 'user_id,course_id' }
    )

  if (error) throw new Error(error.message)

  revalidatePath('/course')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
