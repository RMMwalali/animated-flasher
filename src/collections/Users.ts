import type { CollectionConfig } from 'payload'
import { admins, isAdmin, ROLES } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'active'],
    group: '05 Team',
    description: 'People who can log in. Roles: Admin (everything), Sales agent (inbox, leads, bookings, payments), Content editor (website content).',
  },
  auth: {
    tokenExpiration: 60 * 60 * 12,
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  access: {
    read: ({ req }) => (isAdmin(req.user as never) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: admins,
    update: ({ req }) => (isAdmin(req.user as never) ? true : req.user ? { id: { equals: req.user.id } } : false),
    delete: admins,
    // the first user can always be created so the owner can set up the account
    admin: ({ req }) => Boolean(req.user && (req.user as { active?: boolean }).active !== false),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['sales'],
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Sales agent', value: 'sales' },
        { label: 'Content editor', value: 'editor' },
      ] satisfies { label: string; value: (typeof ROLES)[number] }[],
      access: { update: ({ req }) => isAdmin(req.user as never), create: ({ req }) => isAdmin(req.user as never) },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { description: 'Untick to block this person from logging in.' }, access: { update: ({ req }) => isAdmin(req.user as never) } },
    { name: 'phone', type: 'text' },
    { name: 'title', type: 'text', label: 'Job title', admin: { description: 'Shown in email signatures.' } },
    { name: 'signature', type: 'textarea', admin: { description: 'Added under emails you send from the inbox.' } },
    {
      name: 'notify',
      type: 'group',
      label: 'Notifications',
      fields: [
        { name: 'newLeads', type: 'checkbox', defaultValue: true, label: 'Email me when a lead is assigned to me' },
        { name: 'chat', type: 'checkbox', defaultValue: true, label: 'Email me about new chats when I am offline' },
      ],
    },
    { name: 'takesNewLeads', type: 'checkbox', defaultValue: true, label: 'Include me in automatic lead assignment' },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        // First user ever becomes admin automatically.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
          if (totalDocs === 0) data.roles = ['admin']
        }
        return data
      },
    ],
  },
}
