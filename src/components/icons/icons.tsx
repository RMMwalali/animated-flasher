/**
 * Ngina line icon set: 24px grid, 1.5px stroke, round caps/joins, no fill.
 * Drawn for this project. Used by the public site and the admin dashboard.
 */
import type { ReactElement } from 'react'

export const icons = {
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h11" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  'arrow-right': <path d="M4 12h15.5M14 6.5l5.5 5.5-5.5 5.5" />,
  'arrow-left': <path d="M20 12H4.5M10 6.5L4.5 12l5.5 5.5" />,
  'arrow-up-right': <path d="M7 17L17 7M8.5 7H17v8.5" />,
  'arrow-down': <path d="M12 4v15.5M6.5 14l5.5 5.5 5.5-5.5" />,
  'chevron-down': <path d="M6 9.5l6 6 6-6" />,
  'chevron-right': <path d="M9.5 6l6 6-6 6" />,
  'chevron-left': <path d="M14.5 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
      <path d="M12 2.5v1.5M12 20v1.5M2.5 12H4M20 12h1.5" />
    </>
  ),
  'sound-on': (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
    </>
  ),
  'sound-off': (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </>
  ),
  play: <path d="M7.5 5.5v13l11-6.5z" />,
  pause: <path d="M8 5.5v13M16 5.5v13" />,
  chat: <path d="M4 5.5h16v10.5h-9l-4.5 3.5V16H4z" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M4 6.5l8 6.5 8-6.5" />
    </>
  ),
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a10 10 0 005.5 5.5l1.5-2 4 1.5v3a2 2 0 01-2 2A15.5 15.5 0 014.5 5.5a2 2 0 012-2z" />,
  'map-pin': (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  map: <path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3 19.5a6 6 0 0112 0M15.5 5.5a3.25 3.25 0 010 6.25M17.5 14a6 6 0 013.5 5.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20a7.5 7.5 0 0115 0" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  rain: (
    <>
      <path d="M7 15.5a4 4 0 01-.5-8 5.5 5.5 0 0110.5 1.5 3.25 3.25 0 01.5 6.5z" />
      <path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" />
    </>
  ),
  wave: <path d="M2.5 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 4 2M2.5 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 4 2M2.5 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 4 2" />,
  mountain: <path d="M2.5 19.5l7-12 4 6.5 2-3 6 8.5zM8 10l1.5 1.5L11 10" />,
  acacia: <path d="M3 9.5c2-1.5 5-1.5 7-2.5 1.5-1.5 4-1.5 5.5 0 2 .5 4 1.5 5.5 2.5zM12 9.5v10M12 13l-3-3.5M12 12.5l3.5-3M8 20h8" />,
  binoculars: (
    <>
      <circle cx="6.5" cy="15.5" r="3.5" />
      <circle cx="17.5" cy="15.5" r="3.5" />
      <path d="M10 15.5h4M4.5 12.5l2-7h3l.5 7M19.5 12.5l-2-7h-3l-.5 7" />
    </>
  ),
  dhow: <path d="M3 16.5h18l-2.5 3.5h-13zM12 16.5V3.5M12 4l7 11H12M12 6.5L6 15h6" />,
  snorkel: (
    <>
      <path d="M3.5 9h11a2 2 0 012 2v2a2 2 0 01-2 2h-2.5l-1.5-1.5L9 15H5.5a2 2 0 01-2-2z" />
      <path d="M19.5 4v12a4 4 0 01-4 4h-2" />
    </>
  ),
  fish: <path d="M3 12c3-4.5 9-5.5 13.5-1.5L21 7v10l-4.5-3.5C12 17.5 6 16.5 3 12zM8 11v.01" />,
  bird: <path d="M3 13c3 0 4.5-1 6-3l2.5-3.5a3 3 0 015 0L18 8l3 .5-2.5 1.5c0 5-4 8.5-9.5 8.5-2 0-4-1-6-5.5zM9.5 18L8 21M13 18l.5 3" />,
  leaf: <path d="M5 19c0-9 5-14 14.5-14.5C19 14 14 19 5 19zM5 19l8-8" />,
  footprints: <path d="M7 4.5c1.5 0 2.5 2 2.5 4.5s-1 4-2.5 4-2.5-1.5-2.5-4 1-4.5 2.5-4.5zM5 15.5l4.5.5-.5 3.5c-.2 1.5-4 1.5-4-.5zM17 7.5c1.5 0 2.5 2 2.5 4.5s-1 4-2.5 4-2.5-1.5-2.5-4 1-4.5 2.5-4.5zM15 18.5l4.5.5-.5 2c-.3 1-3.8 1.2-4-.5z" />,
  camera: (
    <>
      <path d="M3.5 8h4l1.5-2.5h6L16.5 8h4v11h-17z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 16l5-5 4 4 2.5-2.5 5.5 5.5" />
      <circle cx="15.5" cy="9" r="1.5" />
    </>
  ),
  video: <path d="M3.5 6.5h12v11h-12zM15.5 10.5l5-3v9l-5-3" />,
  thermometer: (
    <>
      <path d="M10 14.5V5a2 2 0 014 0v9.5a3.75 3.75 0 11-4 0z" />
      <path d="M12 9v7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M3.5 12h17M12 3.25c2.5 2.5 3.5 5.5 3.5 8.75s-1 6.25-3.5 8.75c-2.5-2.5-3.5-5.5-3.5-8.75s1-6.25 3.5-8.75z" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />,
  shield: <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6zM8.5 12l2.5 2.5 4.5-5" />,
  // admin
  overview: <path d="M3.5 3.5h7v7h-7zM13.5 3.5h7v4h-7zM13.5 10.5h7v10h-7zM3.5 13.5h7v7h-7z" />,
  inbox: <path d="M3.5 13.5l2.5-8.5h12l2.5 8.5v6h-17zM3.5 13.5H9l1 2.5h4l1-2.5h5.5" />,
  pipeline: <path d="M3.5 4.5h4.5v15H3.5zM10 4.5h4.5v10H10zM16.5 4.5H21v6.5h-4.5z" />,
  contacts: (
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.5" />
      <circle cx="12" cy="10" r="2.75" />
      <path d="M8 17a4 4 0 018 0M2.5 7.5h2M2.5 12h2M2.5 16.5h2" />
    </>
  ),
  building: <path d="M4.5 20.5v-16h9v16M13.5 9.5h6v11M3 20.5h18M7.5 8h3M7.5 11.5h3M7.5 15h3M16 13h1M16 16.5h1" />,
  quote: <path d="M6 3.5h9l4 4v13H6zM14.5 3.5V8h4.5M9 12h7M9 15h7M9 18h4" />,
  booking: <path d="M3.5 7.5h17v3a2 2 0 000 3v3h-17v-3a2 2 0 000-3zM14.5 7.5v9" />,
  traveller: (
    <>
      <circle cx="12" cy="5.5" r="2.25" />
      <path d="M9.5 21l1-6.5L9 13V9.5h6V13l-1.5 1.5 1 6.5M6.5 11V8.5" />
    </>
  ),
  supplier: <path d="M3.5 9.5L12 4l8.5 5.5M5.5 9v10.5h13V9M9.5 19.5v-6h5v6" />,
  vehicle: (
    <>
      <path d="M3 16.5v-5l2-5h11l2.5 5H21v5zM3 11.5h18" />
      <circle cx="7.5" cy="17" r="1.75" />
      <circle cx="16.5" cy="17" r="1.75" />
    </>
  ),
  bed: <path d="M3 19V6M3 15h18v4M21 15v-3.5a2.5 2.5 0 00-2.5-2.5H11v6M6.5 11.5a1.5 1.5 0 100-.01" />,
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="M3 9.5h18M6.5 15h4" />
    </>
  ),
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="1.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  receipt: <path d="M5.5 3h13v18l-2.2-1.5-2.1 1.5-2.2-1.5-2.2 1.5-2.1-1.5L5.5 21zM9 8h6M9 11.5h6M9 15h3.5" />,
  money: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.75" />
      <path d="M6 9v.01M18 15v.01" />
    </>
  ),
  review: <path d="M4 4.5h16v11.5h-8l-4.5 3.5V16H4zM12 7l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" />,
  content: <path d="M5 3.5h14v17H5zM8.5 7.5h7M8.5 11h7M8.5 14.5h4" />,
  team: (
    <>
      <circle cx="12" cy="7.5" r="3" />
      <circle cx="5" cy="10" r="2.25" />
      <circle cx="19" cy="10" r="2.25" />
      <path d="M6.5 20a5.5 5.5 0 0111 0M1.5 18a3.5 3.5 0 015.5-2.8M22.5 18a3.5 3.5 0 00-5.5-2.8" />
    </>
  ),
  audit: <path d="M5.5 3.5h13v17h-13zM8.5 8l1 1 2-2M8.5 12.5l1 1 2-2M8.5 17l1 1 2-2M13.5 8.5h2.5M13.5 13h2.5M13.5 17.5h2.5" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  bell: <path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15zM10 21h4" />,
  send: <path d="M3.5 11.5l17-8-6 17-3-7.5zM11.5 13l9-9.5" />,
  note: <path d="M5 3.5h14v12l-5 5H5zM14 20.5v-5h5M8.5 8h7M8.5 11.5h4" />,
  tag: (
    <>
      <path d="M3.5 3.5h8l9 9-8 8-9-9z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  task: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 12l3 3 5.5-6" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5l5 5" />
    </>
  ),
  filter: <path d="M3.5 5h17l-6.5 8v6l-4 1.5V13z" />,
  'external-link': <path d="M13.5 4h6.5v6.5M20 4l-9 9M17.5 14v6h-13.5v-13.5h6" />,
  download: <path d="M12 3.5v12M7 10.5l5 5 5-5M4 20.5h16" />,
  edit: <path d="M4 20l1-4.5L16 4.5l3.5 3.5-11 11zM13.5 7l3.5 3.5" />,
  trash: <path d="M4 6.5h16M9.5 6.5V4h5v2.5M6 6.5l1 14h10l1-14M10 10.5v6M14 10.5v6" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" />
    </>
  ),
  link: <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 11v5.5M12 7.5v.01" />
    </>
  ),
  alert: <path d="M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.5v.01" />,
  paperclip: <path d="M19.5 11l-7.5 7.5a5 5 0 01-7-7L12.5 4a3.5 3.5 0 015 5l-7.5 7.5a2 2 0 01-2.8-2.8l7-7" />,
  logout: <path d="M14 4.5H5v15h9M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7v.01" />
    </>
  ),
  facebook: <path d="M14.5 21v-7.5h2.5l.5-3h-3V8.75c0-.9.4-1.75 1.75-1.75H17.5V4.4a17 17 0 00-2.4-.2c-2.5 0-4.1 1.5-4.1 4.2v2.1H8.5v3h2.5V21" />,
  whatsapp: <path d="M4 20l1.2-4A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1a4 4 0 01-2.5-2.5l1-1-1-2z" />,
  tiktok: <path d="M14 3.5v11.25a3.75 3.75 0 11-3.75-3.75M14 3.5c.4 2.6 2.2 4.4 4.75 4.75" />,
  youtube: (
    <>
      <rect x="2.75" y="5.75" width="18.5" height="12.5" rx="3.5" />
      <path d="M10.25 9.25v5.5L15 12z" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16M8 7.75v.01M11.5 16v-5.5M11.5 13c0-1.5 1-2.5 2.25-2.5S16 11.25 16 13v3" />
    </>
  ),
  'x-social': <path d="M4.5 4.5l15 15M19.5 4.5l-6.25 6.25M10.75 13.25L4.5 19.5" />,
} satisfies Record<string, ReactElement>

export type IconName = keyof typeof icons
