import { test, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 900, height: 1300 } })

async function start(page: Page, id: string) {
  await page.goto(`/lesson/${id}`)
  await page.getByRole('button', { name: 'Start lesson' }).click()
  await page.waitForTimeout(500)
}

test('rxn-2 SN2 ReactionStage', async ({ page }) => {
  await start(page, 'rxn-2')
  await page.screenshot({ path: `${SHOTS}/rxn2-s1-initial.png`, fullPage: true })
  // Drag the nucleophile (≈176,250 in a 340×280 stage) into the backside lobe (west of C).
  const box = await page.locator('.rxn__svg').first().boundingBox()
  if (box) {
    const sp = (sx: number, sy: number) => ({ x: box.x + (sx / 340) * box.width, y: box.y + (sy / 280) * box.height })
    const a = sp(176, 250)
    const b = sp(110, 132)
    await page.mouse.move(a.x, a.y)
    await page.mouse.down()
    await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 8 })
    await page.mouse.move(b.x, b.y, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(1200)
  }
  await page.screenshot({ path: `${SHOTS}/rxn2-s1-inverted.png`, fullPage: true })
})

test('rxn-4 E2 NewmanEliminate', async ({ page }) => {
  await start(page, 'rxn-4')
  await page.screenshot({ path: `${SHOTS}/rxn4-s1-initial.png`, fullPage: true })
  // Press React without aligning → should show the "keep rotating" nudge (affordance check).
  await page.getByRole('button', { name: /React with/i }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOTS}/rxn4-s1-reject.png`, fullPage: true })
})

test('rxn-6 ReactionConsole', async ({ page }) => {
  await start(page, 'rxn-6')
  await page.screenshot({ path: `${SHOTS}/rxn6-s1-initial.png`, fullPage: true })
  // Step 1 has only the substrate dial; pick 1° → console completes → gates appear.
  await page.getByRole('button', { name: '1°', exact: true }).click()
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${SHOTS}/rxn6-s1-set.png`, fullPage: true })
})
