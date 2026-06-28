import { test, expect, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 880, height: 1200 } })

const LESSONS = ['rxn-1', 'rxn-2', 'rxn-3', 'rxn-4', 'rxn-5', 'rxn-6']

const RULES: { match: RegExp; kind: 'num' | 'choice'; value: string }[] = [
  { match: /curved arrows/i, kind: 'num', value: '2' },
  { match: /\(R\)-2-bromobutane/i, kind: 'choice', value: 'Inverted (S)' },
  { match: /double the nucleophile/i, kind: 'num', value: '1' },
  { match: /For E2 to occur/i, kind: 'choice', value: 'Anti-periplanar (~180°)' },
  { match: /Doubling the base/i, kind: 'num', value: '1' },
  { match: /bulky base/i, kind: 'choice', value: 'E2' },
  { match: /polar aprotic/i, kind: 'choice', value: 'SN2' },
]

async function seed(page: Page, meta?: { primedAt?: number; retestedAt?: number }) {
  await page.goto('/')
  await page.evaluate(
    ({ lessons, meta }) => {
      const now = new Date().toISOString()
      for (const id of lessons) {
        localStorage.setItem(
          `brilliantclone-progress-${id}`,
          JSON.stringify({ currentStepIndex: 0, stepAnswers: {}, mastered: true, completedAt: now, furthestStepIndex: 5 }),
        )
      }
      if (meta) {
        const stepAnswers: Record<string, string> = {}
        if (meta.primedAt) stepAnswers.primedAt = new Date(meta.primedAt).toISOString()
        if (meta.retestedAt) stepAnswers.retestedAt = new Date(meta.retestedAt).toISOString()
        localStorage.setItem(
          'brilliantclone-progress-reactions-test',
          JSON.stringify({ currentStepIndex: 0, stepAnswers, mastered: true, completedAt: now, furthestStepIndex: 0 }),
        )
      }
    },
    { lessons: LESSONS, meta },
  )
}

async function answerAll(page: Page) {
  await page.keyboard.press('Enter') // start
  await expect(page.locator('.ctest__prompt')).toBeVisible()
  for (let i = 0; i < RULES.length; i++) {
    const prompt = await page.locator('.ctest__prompt').innerText()
    const rule = RULES.find((r) => r.match.test(prompt))
    if (!rule) throw new Error(`no rule for: ${prompt}`)
    if (rule.kind === 'num') {
      await page.getByLabel('Your answer').fill(rule.value)
      await page.keyboard.press('Enter')
    } else {
      await page.getByRole('button', { name: rule.value, exact: true }).click()
    }
    await page.waitForTimeout(220)
    await page.keyboard.press('Enter') // advance
    await page.waitForTimeout(220)
  }
}

const DAY = 24 * 60 * 60 * 1000

test('priming reward + routes to all courses', async ({ page }) => {
  await seed(page) // lessons done, test available
  await page.goto('/course/reactions/test')
  await page.waitForTimeout(300)
  await answerAll(page)
  await expect(page.getByRole('heading', { name: 'Course primed!' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/reward-primed.png`, fullPage: true })
  await page.keyboard.press('Enter') // "See all courses"
  await expect(page).toHaveURL(/\/course$/)
})

test('reinforced reward is the bigger payoff', async ({ page }) => {
  await seed(page, { primedAt: Date.now() - 3 * DAY }) // retest unlocked
  await page.goto('/course/reactions/test')
  await page.waitForTimeout(300)
  await answerAll(page)
  await expect(page.getByRole('heading', { name: 'Locked in!' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/reward-reinforced.png`, fullPage: true })
})

test('hub shows primed / retest / reinforced states', async ({ page }) => {
  await seed(page, { primedAt: Date.now() })
  await page.goto('/course')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/hub-primed.png`, fullPage: true })

  await seed(page, { primedAt: Date.now() - 3 * DAY })
  await page.goto('/course')
  await page.waitForTimeout(400)
  await expect(page.getByRole('link', { name: /Retest ready/ })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/hub-retest.png`, fullPage: true })

  await seed(page, { primedAt: Date.now() - 5 * DAY, retestedAt: Date.now() })
  await page.goto('/course')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/hub-reinforced.png`, fullPage: true })
})
