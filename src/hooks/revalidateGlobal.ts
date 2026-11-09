import type { GlobalAfterChangeHook } from 'payload'

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    revalidateTag('content', 'max')
    revalidatePath('/', 'layout')
  } catch {
    /* outside Next.js */
  }
  return doc
}
