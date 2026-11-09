import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { hasRole, type Role } from '@/access'

/** Wraps a custom admin view in Payload's chrome and enforces roles. */
export function Shell({ props, roles, children }: { props: AdminViewServerProps; roles?: Role[]; children: ReactNode }) {
  const { initPageResult, params, searchParams } = props
  const { req } = initPageResult
  if (!req.user) redirect('/admin/login')
  if (roles && !hasRole(req.user as never, ...roles)) {
    children = <div className="ng-page"><h1 className="ng-title">No access</h1><p className="ng-intro">Ask an admin for access to this area.</p></div>
  }
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      {children}
    </DefaultTemplate>
  )
}
