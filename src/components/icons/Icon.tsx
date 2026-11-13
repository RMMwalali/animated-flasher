import type { SVGProps } from 'react'
import { icons, type IconName } from './icons'

type Props = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName
  size?: number
  /** Accessible label. Omit for decorative icons (aria-hidden). */
  label?: string
}

export function Icon({ name, size = 24, label, strokeWidth = 1.5, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      {...rest}
    >
      {icons[name]}
    </svg>
  )
}

export type { IconName }
