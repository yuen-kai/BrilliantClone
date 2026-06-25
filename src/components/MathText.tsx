import katex from 'katex'
import { exprToLatex } from '../lib/mathExpr'
import './MathText.css'

type MathTextProps = {
  /** A LaTeX string (MathText) or our plain notation (Expr). */
  children: string
  display?: boolean
  className?: string
}

/** Renders a LaTeX string with KaTeX. Inherits surrounding text color. */
export function MathText({ children, display = false, className }: MathTextProps) {
  const html = katex.renderToString(children, { throwOnError: false, displayMode: display })
  return (
    <span
      className={className ? `math-text ${className}` : 'math-text'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** Like MathText, but accepts our plain notation (e.g. "C(6,2) = 15"). */
export function Expr({ children, display, className }: MathTextProps) {
  return (
    <MathText display={display} className={className}>
      {exprToLatex(children)}
    </MathText>
  )
}
