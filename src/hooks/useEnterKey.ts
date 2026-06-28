import { useEffect, useRef } from 'react'

/**
 * Fire `onEnter` when the user presses Enter while `enabled` — used to make a
 * visible "Continue"/"Next" button keyboard-activatable regardless of where
 * focus is. Enter inside a text field (answer inputs, the teach-back textarea)
 * is left alone so those keep their own submit behavior. preventDefault stops a
 * focused button from also firing its native click, so the action runs once.
 *
 * The handler is read through a ref, so the window listener is attached once per
 * `enabled` change rather than re-bound on every render.
 */
export function useEnterKey(onEnter: () => void, enabled = true) {
  const onEnterRef = useRef(onEnter)
  onEnterRef.current = onEnter

  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) {
        return
      }
      const el = document.activeElement as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return
      e.preventDefault()
      onEnterRef.current()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled])
}
