import type { Access, FieldAccess, PayloadRequest } from 'payload'

export const ROLES = ['admin', 'sales', 'editor'] as const
export type Role = (typeof ROLES)[number]

type MaybeUser = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.roles?.some((r) => roles.includes(r)))

export const isAdmin = (user: MaybeUser) => hasRole(user, 'admin')
export const isStaff = (user: MaybeUser) => hasRole(user, 'admin', 'sales', 'editor')
export const isSales = (user: MaybeUser) => hasRole(user, 'admin', 'sales')
export const isEditor = (user: MaybeUser) => hasRole(user, 'admin', 'editor')

const u = (req: PayloadRequest) => req.user as MaybeUser

export const anyone: Access = () => true
export const admins: Access = ({ req }) => isAdmin(u(req))
export const staff: Access = ({ req }) => isStaff(u(req))
export const salesTeam: Access = ({ req }) => isSales(u(req))
export const editors: Access = ({ req }) => isEditor(u(req))

/** Published content is public; drafts only for editors. */
export const publishedOrEditors: Access = ({ req }) => {
  if (isStaff(u(req))) return true
  return { _status: { equals: 'published' } }
}

export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(u(req))
export const salesFieldOnly: FieldAccess = ({ req }) => isSales(u(req))

/** Collection-level access bundles */
export const crmAccess = { read: salesTeam, create: salesTeam, update: salesTeam, delete: admins }
export const contentAccess = { read: publishedOrEditors, create: editors, update: editors, delete: editors }
export const contentAccessNoDrafts = { read: anyone, create: editors, update: editors, delete: editors }
