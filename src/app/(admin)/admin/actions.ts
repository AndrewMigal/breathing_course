'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { BREATHWORK_COURSE_ID } from '@/lib/constants'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  return user
}

export async function grantAccess(userId: string) {
  await verifyAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('purchases').upsert(
    { user_id: userId, course_id: BREATHWORK_COURSE_ID, status: 'active' },
    { onConflict: 'user_id,course_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function revokeAccess(userId: string) {
  await verifyAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('purchases')
    .update({ status: 'refunded' })
    .eq('user_id', userId)
    .eq('course_id', BREATHWORK_COURSE_ID)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function addLesson(formData: {
  module_id: number
  module_name: string
  order_index: number
  title: string
  youtube_id: string
  description: string
  objectives: string[]
}) {
  await verifyAdmin()
  const admin = createAdminClient()

  const { error } = await admin.from('lessons').insert(formData)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/course')
}
