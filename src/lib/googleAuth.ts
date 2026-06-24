// Popups genuinely can't open in these environments, so a full-page redirect is
// the only way through (browser-level popup blocker, or an in-app webview).
const REDIRECT_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
])

// User dismissed the popup, double-clicked, or a Cross-Origin-Opener-Policy
// quirk made a successful popup *look* closed. None of these should trigger a
// redirect: doing so hijacks the main window and, on split-domain hosts like
// localhost, drops the user into a broken getRedirectResult flow. Let them retry.
const BENIGN_POPUP_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
])

export function isBenignPopupClosure(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code
  return code !== undefined && BENIGN_POPUP_CODES.has(code)
}

/**
 * Run the Google popup sign-in, falling back to a full-page redirect only when
 * the browser can't show a popup at all. Benign closures and other errors
 * propagate to the caller (auth state still updates if sign-in actually went
 * through, so the UI can recover on its own).
 */
export async function googleSignInWithFallback(
  runPopup: () => Promise<unknown>,
  runRedirect: () => Promise<void>,
): Promise<void> {
  try {
    await runPopup()
  } catch (err) {
    const code = (err as { code?: string } | null)?.code
    if (code && REDIRECT_FALLBACK_CODES.has(code)) {
      await runRedirect()
      return
    }
    throw err
  }
}
