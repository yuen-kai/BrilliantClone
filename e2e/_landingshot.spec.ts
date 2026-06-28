import { test } from '@playwright/test'

test.use({ viewport: { width: 1100, height: 1400 } })

test('landing renders the course selector', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'playwright-shots/landing.png', fullPage: true })
})
