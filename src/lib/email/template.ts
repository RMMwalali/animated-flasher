import { colors } from '@/lib/brand/tokens'
import { env } from '@/lib/env'

export type EmailContent = {
  preheader?: string
  heading: string
  paragraphs: string[]
  /** label/value rows, e.g. booking summary */
  facts?: Array<[string, string]>
  button?: { label: string; href: string }
  footerNote?: string
  signature?: string
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** One simple, accessible, brand-coloured layout for every email. */
export function renderEmail(c: EmailContent): { html: string; text: string } {
  const logo = `${env.SITE_URL}/brand/icon-192.png`
  const paras = c.paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${colors.deep}">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
  const facts = c.facts?.length
    ? `<table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0 24px">${c.facts
        .map(([k, v]) => `<tr><td style="padding:8px 0;border-top:1px solid ${colors.line};font:600 12px Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:${colors.tealInk}">${esc(k)}</td><td style="padding:8px 0;border-top:1px solid ${colors.line};font-size:15px;color:${colors.deep};text-align:right">${esc(v)}</td></tr>`)
        .join('')}</table>`
    : ''
  const button = c.button
    ? `<p style="margin:8px 0 24px"><a href="${esc(c.button.href)}" style="display:inline-block;background:${colors.orange600};color:${colors.cream};text-decoration:none;font-weight:700;padding:14px 22px;border-radius:999px">${esc(c.button.label)}</a></p>`
    : ''
  const sig = c.signature ? `<p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:${colors.deep};white-space:pre-line">${esc(c.signature)}</p>` : ''
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(c.heading)}</title></head>
<body style="margin:0;background:${colors.cream};font-family:Helvetica,Arial,sans-serif">
${c.preheader ? `<div style="display:none;max-height:0;overflow:hidden">${esc(c.preheader)}</div>` : ''}
<table role="presentation" width="100%" style="background:${colors.cream}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:${colors.paper};border-radius:16px;padding:32px">
<tr><td><img src="${logo}" width="56" height="56" alt="Ngina Trails and Safaris" style="display:block;margin-bottom:24px;border-radius:12px">
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:${colors.deep}">${esc(c.heading)}</h1>
${paras}${facts}${button}${sig}
</td></tr></table>
<p style="max-width:560px;margin:16px auto 0;font:600 12px/1.5 Helvetica,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:${colors.tealInk}">Ngina Trails and Safaris · Diani Beach, Kenya</p>
${c.footerNote ? `<p style="max-width:560px;margin:8px auto 0;font-size:12px;line-height:1.5;color:${colors.deep}">${esc(c.footerNote)}</p>` : ''}
</td></tr></table></body></html>`
  const text = [
    c.heading,
    '',
    ...c.paragraphs,
    ...(c.facts?.length ? ['', ...c.facts.map(([k, v]) => `${k}: ${v}`)] : []),
    ...(c.button ? ['', `${c.button.label}: ${c.button.href}`] : []),
    ...(c.signature ? ['', c.signature] : []),
    '',
    'Ngina Trails and Safaris · Diani Beach, Kenya',
    ...(c.footerNote ? [c.footerNote] : []),
  ].join('\n')
  return { html, text }
}
