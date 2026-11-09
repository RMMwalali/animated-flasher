// Trace the logo masks (from segment.py) with potrace and assemble the SVG
// parts + lockups in public/brand/. Run with `pnpm brand`.
// Every shape here is traced from the client's raster: nothing is redrawn.
import fs from 'node:fs/promises'
import path from 'node:path'
import potrace from 'potrace'
import sharp from 'sharp'

const MASKS = 'scripts/brand/.masks'
const OUT = 'public/brand'
const parts = JSON.parse(await fs.readFile(`${MASKS}/parts.json`, 'utf8'))
const P = parts.palette

const trace = (file, opts = {}) =>
  new Promise((resolve, reject) => {
    const t = new potrace.Potrace({ turdSize: 12, optTolerance: 0.35, alphaMax: 1, threshold: 128, ...opts })
    t.loadImage(path.join(MASKS, `${file}.png`), (err) => {
      if (err) return reject(err)
      const tag = t.getPathTag()
      const d = /d="([^"]+)"/.exec(tag)?.[1] ?? ''
      // trim float noise: 1 decimal is plenty at 2000px
      resolve(d.replace(/(\d+\.\d)\d+/g, '$1'))
    })
  })

const names = [
  'layer-teal', 'layer-green', 'layer-green-light', 'layer-green-dark', 'layer-ochre', 'layer-deep',
  'horizon', 'silhouette', 'lion', 'acacia', 'mono-mark', 'text-1', 'text-2', 'text-3',
]
const d = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await trace(n)])))

const pad = (b, p) => [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p]
const vb = (b) => b.map((v) => Math.round(v)).join(' ')
const union = (...bs) => [
  Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])),
  Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3])),
]
const svg = (viewBox, body, { title, extra = '' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${extra} role="img"${title ? ` aria-label="${title}"` : ''}>${title ? `<title>${title}</title>` : ''}${body}</svg>\n`
const path_ = (dd, fill, attrs = '') => `<path fill="${fill}" fill-rule="evenodd" d="${dd}"${attrs}/>`

// Full-colour mark: cream underlay (so separators read on dark grounds),
// then the colour layers bottom to top, then deep figure + horizon.
const markLayers = (opts = { underlay: true }) =>
  [
    opts.underlay ? path_(d.silhouette, P.cream) : '',
    path_(d['layer-teal'], P.teal),
    path_(d['layer-green'], P.green),
    path_(d['layer-green-light'], P['green-light']),
    path_(d['layer-green-dark'], P['green-dark']),
    path_(d['layer-ochre'], P.ochre),
    path_(d['layer-deep'], P.deep),
    path_(d.horizon, P.deep),
  ].join('')
const textLayers = (fill) => [1, 2, 3].map((i) => path_(d[`text-${i}`], fill)).join('')

const files = {}
const markBox = pad(parts.mark, 16)
const stackBox = pad(union(parts.mark, ...parts.text), 60)
const NAME = 'Ngina Trails &amp; Safaris, Diani Beach, Kenya'

files['logo-stacked.svg'] = svg(vb(stackBox), markLayers() + textLayers(P.deep), { title: NAME })
files['logo-stacked-cream.svg'] = svg(vb(stackBox), path_(d['mono-mark'], P.cream) + textLayers(P.cream), { title: NAME })
files['logo-stacked-deep.svg'] = svg(vb(stackBox), path_(d['mono-mark'], P.deep) + textLayers(P.deep), { title: NAME })
files['mark.svg'] = svg(vb(markBox), markLayers(), { title: 'Ngina Trails &amp; Safaris' })
files['mark-deep.svg'] = svg(vb(markBox), path_(d['mono-mark'], P.deep), { title: 'Ngina Trails &amp; Safaris' })
files['mark-cream.svg'] = svg(vb(markBox), path_(d['mono-mark'], P.cream), { title: 'Ngina Trails &amp; Safaris' })
files['mark-mono.svg'] = svg(vb(markBox), path_(d['mono-mark'], 'currentColor'), { title: 'Ngina Trails &amp; Safaris' })

// Horizontal lockup: mark left, three text lines right, scaled to the mark.
{
  const m = parts.mark
  const [t1, t2, t3] = parts.text
  const markH = m[3] - m[1]
  const gap = 90
  const textW = Math.max(t1[2] - t1[0], t2[2] - t2[0])
  // scale the text block so its height equals the mark height
  const blockH = t3[3] - t1[1]
  const s = markH / blockH
  const tx = m[2] + gap - t1[0] * s
  const ty = m[1] - t1[1] * s
  const width = m[2] - m[0] + gap + textW * s
  const box = pad([m[0], m[1], m[0] + width, m[3]], 40)
  const text = `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})">${textLayers(P.deep)}</g>`
  const textCream = `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})">${textLayers(P.cream)}</g>`
  files['logo-horizontal.svg'] = svg(vb(box), markLayers() + text, { title: NAME })
  files['logo-horizontal-cream.svg'] = svg(vb(box), path_(d['mono-mark'], P.cream) + textCream, { title: NAME })
}

// Wordmark only (all three lines), and single-line pieces.
files['wordmark.svg'] = svg(vb(pad(union(...parts.text), 10)), textLayers('currentColor'), { title: NAME })
files['wordmark-ngina.svg'] = svg(vb(pad(parts.text[0], 8)), path_(d['text-1'], 'currentColor'), { title: 'Ngina' })
files['location-line.svg'] = svg(vb(pad(parts.text[2], 6)), path_(d['text-3'], 'currentColor'), { title: 'Diani Beach, Kenya' })

// Parts
files['elephant-silhouette.svg'] = svg(vb(pad(parts.silhouette, 4)), path_(d.silhouette, 'currentColor'), { title: 'Elephant' })
files['elephant-outline.svg'] = svg(
  vb(pad(parts.silhouette, 14)),
  `<path fill="none" stroke="currentColor" stroke-width="10" stroke-linejoin="round" d="${d.silhouette}"/>`,
  { title: 'Elephant outline' },
)
files['lion.svg'] = svg(vb(pad(parts.lion, 4)), path_(d.lion, 'currentColor'), { title: 'Lion' })
files['acacia.svg'] = svg(vb(pad(parts.acacia, 4)), path_(d.acacia, 'currentColor'), { title: 'Acacia tree' })
files['horizon.svg'] = svg(vb(pad(parts.horizon, 2)), path_(d.horizon, 'currentColor'), {
  title: 'Horizon',
  extra: ' preserveAspectRatio="none"',
})

// App icon: full colour mark on a cream rounded square.
{
  const m = parts.mark
  const w = m[2] - m[0]
  const h = m[3] - m[1]
  const size = w * 1.12
  const ox = m[0] - (size - w) / 2
  const oy = m[1] - (size - h) / 2
  files['icon.svg'] = svg(
    `${ox.toFixed(0)} ${oy.toFixed(0)} ${size.toFixed(0)} ${size.toFixed(0)}`,
    `<rect x="${ox.toFixed(0)}" y="${oy.toFixed(0)}" width="${size.toFixed(0)}" height="${size.toFixed(0)}" rx="${(size * 0.18).toFixed(0)}" fill="${P.cream}"/>` +
      markLayers({ underlay: false }),
    { title: 'Ngina Trails &amp; Safaris' },
  )
}

await fs.mkdir(OUT, { recursive: true })
for (const [name, body] of Object.entries(files)) await fs.writeFile(path.join(OUT, name), body)

// Raw path data for React components (src/components/brand/paths.ts)
const ts = `// Generated by scripts/brand/trace.mjs from public/brand/ngina-logo.jpg. Do not edit.
/* eslint-disable */
export const brandPaths = ${JSON.stringify(
  {
    silhouette: { d: d.silhouette, box: pad(parts.silhouette, 4) },
    lion: { d: d.lion, box: pad(parts.lion, 4) },
    acacia: { d: d.acacia, box: pad(parts.acacia, 4) },
    horizon: { d: d.horizon, box: pad(parts.horizon, 2) },
  },
  null,
  0,
)} as const
`
await fs.mkdir('src/components/brand', { recursive: true })
await fs.writeFile('src/components/brand/paths.ts', ts)

// Raster icons for browsers / OS / social
const icon = Buffer.from(files['icon.svg'])
await fs.mkdir('src/app', { recursive: true })
const png = (size) => sharp(icon, { density: 300 }).resize(size, size).png().toBuffer()
await fs.writeFile('src/app/icon.png', await png(512))
await fs.writeFile('src/app/apple-icon.png', await png(180))
await fs.writeFile(`${OUT}/icon-192.png`, await png(192))
await fs.writeFile(`${OUT}/icon-512.png`, await png(512))
// maskable icon: mark on cream with safe-zone padding
{
  const inner = await sharp(icon, { density: 300 }).resize(360, 360).png().toBuffer()
  const mask = await sharp({ create: { width: 512, height: 512, channels: 4, background: P.cream } })
    .composite([{ input: inner, top: 76, left: 76 }]).png().toBuffer()
  await fs.writeFile(`${OUT}/icon-maskable-512.png`, mask)
}
// favicon.ico with embedded 32px + 16px PNGs
{
  const imgs = [await png(32), await png(16)]
  const header = Buffer.alloc(6 + 16 * imgs.length)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4)
  let offset = header.length
  imgs.forEach((b, i) => {
    const s = i === 0 ? 32 : 16
    const o = 6 + i * 16
    header.writeUInt8(s, o); header.writeUInt8(s, o + 1); header.writeUInt8(0, o + 2); header.writeUInt8(0, o + 3)
    header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6)
    header.writeUInt32LE(b.length, o + 8); header.writeUInt32LE(offset, o + 12)
    offset += b.length
  })
  await fs.writeFile('src/app/favicon.ico', Buffer.concat([header, ...imgs]))
}
// Static OG fallback (dynamic OG images are generated per page at runtime)
{
  const logo = await sharp(Buffer.from(files['logo-horizontal.svg']), { density: 200 }).resize({ width: 980 }).png().toBuffer()
  const og = await sharp({ create: { width: 1200, height: 630, channels: 4, background: P.cream } })
    .composite([{ input: logo, gravity: 'center' }]).png().toBuffer()
  await fs.writeFile(`${OUT}/og-default.png`, og)
}

const sizes = Object.entries(files).map(([n, b]) => `${n} ${(b.length / 1024).toFixed(1)}KB`)
console.log(sizes.join('\n'))
