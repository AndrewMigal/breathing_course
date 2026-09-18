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
  if ((profile as { role: string } | null)?.role !== 'admin') throw new Error('Forbidden')

  return user
}

export async function changePassword(userId: string, newPassword: string) {
  await verifyAdmin()
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) throw new Error(error.message)
}

export async function deleteUser(userId: string) {
  await verifyAdmin()
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
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

export async function createUser(formData: {
  email: string
  password: string
  display_name: string
  role: 'student' | 'admin'
  grant_access: boolean
}) {
  await verifyAdmin()
  const admin = createAdminClient()

  // Create auth user (email_confirm skips the confirmation email)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    user_metadata: { display_name: formData.display_name },
    email_confirm: true,
  })
  if (createError) throw new Error(createError.message)

  const userId = created.user.id

  // Set role if admin (trigger sets 'student' by default)
  if (formData.role === 'admin') {
    await admin.from('profiles').update({ role: 'admin' }).eq('id', userId)
  }

  // Grant course access if requested
  if (formData.grant_access) {
    await admin.from('purchases').upsert(
      { user_id: userId, course_id: BREATHWORK_COURSE_ID, status: 'active' },
      { onConflict: 'user_id,course_id' }
    )
  }

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
