'use client'
import { createContext, useContext, type ReactNode } from 'react'

/** Public (never secret) settings the browser needs, set by the server layout. */
export type PublicConfig = { turnstileSiteKey?: string; whatsapp?: string; businessName: string }

const Ctx = createContext<PublicConfig>({ businessName: 'Ngina Trails and Safaris' })

export function PublicConfigProvider({ value, children }: { value: PublicConfig; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const usePublicConfig = () => useContext(Ctx)
