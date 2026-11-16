/**
 * A small page-layout helper on top of pdf-lib for the guest documents
 * (quote, invoice, receipt): A4, brand colours, one sans-serif family,
 * automatic page breaks and word wrapping.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import { LOGO_PNG_BASE64, LOGO_SIZE } from './logo'

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
export const C = { deep: hex('#0e2b27'), orange: hex('#c2621f'), ink: hex('#1f2d2a'), muted: hex('#5d6b67'), line: hex('#d9d4c8'), paper: hex('#f7f5f0') }

const A4 = { w: 595.28, h: 841.89 }
const M = 48 // margin
export const CONTENT_W = A4.w - M * 2

export type Business = { name: string; tagline?: string; email?: string; phone?: string; address?: string; site?: string }

/** Characters the built-in PDF font cannot draw are swapped for plain ones (never crash on a guest's name). */
function safe(font: PDFFont, s: string): string {
  const map: Record<string, string> = {
    '\u2212': '-', '\u2192': '->', '\u2713': 'v', '\u2248': '~', '\u202f': ' ', '\u2009': ' ', '\u200b': '',
    Ł: 'L', ł: 'l', Đ: 'D', đ: 'd', Ħ: 'H', ħ: 'h', Ø: 'O', ø: 'o', ı: 'i',
  }
  let out = ''
  // emoji and pictographs are dropped rather than printed as "?"
  for (const ch of s.normalize('NFC').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/ {2,}/g, ' ')) {
    const c = map[ch] ?? ch
    try {
      font.encodeText(c)
      out += c
    } catch {
      const plain = c.normalize('NFD').replace(/[̀-ͯ]/g, '')
      try {
        font.encodeText(plain)
        out += plain
      } catch {
        out += '?'
      }
    }
  }
  return out
}

export class Doc {
  private constructor(
    readonly pdf: PDFDocument,
    private regular: PDFFont,
    private bold: PDFFont,
    private biz: Business,
    private footerText: string,
  ) {}
  page!: PDFPage
  y = 0
  private pages: PDFPage[] = []

  static async create(opts: { title: string; business: Business; footer: string }) {
    const pdf = await PDFDocument.create()
    pdf.setTitle(opts.title)
    pdf.setAuthor(opts.business.name)
    pdf.setCreator(opts.business.name)
    pdf.setProducer(opts.business.name)
    const d = new Doc(pdf, await pdf.embedFont(StandardFonts.Helvetica), await pdf.embedFont(StandardFonts.HelveticaBold), opts.business, opts.footer)
    await d.firstPage()
    return d
  }

  private async firstPage() {
    this.newPage()
    const logo = await this.pdf.embedPng(Buffer.from(LOGO_PNG_BASE64, 'base64'))
    const h = 64
    const w = (LOGO_SIZE.width / LOGO_SIZE.height) * h
    this.page.drawImage(logo, { x: M, y: A4.h - M - h, width: w, height: h })
    // business details, right aligned
    const lines = [this.biz.address, this.biz.phone, this.biz.email, this.biz.site].filter(Boolean) as string[]
    let y = A4.h - M - 9
    this.textRight(this.biz.name, A4.w - M, y, 10, true, C.deep)
    for (const l of lines) {
      y -= 13
      this.textRight(l, A4.w - M, y, 8.5, false, C.muted)
    }
    this.y = A4.h - M - h - 28
  }

  private newPage() {
    this.page = this.pdf.addPage([A4.w, A4.h])
    this.pages.push(this.page)
    this.y = A4.h - M
  }

  /** Make room for `h` points, starting a new page when needed. */
  need(h: number) {
    if (this.y - h < M + 36) this.newPage()
  }

  width(s: string, size: number, bold = false) {
    return (bold ? this.bold : this.regular).widthOfTextAtSize(safe(bold ? this.bold : this.regular, s), size)
  }

  text(s: string, x: number, y: number, size: number, bold = false, color: RGB = C.ink) {
    const font = bold ? this.bold : this.regular
    this.page.drawText(safe(font, s), { x, y, size, font, color })
  }

  textRight(s: string, right: number, y: number, size: number, bold = false, color: RGB = C.ink) {
    this.text(s, right - this.width(s, size, bold), y, size, bold, color)
  }

  wrap(s: string, size: number, maxW: number, bold = false): string[] {
    const out: string[] = []
    for (const para of s.split(/\r?\n/)) {
      if (!para.trim()) {
        out.push('')
        continue
      }
      let line = ''
      for (const word of para.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word
        if (this.width(next, size, bold) <= maxW) line = next
        else {
          if (line) out.push(line)
          // a single word wider than the column is cut
          let w = word
          while (this.width(w, size, bold) > maxW && w.length > 1) {
            let i = w.length
            while (i > 1 && this.width(w.slice(0, i), size, bold) > maxW) i--
            out.push(w.slice(0, i))
            w = w.slice(i)
          }
          line = w
        }
      }
      if (line) out.push(line)
    }
    return out
  }

  /** A block of wrapped text at the current position. */
  paragraph(s: string, opts: { size?: number; bold?: boolean; color?: RGB; x?: number; width?: number; gap?: number } = {}) {
    const size = opts.size ?? 10
    const lh = size * 1.4
    for (const l of this.wrap(s, size, opts.width ?? CONTENT_W, opts.bold)) {
      this.need(lh)
      this.y -= lh
      if (l) this.text(l, opts.x ?? M, this.y + size * 0.3, size, opts.bold, opts.color)
    }
    this.y -= opts.gap ?? 6
  }

  title(kicker: string, heading: string) {
    this.text(kicker.toUpperCase(), M, this.y, 8.5, true, C.orange)
    this.y -= 26
    for (const l of this.wrap(heading, 20, CONTENT_W, true)) {
      this.text(l, M, this.y, 20, true, C.deep)
      this.y -= 26
    }
    this.y -= 4
  }

  heading(s: string) {
    this.need(40)
    this.y -= 16
    this.text(s.toUpperCase(), M, this.y, 8.5, true, C.orange)
    this.y -= 8
    this.rule()
  }

  rule(color: RGB = C.line) {
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: A4.w - M, y: this.y }, thickness: 0.75, color })
    this.y -= 4
  }

  /** Label / value pairs in two columns (e.g. Quote no., Dates, Travellers). */
  facts(rows: [string, string][]) {
    const colW = CONTENT_W / 2
    for (let i = 0; i < rows.length; i += 2) {
      const pair = rows.slice(i, i + 2)
      const heights = pair.map(([, v]) => this.wrap(v, 10, colW - 12, true).length)
      const h = 14 + Math.max(...heights) * 14
      this.need(h)
      pair.forEach(([label, value], k) => {
        const x = M + k * colW
        this.text(label, x, this.y - 10, 8, false, C.muted)
        this.wrap(value, 10, colW - 12, true).forEach((l, j) => this.text(l, x, this.y - 24 - j * 14, 10, true, C.ink))
      })
      this.y -= h + 6
    }
  }

  /** A table with a wrapping first column and right-aligned number columns. */
  table(head: string[], rows: string[][], widths: number[]) {
    const xs = widths.map((_, i) => M + widths.slice(0, i).reduce((a, b) => a + b, 0))
    const draw = (cells: string[], bold: boolean, color: RGB) => {
      const first = this.wrap(cells[0] ?? '', 9.5, widths[0]! - 10, bold)
      const h = Math.max(1, first.length) * 13 + 8
      this.need(h)
      first.forEach((l, j) => this.text(l, xs[0]!, this.y - 12 - j * 13, 9.5, bold, color))
      cells.slice(1).forEach((c, k) => this.textRight(c, xs[k + 1]! + widths[k + 1]!, this.y - 12, 9.5, bold, color))
      this.y -= h
    }
    this.need(24)
    draw(head, true, C.muted)
    this.rule()
    for (const r of rows) {
      draw(r, false, C.ink)
      this.page.drawLine({ start: { x: M, y: this.y + 2 }, end: { x: A4.w - M, y: this.y + 2 }, thickness: 0.4, color: C.line })
    }
  }

  /** Right-aligned totals; the `strong` row is larger and in brand green. */
  totals(rows: { label: string; value: string; strong?: boolean }[]) {
    this.y -= 6
    for (const r of rows) {
      const size = r.strong ? 12 : 10
      this.need(size + 10)
      this.y -= size + 8
      this.textRight(r.label, A4.w - M - 130, this.y, size, Boolean(r.strong), r.strong ? C.deep : C.muted)
      this.textRight(r.value, A4.w - M, this.y, size, true, r.strong ? C.deep : C.ink)
    }
    this.y -= 8
  }

  /** A shaded box, e.g. "Paid in full" or "How to accept". */
  callout(heading: string, body: string[]) {
    const lines = body.flatMap((b) => this.wrap(b, 9.5, CONTENT_W - 28))
    const h = 26 + lines.length * 13.5 + 8
    this.need(h + 8)
    this.y -= 8
    this.page.drawRectangle({ x: M, y: this.y - h, width: CONTENT_W, height: h, color: C.paper, borderColor: C.line, borderWidth: 0.75 })
    this.text(heading, M + 14, this.y - 18, 10.5, true, C.deep)
    lines.forEach((l, i) => this.text(l, M + 14, this.y - 34 - i * 13.5, 9.5, false, C.ink))
    this.y -= h + 6
  }

  async save(): Promise<Uint8Array> {
    const n = this.pages.length
    this.pages.forEach((p, i) => {
      const font = this.regular
      p.drawLine({ start: { x: M, y: M + 18 }, end: { x: A4.w - M, y: M + 18 }, thickness: 0.5, color: C.line })
      p.drawText(safe(font, this.footerText), { x: M, y: M + 4, size: 7.5, font, color: C.muted })
      const pg = `Page ${i + 1} of ${n}`
      p.drawText(pg, { x: A4.w - M - font.widthOfTextAtSize(pg, 7.5), y: M + 4, size: 7.5, font, color: C.muted })
    })
    return this.pdf.save()
  }
}
