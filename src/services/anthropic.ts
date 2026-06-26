import Anthropic from '@anthropic-ai/sdk'

/**
 * Anthropic (Claude) wiring for the teach-back tutor.
 *
 * NOTE: this calls the Anthropic API directly from the browser, so the key ships
 * in the client bundle. That's fine for local/dev with a throwaway key; for
 * production, proxy these calls through a backend instead. Without a key the
 * feature reports itself as unavailable — it never fabricates responses.
 */
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

/** Defaults to Claude Opus 4.8; override with the exact slug your key can use. */
export const ANTHROPIC_MODEL =
  (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined) ?? 'claude-opus-4-8'

export const isAiConfigured = Boolean(API_KEY)

let client: Anthropic | null = null

export function getAnthropic(): Anthropic | null {
  if (!API_KEY) return null
  if (!client) {
    client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true })
  }
  return client
}
