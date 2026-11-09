import { z } from 'zod'

/** Attribution captured on the client (UTM + page + CTA). Shared by every CTA. */
export const sourceSchema = z
  .object({
    channel: z.enum(['form', 'plan', 'chat', 'email', 'phone', 'referral', 'other']).default('form'),
    ctaId: z.string().max(80).optional(),
    page: z.string().max(300).optional(),
    landingPage: z.string().max(500).optional(),
    referrer: z.string().max(500).optional(),
    utmSource: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmCampaign: z.string().max(120).optional(),
    utmTerm: z.string().max(120).optional(),
    utmContent: z.string().max(120).optional(),
  })
  .partial()
  .default({})

const optDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .or(z.literal('').transform(() => undefined))

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(120),
  email: z.string().trim().email('Please enter a valid email').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  travelStart: optDate,
  travelEnd: optDate,
  datesFlexible: z.boolean().optional(),
  adults: z.coerce.number().int().min(0).max(50).optional(),
  children: z.coerce.number().int().min(0).max(50).optional(),
  budget: z.string().max(80).optional(),
  interests: z.array(z.enum(['safari', 'coast', 'walking', 'marine', 'culture', 'honeymoon', 'family', 'birding'])).max(8).optional(),
  tripSlug: z.string().max(120).optional(),
  extra: z.record(z.string(), z.union([z.string().max(500), z.number(), z.boolean(), z.array(z.string().max(120)).max(20)])).optional(),
  consentMarketing: z.boolean().optional(),
  source: sourceSchema,
  // spam protection
  website: z.string().max(0, 'spam').optional().or(z.literal('')), // honeypot: must stay empty
  startedAt: z.coerce.number().optional(), // ms timestamp when the form was rendered
  turnstileToken: z.string().max(2048).optional(),
})

export type EnquiryInput = z.infer<typeof enquirySchema>

export const chatStartSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1).max(2000),
  source: sourceSchema,
  website: z.string().max(0).optional().or(z.literal('')),
})

export const chatMessageSchema = z.object({ message: z.string().trim().min(1).max(2000) })
