import { test } from '@playwright/test'

test.use({ viewport: { width: 1280, height: 900 } })

test('c1 l1 start', async ({ page }) => {
  await page.goto('/lesson/lesson-1')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'playwright-shots/c1-l1-start.png' })
})

test('c1 l1 step', async ({ page }) => {
  await page.goto('/lesson/lesson-1')
  await page.getByRole('button', { name: 'Start lesson' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'playwright-shots/c1-l1-step.png', fullPage: true })
})
