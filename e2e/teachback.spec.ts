import { test, expect, type Page } from '@playwright/test'

async function seedAtIndex(page: Page, index: number) {
  await page.addInitScript(
    (i) => {
      localStorage.setItem(
        'brilliantclone-progress-lesson-1',
        JSON.stringify({
          currentStepIndex: i,
          stepAnswers: {},
          mastered: null,
          completedAt: null,
          furthestStepIndex: i,
        }),
      )
    },
    index,
  )
}

test.describe('teach-back step', () => {
  test('without an AI key, says it is unavailable and lets the learner continue', async ({ page }) => {
    // The preview build has no VITE_ANTHROPIC_API_KEY, so the tutor can't run —
    // it must say so plainly (no fabricated responses) and not block the lesson.
    await seedAtIndex(page, 4) // lesson-1: index 4 is the teach-back step
    await page.goto('/lesson/lesson-1')

    await expect(page.getByText('Your turn to teach')).toBeVisible()
    await expect(page.getByText(/needs an Anthropic API key/i)).toBeVisible()
    // No chat input is offered when the tutor can't run.
    await expect(page.getByPlaceholder(/teach the idea/i)).toHaveCount(0)
    await page.screenshot({ path: 'playwright-shots/80-teach-unavailable.png' })

    await page.getByRole('button', { name: /Continue to the check/ }).click()
    await expect(page.getByLabel('Your answer')).toBeVisible({ timeout: 6000 })
  })
})
