/** Tiny builder for Lexical rich-text JSON (used by sample content + seed). */
type Node = Record<string, unknown>

const text = (t: string, format = 0): Node => ({ type: 'text', text: t, format, detail: 0, mode: 'normal', style: '', version: 1 })
const el = (type: string, children: Node[], extra: Node = {}): Node => ({ type, children, direction: 'ltr', format: '', indent: 0, version: 1, ...extra })

export type RichBlock = string | { h2: string } | { h3: string } | { ul: string[] }

/** `**bold**` and `[link text](/path)` inside strings are supported. */
function inline(s: string): Node[] {
  return s
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('**')) return text(part.slice(2, -2), 1)
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
      if (link) return { ...el('link', [text(link[1]!)], { fields: { linkType: 'custom', url: link[2], newTab: false } }), version: 3 }
      return text(part)
    })
}

export function lexical(blocks: RichBlock[]) {
  const children = blocks.map((b) => {
    if (typeof b === 'string') return el('paragraph', inline(b), { textFormat: 0, textStyle: '' })
    if ('h2' in b) return el('heading', inline(b.h2), { tag: 'h2' })
    if ('h3' in b) return el('heading', inline(b.h3), { tag: 'h3' })
    return el('list', b.ul.map((li, i) => el('listitem', inline(li), { value: i + 1 })), { listType: 'bullet', start: 1, tag: 'ul' })
  })
  return { root: el('root', children) }
}

/** Plain text of a Lexical document (for llms.txt, excerpts, reading time). */
export function lexicalToText(doc: unknown): string {
  const out: string[] = []
  const walk = (n: any) => {
    if (!n) return
    if (n.type === 'text') out.push(n.text)
    if (Array.isArray(n.children)) {
      n.children.forEach(walk)
      if (['paragraph', 'heading', 'listitem'].includes(n.type)) out.push('\n')
    }
  }
  walk((doc as any)?.root)
  return out.join('').replace(/\n{3,}/g, '\n\n').trim()
}
