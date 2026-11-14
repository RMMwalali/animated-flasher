import type { IconName } from '@/components/icons/Icon'

/** Icon and readable name for each "profile on other sites" platform. */
export const SOCIAL: Record<string, { icon: IconName; label: string }> = {
  instagram: { icon: 'instagram', label: 'Instagram' },
  facebook: { icon: 'facebook', label: 'Facebook' },
  tiktok: { icon: 'tiktok', label: 'TikTok' },
  youtube: { icon: 'youtube', label: 'YouTube' },
  linkedin: { icon: 'linkedin', label: 'LinkedIn' },
  x: { icon: 'x-social', label: 'X' },
  tripadvisor: { icon: 'star', label: 'TripAdvisor' },
  safaribookings: { icon: 'star', label: 'SafariBookings' },
  google: { icon: 'map-pin', label: 'Google' },
  other: { icon: 'globe', label: 'Website' },
}

export const socialOf = (platform: string) => SOCIAL[platform] ?? SOCIAL.other!
