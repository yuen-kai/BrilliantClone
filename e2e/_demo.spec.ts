import { test, expect } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 760, height: 1150 } })

test('demo switcher is demo-only and plays the reward animations', async ({ page }) => {
  // Not in demo → no switcher.
  await page.goto('/course/reactions')
  await page.waitForTimeout(300)
  await expect(page.locator('.course-path__demo')).toHaveCount(0)

  // Enter demo → switcher appears.
  await page.evaluate(() => localStorage.setItem('brilliantclone-demo', '1'))
  await page.goto('/course/reactions')
  await page.waitForTimeout(400)
  await expect(page.locator('.course-path__demo')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/demo-switcher.png`, fullPage: true })

  // Completion → deep-links into the reinforced reward animation.
  await page.getByRole('button', { name: 'completion', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Locked in!' })).toBeVisible()
  await expect(page).toHaveURL(/reward=reinforced/)
  await page.screenshot({ path: `${SHOTS}/demo-reward-reinforced.png`, fullPage: true })

  // State persisted: back on the course, the test node is reinforced.
  await page.goto('/course/reactions')
  await page.waitForTimeout(400)
  await expect(page.getByText('Reinforced', { exact: true })).toBeVisible()

  // Primed → deep-links into the priming reward animation.
  await page.getByRole('button', { name: 'primed', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Course primed!' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/demo-reward-primed.png`, fullPage: true })
})
