import { test, expect } from '@playwright/test'

test.describe('New lessons (2–6)', () => {
  test('lesson 2 slot picker places a racer and advances to the next medal', async ({ page }) => {
    await page.goto('/lesson/lesson-2')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // Gold: 4 racers available. After the spin animation, Silver should be asked.
    await page.getByLabel(/available for Gold/i).fill('4')
    await page.getByRole('button', { name: 'Check' }).click()

    await expect(page.getByLabel(/available for Silver/i)).toBeVisible({ timeout: 6000 })
  })

  test('guided-solve gates each blank and shows feedback on a wrong answer', async ({ page }) => {
    await page.goto('/lesson/lesson-6')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // First blank: number of stars (4). A wrong answer must not advance.
    await page.getByLabel('Your answer').fill('9')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/one star per cookie/i)).toBeVisible()
    await expect(page.getByText(/how many dividers/i)).toHaveCount(0)

    // Correct answer reveals the next blank (bars).
    await page.getByLabel('Your answer').fill('4')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/how many dividers/i)).toBeVisible()
  })
})
