/**
 * Traveller details sent by the guest from their trip page: who is
 * travelling (name as on passport, nationality, date of birth, diet,
 * health notes, emergency contact) and their flights. Saved on the booking,
 * and logged in the guest's Inbox conversation so the team sees it.
 */
import type { Payload } from 'payload'
import { z } from 'zod'
import { guestConversation } from '@/lib/inbox'
import { GuestError, findBookingByToken, localReq } from './flows'
import { ageOn, travellerGaps } from './rules'

const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))
const text = (max: number) => z.string().trim().max(max).optional().default('')
const isoDate = z.string().trim().refine((s) => s === '' || !Number.isNaN(Date.parse(s)), 'Invalid date').optional().default('')

const traveller = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, 'Please enter each traveller\'s full name.').max(120),
  nationality: text(60),
  dateOfBirth: isoDate,
  dietary: text(200),
  medicalNotes: text(1000),
  emergencyName: text(120),
  emergencyPhone: text(40),
})

export const detailsSchema = z.object({
  travellers: z.array(traveller).min(1, 'Add at least one traveller.').max(20),
  arrivalFlight: text(20),
  arrivalAt: isoDate,
  pickup: text(120),
  departureFlight: text(20),
  departureAt: isoDate,
  dropoff: text(120),
  guestNotes: text(1000),
})

export type DetailsInput = z.input<typeof detailsSchema>

/** Plain-words summary for the Inbox (no health notes: those stay on the traveller record). */
function summary(d: z.output<typeof detailsSchema>, gaps: string[]): string {
  const lines = [
    'Updated traveller details on their trip page.',
    '',
    ...d.travellers.map((t, i) => `${i + 1}. ${t.name}${t.nationality ? `, ${t.nationality}` : ''}${t.dateOfBirth ? `, born ${t.dateOfBirth.slice(0, 10)}` : ''}${t.dietary ? ` · diet: ${t.dietary}` : ''}${t.medicalNotes ? ' · has health notes' : ''}`),
  ]
  if (d.arrivalFlight || d.arrivalAt || d.pickup) lines.push('', `Arrival: ${[d.arrivalFlight, d.arrivalAt && d.arrivalAt.replace('T', ' ').slice(0, 16), d.pickup && `pick-up ${d.pickup}`].filter(Boolean).join(' · ')}`)
  if (d.departureFlight || d.departureAt || d.dropoff) lines.push(`Departure: ${[d.departureFlight, d.departureAt && d.departureAt.replace('T', ' ').slice(0, 16), d.dropoff && `drop-off ${d.dropoff}`].filter(Boolean).join(' · ')}`)
  if (d.guestNotes) lines.push('', `Notes: ${d.guestNotes}`)
  lines.push('', gaps.length ? `Still missing: ${gaps.join('; ')}.` : 'All details are in.')
  return lines.join('\n')
}

export async function saveTravellerDetails(payload: Payload, token: string, input: unknown) {
  const booking = await findBookingByToken(payload, token, 0)
  if (!booking) throw new GuestError('We could not find this booking.', 404)
  if (booking.status === 'cancelled' || booking.status === 'completed') throw new GuestError('This booking can no longer be changed online. Please contact us.', 409)
  const parsed = detailsSchema.safeParse(input)
  if (!parsed.success) throw new GuestError(parsed.error.issues[0]?.message ?? 'Please check the details.')
  const d = parsed.data
  if (d.travellers.length > Math.max(booking.pax ?? 1, 1) + 4) throw new GuestError('That is more travellers than on this booking. Please contact us to add people.')
  for (const t of d.travellers) {
    if (t.dateOfBirth && new Date(t.dateOfBirth) > new Date()) throw new GuestError(`Please check ${t.name}'s date of birth.`)
  }

  const req = await localReq(payload)
  const existing = new Set(((booking.travellers ?? []) as unknown[]).map(idOf))
  const contactId = idOf(booking.contact)
  const ids: number[] = []
  for (const t of d.travellers) {
    const data = {
      name: t.name,
      contact: contactId,
      nationality: t.nationality || undefined,
      dateOfBirth: t.dateOfBirth || undefined,
      isChild: t.dateOfBirth ? ageOn(t.dateOfBirth, booking.startDate) < 18 : false,
      ageOnTravel: t.dateOfBirth ? ageOn(t.dateOfBirth, booking.startDate) : undefined,
      dietary: t.dietary || undefined,
      emergencyName: t.emergencyName || undefined,
      emergencyPhone: t.emergencyPhone || undefined,
      // health notes are never shown back on the trip page; an empty box keeps what we have
      ...(t.medicalNotes ? { medicalNotes: t.medicalNotes } : {}),
    }
    // only update travellers that already belong to this booking
    if (t.id && existing.has(t.id)) {
      await payload.update({ collection: 'travellers', id: t.id, data, req, overrideAccess: true })
      ids.push(t.id)
    } else {
      const created = await payload.create({ collection: 'travellers', data: data as never, req, overrideAccess: true })
      ids.push(created.id)
    }
  }
  // travellers the guest removed
  for (const old of existing) {
    if (!ids.includes(old)) await payload.delete({ collection: 'travellers', id: old, req, overrideAccess: true }).catch(() => undefined)
  }

  const flights = {
    arrivalFlight: d.arrivalFlight || null, arrivalAt: d.arrivalAt || null, pickup: d.pickup || null,
    departureFlight: d.departureFlight || null, departureAt: d.departureAt || null, dropoff: d.dropoff || null,
    guestNotes: d.guestNotes || null,
  }
  await payload.update({
    collection: 'bookings', id: booking.id, req, overrideAccess: true,
    data: { travellers: ids, ...flights, detailsSubmittedAt: new Date().toISOString() } as never,
  })

  const gaps = travellerGaps({ pax: booking.pax, ...flights }, d.travellers).missing
  // logged in the guest's conversation, like every other message from them
  const conv = await guestConversation(req, { contactId, subject: `Booking ${booking.reference}: ${booking.title}`, leadId: booking.lead ? idOf(booking.lead) : undefined })
  await payload.create({
    collection: 'messages', req, overrideAccess: true,
    data: { conversation: conv.id, direction: 'in', channel: 'email', body: `[Trip page · ${booking.reference}] ${summary(d, gaps)}` },
  })
  await payload.create({
    collection: 'activities', req, overrideAccess: true,
    data: { type: 'booking', summary: `Traveller details updated on the trip page (${d.travellers.length} traveller${d.travellers.length === 1 ? '' : 's'})`, contact: contactId, lead: booking.lead ? idOf(booking.lead) : undefined },
  }).catch(() => undefined)
  return { missing: gaps }
}
