import type { GlobalConfig } from 'payload'
import { admins } from '@/access'

/** When someone on the team last had the Inbox open (live chat shows "online" for 2 minutes after). */
export const ChatStatus: GlobalConfig = {
  slug: 'chat-status',
  admin: { hidden: true },
  access: { read: admins, update: admins },
  fields: [{ name: 'teamSeenAt', type: 'date' }],
}
