import { test, expect, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 820, height: 1150 } })

// Answer by reading the visible prompt, so the test is robust to the shuffle.
const RULES: { match: RegExp; kind: 'num' | 'choice'; value: string }[] = [
  { match: /curved arrows/i, kind: 'num', value: '2' },
  { match: /\(R\)-2-bromobutane/i, kind: 'choice', value: 'Inverted (S)' },
  { match: /double the nucleophile/i, kind: 'num', value: '1' },
  { match: /For E2 to occur/i, kind: 'choice', value: 'Anti-periplanar (~180°)' },
  { match: /Doubling the base/i, kind: 'num', value: '1' },
  { match: /bulky base/i, kind: 'choice', value: 'E2' },
  { match: /polar aprotic/i, kind: 'choice', value: 'SN2' },
]

const LESSONS = ['rxn-1', 'rxn-2', 'rxn-3', 'rxn-4', 'rxn-5', 'rxn-6']
async function seedMastered(page: Page) {
  await page.goto('/')
  await page.evaluate((lessons) => {
    const now = new Date().toISOString()
    for (const id of lessons) {
      localStorage.setItem(
        `brilliantclone-progress-${id}`,
        JSON.stringify({ currentStepIndex: 0, stepAnswers: {}, mastered: true, completedAt: now, furthestStepIndex: 5 }),
      )
    }
  }, LESSONS)
}

async function answerCurrent(page: Page) {
  const prompt = await page.locator('.ctest__prompt').innerText()
  const rule = RULES.find((r) => r.match.test(prompt))
  if (!rule) throw new Error(`No answer rule for prompt: ${prompt}`)
  if (rule.kind === 'num') {
    await page.getByLabel('Your answer').fill(rule.value)
    await page.keyboard.press('Enter') // submit the numeric answer with Enter
  } else {
    await page.getByRole('button', { name: rule.value, exact: true }).click()
  }
  await page.waitForTimeout(250)
  await page.keyboard.press('Enter') // advance (Next / See results) with Enter
  await page.waitForTimeout(250)
}

test('reactions course test: shuffled mix, no topic shown, pass', async ({ page }) => {
  await seedMastered(page)
  await page.goto('/course/reactions/test')
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}/ctest-intro.png`, fullPage: true })

  // Start the test with the Enter key (no click).
  await page.keyboard.press('Enter')
  await expect(page.locator('.ctest__prompt')).toBeVisible()
  // No topic tag should ever appear.
  await expect(page.locator('.ctest__qtag')).toHaveCount(0)
  await page.screenshot({ path: `${SHOTS}/ctest-q1.png`, fullPage: true })

  for (let i = 0; i < 7; i++) await answerCurrent(page)

  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}/ctest-result.png`, fullPage: true })
})

test('course path shows the test node once lessons are mastered', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const now = new Date().toISOString()
    for (const id of ['rxn-1', 'rxn-2', 'rxn-3', 'rxn-4', 'rxn-5', 'rxn-6']) {
      localStorage.setItem(
        `brilliantclone-progress-${id}`,
        JSON.stringify({ currentStepIndex: 0, stepAnswers: {}, mastered: true, completedAt: now, furthestStepIndex: 5 }),
      )
    }
  })
  await page.goto('/course/reactions')
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/ctest-path-node.png`, fullPage: true })
})
