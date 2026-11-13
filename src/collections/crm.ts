import type { CollectionConfig } from 'payload'
import { admins, crmAccess, isAdmin, salesTeam, staff } from '@/access'
import { sourceGroup } from '@/fields'
import { LEAD_STAGES } from '@/lib/crm/stages'
import { onLeadChange } from '@/hooks/leads'
import { onMessageCreated } from '@/hooks/messages'

const SALES = '01 Sales'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  labels: { singular: 'Contact', plural: 'Contacts' },
  admin: {
    useAsTitle: 'fullName',
    group: SALES,
    defaultColumns: ['fullName', 'email', 'phone', 'country', 'owner', 'createdAt'],
    listSearchableFields: ['fullName', 'email', 'phone'],
    description: 'Every guest or agent who has been in touch. Open a contact to see their full timeline.',
    components: { views: { edit: { timeline: { Component: '/components/admin/views/ContactTimeline#ContactTimeline', path: '/timeline', tab: { label: 'Timeline', href: '/timeline', order: 50 } } } } },
  },
  access: crmAccess,
  fields: [
    { type: 'row', fields: [
      { name: 'firstName', type: 'text', required: true },
      { name: 'lastName', type: 'text' },
    ] },
    { name: 'fullName', type: 'text', admin: { hidden: true }, index: true },
    { type: 'row', fields: [
      { name: 'email', type: 'email', index: true },
      { name: 'phone', type: 'text' },
      { name: 'country', type: 'text' },
    ] },
    { name: 'company', type: 'relationship', relationTo: 'companies' },
    { name: 'owner', type: 'relationship', relationTo: 'users', label: 'Assigned agent', admin: { position: 'sidebar' } },
    { name: 'tags', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'marketingConsent', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Agreed to receive news. Never email offers without this.' } },
    { name: 'doNotContact', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Asked not to be contacted (also stops review requests).' } },
    { name: 'notes', type: 'textarea', label: 'Internal notes' },
    sourceGroup,
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.email) data.email = String(data.email).trim().toLowerCase()
        data.fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim()
        return data
      },
    ],
  },
}

export const Companies: CollectionConfig = {
  slug: 'companies',
  labels: { singular: 'Company', plural: 'Companies' },
  admin: { useAsTitle: 'name', group: SALES, defaultColumns: ['name', 'type', 'email', 'country'], description: 'Travel agents, partners and corporate clients.' },
  access: crmAccess,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'type', type: 'select', options: [
      { label: 'Travel agent', value: 'agent' }, { label: 'Partner', value: 'partner' }, { label: 'Corporate', value: 'corporate' }, { label: 'Other', value: 'other' },
    ] },
    { type: 'row', fields: [{ name: 'email', type: 'email' }, { name: 'phone', type: 'text' }, { name: 'country', type: 'text' }] },
    { name: 'website', type: 'text' },
    { name: 'commissionPercent', type: 'number', min: 0, max: 100 },
    { name: 'notes', type: 'textarea' },
  ],
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'title',
    group: SALES,
    defaultColumns: ['title', 'status', 'contact', 'assignedTo', 'travelStart', 'createdAt'],
    description: 'Each enquiry becomes a lead. Move it along the pipeline as you work it.',
  },
  access: crmAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'contact', type: 'relationship', relationTo: 'contacts', required: true, index: true },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'new', index: true,
      options: LEAD_STAGES.map((s) => ({ label: s.label, value: s.value })),
      admin: { position: 'sidebar' },
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' }, index: true },
    { name: 'statusChangedAt', type: 'date', admin: { position: 'sidebar', readOnly: true } },
    { name: 'lostReason', type: 'text', admin: { position: 'sidebar', condition: (d) => d?.status === 'lost' } },
    { name: 'trips', type: 'relationship', relationTo: 'trips', hasMany: true, label: 'Interested in' },
    { name: 'interests', type: 'select', hasMany: true, options: ['safari', 'coast', 'walking', 'marine', 'culture', 'honeymoon', 'family', 'birding'] },
    { type: 'row', fields: [
      { name: 'travelStart', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'travelEnd', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      { name: 'datesFlexible', type: 'checkbox', defaultValue: false },
    ] },
    { type: 'row', fields: [
      { name: 'adults', type: 'number', min: 0, defaultValue: 2 },
      { name: 'children', type: 'number', min: 0, defaultValue: 0 },
      { name: 'budget', type: 'text', admin: { description: 'As the guest described it.' } },
    ] },
    { name: 'estimatedValue', type: 'number', min: 0, admin: { description: 'US$ estimate, for the pipeline total.' } },
    { name: 'message', type: 'textarea', label: 'Guest\'s message' },
    { name: 'extra', type: 'json', admin: { description: 'Extra answers from the plan-your-trip form.', readOnly: true } },
    sourceGroup,
  ],
  hooks: { beforeChange: [onLeadChange.before], afterChange: [onLeadChange.after] },
}

export const Activities: CollectionConfig = {
  slug: 'activities',
  labels: { singular: 'Timeline entry', plural: 'Timeline' },
  admin: { useAsTitle: 'summary', group: SALES, defaultColumns: ['summary', 'type', 'contact', 'createdAt'], hidden: ({ user }) => !isAdmin(user as never) },
  access: { read: salesTeam, create: salesTeam, update: admins, delete: admins },
  fields: [
    { name: 'type', type: 'select', required: true, options: [
      'note', 'email_in', 'email_out', 'chat', 'status', 'lead', 'quote', 'booking', 'payment', 'review', 'task',
    ].map((v) => ({ label: v.replace('_', ' '), value: v })) },
    { name: 'summary', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'contact', type: 'relationship', relationTo: 'contacts', index: true },
    { name: 'lead', type: 'relationship', relationTo: 'leads', index: true },
    { name: 'by', type: 'relationship', relationTo: 'users' },
    { name: 'meta', type: 'json' },
  ],
}

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  labels: { singular: 'Task', plural: 'Tasks' },
  admin: { useAsTitle: 'title', group: SALES, defaultColumns: ['title', 'due', 'assignedTo', 'done'] },
  access: crmAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    { type: 'row', fields: [
      { name: 'due', type: 'date', index: true },
      { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
      { name: 'done', type: 'checkbox', defaultValue: false },
    ] },
    { name: 'lead', type: 'relationship', relationTo: 'leads' },
    { name: 'contact', type: 'relationship', relationTo: 'contacts' },
    { name: 'notes', type: 'textarea' },
  ],
}

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  labels: { singular: 'Conversation', plural: 'Conversations' },
  admin: {
    useAsTitle: 'subject',
    group: SALES,
    defaultColumns: ['subject', 'channel', 'status', 'assignedTo', 'unread', 'lastMessageAt'],
    description: 'Email and live chat threads. Use the Inbox to reply.',
  },
  access: crmAccess,
  fields: [
    { name: 'subject', type: 'text', required: true },
    { name: 'contact', type: 'relationship', relationTo: 'contacts', index: true },
    { name: 'lead', type: 'relationship', relationTo: 'leads' },
    { name: 'channel', type: 'select', required: true, defaultValue: 'email', options: [{ label: 'Email', value: 'email' }, { label: 'Live chat', value: 'chat' }] },
    { name: 'status', type: 'select', required: true, defaultValue: 'open', index: true, options: [
      { label: 'Open', value: 'open' }, { label: 'Waiting on guest', value: 'pending' }, { label: 'Closed', value: 'closed' },
    ] },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', index: true },
    { name: 'unread', type: 'number', defaultValue: 0 },
    { name: 'lastMessageAt', type: 'date', index: true },
    { name: 'lastMessagePreview', type: 'text' },
    { name: 'lastDirection', type: 'select', options: ['in', 'out'] },
    // visitor chat session: sha256 of the token in the visitor's cookie
    { name: 'visitorTokenHash', type: 'text', index: true, admin: { hidden: true }, access: { read: () => false } },
    // a stable token used in reply-to addresses so guest email replies thread here
    { name: 'threadKey', type: 'text', index: true, admin: { readOnly: true } },
    sourceGroup,
  ],
}

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: { useAsTitle: 'preview', group: SALES, hidden: true },
  access: { read: salesTeam, create: salesTeam, update: salesTeam, delete: admins },
  fields: [
    { name: 'conversation', type: 'relationship', relationTo: 'conversations', required: true, index: true },
    { name: 'direction', type: 'select', required: true, options: [
      { label: 'From guest', value: 'in' }, { label: 'To guest', value: 'out' }, { label: 'Internal note', value: 'note' },
    ] },
    { name: 'channel', type: 'select', required: true, options: ['email', 'chat'] },
    { name: 'body', type: 'textarea', required: true },
    { name: 'preview', type: 'text' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { type: 'row', fields: [{ name: 'fromName', type: 'text' }, { name: 'fromEmail', type: 'email' }] },
    { name: 'emailMessageId', type: 'text', index: true },
    { name: 'deliveryStatus', type: 'select', options: ['queued', 'sent', 'logged', 'failed'] },
    { name: 'readAt', type: 'date' },
  ],
  hooks: {
    beforeChange: [({ data }) => { if (data.body) data.preview = String(data.body).replace(/\s+/g, ' ').slice(0, 140); return data }],
    afterChange: [onMessageCreated],
  },
}

export const CannedReplies: CollectionConfig = {
  slug: 'canned-replies',
  labels: { singular: 'Saved reply', plural: 'Saved replies' },
  admin: { useAsTitle: 'title', group: SALES, description: 'Reusable answers for the inbox. Use {firstName} and {agentName} as placeholders.' },
  access: { read: staff, create: salesTeam, update: salesTeam, delete: salesTeam },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'shortcut', type: 'text', admin: { description: 'Type /shortcut in the reply box.' } },
    { name: 'body', type: 'textarea', required: true },
  ],
}
