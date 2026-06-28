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

test.describe('Enter advances continue/next buttons', () => {
  test('Enter starts the lesson from the start screen', async ({ page }) => {
    await page.goto('/lesson/lesson-1')
    await expect(page.getByRole('button', { name: 'Start lesson' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Step 1 of 6')).toBeVisible()
  })

  test('Enter advances the rule step’s Continue button', async ({ page }) => {
    await seedAtIndex(page, 3) // lesson-1 index 3 is the rule-statement step
    await page.goto('/lesson/lesson-1')
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await page.keyboard.press('Enter')
    // Advances to the next step (teach-back).
    await expect(page.getByText('Your turn to teach')).toBeVisible()
  })

  test('Enter goes to the next lesson from the completion screen', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'brilliantclone-progress-lesson-1',
        JSON.stringify({
          currentStepIndex: 6, // past the last step of lesson-1
          stepAnswers: {},
          mastered: true,
          completedAt: new Date().toISOString(),
          furthestStepIndex: 5,
        }),
      )
    })
    await page.goto('/lesson/lesson-1')
    await expect(page.getByRole('link', { name: 'Next lesson' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Counting Strategies' })).toBeVisible()
  })
})
