'use client'
import type { ReactNode } from 'react'

/** Placeholder for admin-wide client context (real-time inbox counts live in the Inbox view). */
export function AdminProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>
}
