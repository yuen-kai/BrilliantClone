import { test, expect } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 820, height: 1150 } })

test('reward screens have bold, visible animations', async ({ page }) => {
  await page.goto('/course/reactions/test?reward=primed')
  await expect(page.getByRole('heading', { name: 'Course primed!' })).toBeVisible()
  await expect(page.locator('.ctest__ring')).toHaveCount(3)
  await page.waitForTimeout(650)
  await page.screenshot({ path: `${SHOTS}/anim-primed.png`, fullPage: true })

  await page.goto('/course/reactions/test?reward=reinforced')
  await expect(page.getByRole('heading', { name: 'Locked in!' })).toBeVisible()
  await expect(page.locator('.ctest__confetti-piece')).toHaveCount(18)
  await page.waitForTimeout(650)
  await page.screenshot({ path: `${SHOTS}/anim-reinforced.png`, fullPage: true })
  await page.waitForTimeout(650)
  await page.screenshot({ path: `${SHOTS}/anim-reinforced-2.png`, fullPage: true })
})
