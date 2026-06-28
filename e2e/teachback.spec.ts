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
  test('with the tutor offline, falls back to a written self-check against the rubric', async ({ page }) => {
    // The e2e build runs with Firebase disabled, so the AI proxy can't be
    // reached. The step becomes an authored self-check: write, then grade
    // against the rubric. It must not offer the AI chat or block the lesson.
    await seedAtIndex(page, 4) // lesson-1: index 4 is the teach-back step
    await page.goto('/lesson/lesson-1')

    await expect(page.getByText('Your turn to teach')).toBeVisible()
    // No AI chat input when the tutor can't run.
    await expect(page.getByPlaceholder(/teach the idea/i)).toHaveCount(0)

    // Rubric stays hidden until the learner writes their explanation.
    const check = page.getByRole('button', { name: /check against the rubric/i })
    await expect(check).toBeDisabled()
    await page.getByPlaceholder(/your own words/i).fill('You multiply the options at each step.')
    await check.click()

    await expect(page.getByText(/multiply the number of options/i)).toBeVisible()
    await page.screenshot({ path: 'playwright-shots/80-teach-selfcheck.png' })

    await page.getByRole('button', { name: /Continue to the check/ }).click()
    await expect(page.getByLabel('Your answer')).toBeVisible({ timeout: 6000 })
  })

  test('demo: the AI tutor toggle switches the teach-back step to the live tutor', async ({ page }) => {
    // Demo mode exposes an AI toggle on the course path. Flipping it on should
    // swap the authored self-check for the live tutor chat on the teach-back step.
    await page.addInitScript(() => localStorage.setItem('brilliantclone-demo', '1'))
    await seedAtIndex(page, 4) // lesson-1 teach-back step

    await page.goto('/course/counting')
    await page
      .getByRole('group', { name: 'Demo controls' })
      .getByRole('button', { name: 'on', exact: true })
      .click()

    await page.goto('/lesson/lesson-1')
    // The tutor chat is shown now, not the self-check.
    await expect(page.getByPlaceholder(/teach the idea/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /check against the rubric/i })).toHaveCount(0)
  })
})
