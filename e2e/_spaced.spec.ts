import { test, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 820, height: 1150 } })

const LESSONS = ['rxn-1', 'rxn-2', 'rxn-3', 'rxn-4', 'rxn-5', 'rxn-6']

async function seed(page: Page, primedAtMs: number) {
  await page.goto('/')
  await page.evaluate(
    ({ lessons, primedAt }) => {
      const now = new Date().toISOString()
      for (const id of lessons) {
        localStorage.setItem(
          `brilliantclone-progress-${id}`,
          JSON.stringify({ currentStepIndex: 0, stepAnswers: {}, mastered: true, completedAt: now, furthestStepIndex: 5 }),
        )
      }
      localStorage.setItem(
        'brilliantclone-progress-reactions-test',
        JSON.stringify({
          currentStepIndex: 0,
          stepAnswers: { primedAt: new Date(primedAt).toISOString() },
          mastered: true,
          completedAt: new Date(primedAt).toISOString(),
          furthestStepIndex: 0,
        }),
      )
    },
    { lessons: LESSONS, primedAt: primedAtMs },
  )
}

test('primed: course path + test page show the 2-day cooldown', async ({ page }) => {
  await seed(page, Date.now()) // just primed → ~2 days remaining
  await page.goto('/course/reactions')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/spaced-primed-path.png`, fullPage: true })
  await page.goto('/course/reactions/test')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/spaced-primed-page.png`, fullPage: true })
})

test('retest ready: after 2 days the retest unlocks', async ({ page }) => {
  await seed(page, Date.now() - 3 * 24 * 60 * 60 * 1000) // primed 3 days ago
  await page.goto('/course/reactions')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/spaced-retest-path.png`, fullPage: true })
  await page.goto('/course/reactions/test')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/spaced-retest-page.png`, fullPage: true })
})
