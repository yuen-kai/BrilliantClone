import { describe, expect, it, vi } from 'vitest'
import { googleSignInWithFallback, isBenignPopupClosure } from './googleAuth'

describe('googleSignInWithFallback', () => {
  it('uses popup when it succeeds and does not redirect', async () => {
    const popup = vi.fn().mockResolvedValue({ user: {} })
    const redirect = vi.fn().mockResolvedValue(undefined)

    await googleSignInWithFallback(popup, redirect)

    expect(popup).toHaveBeenCalledOnce()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('falls back to redirect only when the popup truly cannot open', async () => {
    for (const code of ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment']) {
      const popup = vi.fn().mockRejectedValue({ code })
      const redirect = vi.fn().mockResolvedValue(undefined)
      await googleSignInWithFallback(popup, redirect)
      expect(redirect).toHaveBeenCalledOnce()
    }
  })

  it('does NOT redirect when the user closes or cancels the popup', async () => {
    // Redirecting here hijacks the window and lands in a broken flow on localhost.
    for (const code of ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']) {
      const popup = vi.fn().mockRejectedValue({ code })
      const redirect = vi.fn().mockResolvedValue(undefined)
      await expect(googleSignInWithFallback(popup, redirect)).rejects.toMatchObject({ code })
      expect(redirect).not.toHaveBeenCalled()
    }
  })

  it('rethrows non-popup errors without redirecting', async () => {
    const popup = vi.fn().mockRejectedValue({ code: 'auth/network-request-failed' })
    const redirect = vi.fn().mockResolvedValue(undefined)

    await expect(googleSignInWithFallback(popup, redirect)).rejects.toMatchObject({
      code: 'auth/network-request-failed',
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('flags benign popup closures so the UI can stay quiet', () => {
    expect(isBenignPopupClosure({ code: 'auth/popup-closed-by-user' })).toBe(true)
    expect(isBenignPopupClosure({ code: 'auth/cancelled-popup-request' })).toBe(true)
    expect(isBenignPopupClosure({ code: 'auth/popup-blocked' })).toBe(false)
    expect(isBenignPopupClosure(null)).toBe(false)
  })
})
