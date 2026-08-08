'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markLessonComplete(lessonId: string, completed: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
