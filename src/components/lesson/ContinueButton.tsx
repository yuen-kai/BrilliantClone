import type { ReactNode } from 'react'
import { useEnterKey } from '../../hooks/useEnterKey'

/**
 * The standard "advance" button — Continue / Next / Start / Retake / etc.
 *
 * Use this for ANY button that moves the learner forward. It binds the Enter key
 * to its action (via useEnterKey, which already ignores Enter inside text fields
 * and prevents a double-fire), so keyboard users can always press Enter to
 * advance — without each call site remembering to wire it up.
 *
 * Only render one of these at a time per screen (the usual case). If two could be
 * visible at once, set `enabled={false}` on the non-primary one.
 */
export function ContinueButton({
  onClick,
  children,
  className,
  enabled = true,
  autoFocus,
}: {
  onClick: () => void
  children: ReactNode
  className?: string
  /** Bind Enter to this button (default true). */
  enabled?: boolean
  autoFocus?: boolean
}) {
  useEnterKey(onClick, enabled)
  return (
    <button type="button" className={className} onClick={onClick} autoFocus={autoFocus}>
      {children}
    </button>
  )
}
