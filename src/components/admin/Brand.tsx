import { Icon } from '@/components/icons/Icon'

/** Login page logo: the traced mark in one colour plus the wordmark. */
export function AdminLogo() {
  return (
    <div className="ng-admin-logo">
      <img src="/brand/logo-stacked-deep.svg" alt="Ngina Trails and Safaris" width={220} height={190} />
      <p className="ng-label">Back office</p>
    </div>
  )
}

/** Nav icon (top-left of the admin). */
export function AdminIcon() {
  return <img src="/brand/mark-deep.svg" alt="" width={44} height={22} className="ng-admin-icon" />
}

export function AdminArrow() {
  return <Icon name="arrow-right" size={16} />
}
