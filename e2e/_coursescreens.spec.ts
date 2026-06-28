import { test, expect, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 1100, height: 1500 } })

async function shot(page: Page, path: string, name: string) {
  await page.goto(path)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true })
}

test('course screens render for all three courses', async ({ page }) => {
  await shot(page, '/', 'cs-landing')
  await shot(page, '/course', 'cs-hub')
  await shot(page, '/course/counting', 'cs-counting')
  await shot(page, '/course/reactions', 'cs-reactions')
  await shot(page, '/course/orgo', 'cs-orgo')
})

test('All courses link returns from a course to the hub', async ({ page }) => {
  await page.goto('/course/reactions')
  await page.waitForTimeout(400)
  await page.getByRole('link', { name: '← All courses' }).click()
  await expect(page).toHaveURL(/\/course$/)
  await expect(page.getByRole('heading', { name: 'Choose a course' })).toBeVisible()
})
