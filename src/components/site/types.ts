export type ContactInfo = {
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  hours: { days: string[]; opens: string; closes: string }[]
  social: { platform: string; url: string }[]
}
