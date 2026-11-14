import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { createElement } from 'react'

/**
 * Rich text from the CMS with the site's reading styles. Pass `anchors`
 * (from headingAnchors) to give h2/h3 headings ids for a table of contents.
 */
export function Prose({ data, className = '', anchors }: { data: unknown; className?: string; anchors?: WeakMap<object, string> }) {
  if (!data || typeof data !== 'object' || !('root' in (data as object))) return null
  const converters: JSXConvertersFunction | undefined = anchors
    ? ({ defaultConverters }) => ({
        ...defaultConverters,
        heading: ({ node, nodesToJSX }) => {
          const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2'
          const id = anchors.get(node as object)
          return createElement(tag, id ? { id, className: 'scroll-mt-28' } : {}, nodesToJSX({ nodes: node.children }))
        },
      })
    : undefined
  return (
    <div className={`prose-ngina ${className}`}>
      <RichText data={data as SerializedEditorState} converters={converters} />
    </div>
  )
}
