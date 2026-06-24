import { test, expect } from '@playwright/test'

test.describe('Lesson 1 flow', () => {
  test('loads course path and starts lesson on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Counting Strategies' })).toBeVisible()
    await expect(page.getByText('Multiplication Principle')).toBeVisible()

    await page.locator('a[href="/lesson/lesson-1"]').click()
    await expect(page.getByRole('button', { name: 'Start lesson' })).toBeVisible()
  })

  test('tree interaction responds to split button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/lesson/lesson-1')

    await page.getByRole('button', { name: 'Start lesson' }).click()
    await page.getByRole('button', { name: /split first choice/i }).click()

    await expect(page.getByLabel('Decision tree')).toBeVisible()
    await expect(page.getByLabel('How many nodes at this level?')).toBeVisible()
  })

  test('wrong final answer shows specific feedback for addition mistake', async ({ page }) => {
    test.setTimeout(120000)
    await page.goto('/lesson/lesson-1')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // Step 1: split 3 times and answer gates
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /split|Next/i }).click()
      const expected = [2, 6, 12][i]!
      await page.getByLabel('How many nodes at this level?').fill(String(expected))
      await page.getByRole('button', { name: 'Check' }).click()
      await page.waitForTimeout(700)
    }

    await page.getByLabel('How many total sandwiches').fill('7')
    await page.getByRole('button', { name: 'Check' }).click()

    await expect(page.getByText(/added 2 \+ 3 \+ 2/i)).toBeVisible()
  })
})
