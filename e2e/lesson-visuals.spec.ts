import { test, expect, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'

async function answer(page: Page, value: string) {
  await page.getByLabel('Your answer').fill(value)
  await page.getByRole('button', { name: 'Check' }).click()
  await page.waitForTimeout(650)
}

test.describe('Lesson 4 & 5 visuals', () => {
  test('Casework builds two trees and combines them under a parent', async ({ page }) => {
    test.setTimeout(120000)
    await page.setViewportSize({ width: 1000, height: 1100 })
    await page.goto('/lesson/lesson-4')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    await expect(page.locator('.cwtrees')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/20-casework-empty.png` })

    await answer(page, '6') // burgers: 3 × 2
    await page.screenshot({ path: `${SHOTS}/21-casework-tree1.png` })
    await answer(page, '4') // soups
    await page.screenshot({ path: `${SHOTS}/22-casework-tree2.png` })

    await page.getByRole('button', { name: /combine the cases/i }).click()
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${SHOTS}/23-casework-combined.png` })

    await answer(page, '10') // total: 6 + 4
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/24-casework-done.png` })
  })

  test('Complementary shows the case tree with direct/complement toggle', async ({ page }) => {
    test.setTimeout(120000)
    await page.setViewportSize({ width: 1000, height: 1100 })
    await page.goto('/lesson/lesson-5')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // The complement tree is now the first step, so it shows immediately.
    await expect(page.locator('.ctree')).toBeVisible()
    await page.waitForTimeout(2000) // let the slow, heavy staggered "Add" weigh-in settle
    await page.screenshot({ path: `${SHOTS}/25-complement-direct.png` })

    await page.getByRole('button', { name: /use the complement/i }).click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SHOTS}/26-complement-complement.png` })

    // The visual shows per-branch counts but never the summed answer (255).
    await expect(page.locator('.ctree').getByText(/255/)).toHaveCount(0)
  })
})
