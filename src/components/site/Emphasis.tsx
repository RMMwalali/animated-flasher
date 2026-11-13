import { Fragment } from 'react'
import { Brush } from './Brush'

/**
 * Renders a statement with one emphasised word/phrase underlined by a drawn
 * brush stroke (burnt orange on light sections, ochre on dark).
 */
export function Emphasis({ text, emphasis, className = '' }: { text: string; emphasis?: string | null; className?: string }) {
  if (!emphasis) return <>{text}</>
  const i = text.toLowerCase().indexOf(emphasis.toLowerCase())
  if (i === -1) return <>{text}</>
  const before = text.slice(0, i)
  const word = text.slice(i, i + emphasis.length)
  const rest = text.slice(i + emphasis.length)
  // keep trailing punctuation attached so it never wraps onto its own line
  const punct = /^[.,;:!?…’'")\]]+/.exec(rest)?.[0] ?? ''
  const after = rest.slice(punct.length)
  return (
    <Fragment>
      {before}
      <span className="whitespace-nowrap">
        <em className={`relative inline-block italic ${className}`}>
          {word}
          <Brush seed={word} className="emphasis-brush absolute -bottom-[0.12em] left-[-2%] h-[0.28em] w-[104%]" />
        </em>
        {punct}
      </span>
      {after}
    </Fragment>
  )
}
