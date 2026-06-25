import { test, expect, type Page, type Locator } from '@playwright/test'

const SHOTS = 'playwright-shots'

async function center(loc: Locator) {
  const b = await loc.boundingBox()
  if (!b) throw new Error('no bounding box')
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, box: b }
}

// Press on `from`, glide toward `to` in steps, screenshot mid-way (before
// release) to inspect the drop affordance, then drop.
async function dragWithMidShot(
  page: Page,
  from: Locator,
  toPoint: { x: number; y: number },
  midShot?: string,
) {
  const a = await center(from)
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  const steps = 16
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(a.x + (toPoint.x - a.x) * (i / steps), a.y + (toPoint.y - a.y) * (i / steps))
    if (midShot && i === Math.floor(steps / 2)) {
      await page.screenshot({ path: `${SHOTS}/${midShot}` })
    }
  }
  await page.mouse.up()
}

async function answer(page: Page, value: string) {
  await page.getByLabel('Your answer').fill(value)
  await page.getByRole('button', { name: 'Check' }).click()
  // Gate advance / step transition runs on a ~550ms timer; let it settle.
  await page.waitForTimeout(750)
}

test.describe('Lesson 3 — discovery widgets UX', () => {
  test('walks all three widgets with progressive disclosure', async ({ page }) => {
    test.setTimeout(120000)
    await page.setViewportSize({ width: 900, height: 1000 })
    await page.goto('/lesson/lesson-3')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // ---------- Step 1: handshakes ----------
    // Progressive disclosure: the widget is hidden until "ignoring repeats" is answered.
    await expect(page.locator('.handshake')).toHaveCount(0)
    await page.screenshot({ path: `${SHOTS}/01-handshake-gate-first.png` })

    await answer(page, '12') // ignoring repeats: 4 × 3
    await expect(page.locator('.handshake__stage')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/02-handshake-revealed.png` })

    // Drag between two friends; mid-drag shows the rubber-band line + drop target.
    const nodes = page.locator('.handshake__node')
    const target = await center(nodes.nth(2))
    await dragWithMidShot(page, nodes.nth(0), target, '03-handshake-middrag.png')
    await expect(page.locator('.handshake__edge')).toHaveCount(1)
    await page.screenshot({ path: `${SHOTS}/04-handshake-connected.png` })

    await answer(page, '6') // considering repeats: 12 ÷ 2

    // ---------- Step 2: round table ----------
    await expect(page.getByText(/round table/i)).toBeVisible()
    await answer(page, '120') // ignoring repeats: 5!
    await expect(page.locator('.round-table__stage')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/05-table-revealed.png` })

    const persons = page.locator('.round-table__person')
    const seatTarget = await center(persons.nth(2))
    await dragWithMidShot(page, persons.nth(0), seatTarget, '06-table-middrag.png')
    await page.getByRole('button', { name: 'Rotate one seat' }).click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${SHOTS}/07-table-rotated.png` })

    await answer(page, '24') // considering repeats: 120 ÷ 5

    // ---------- Step 3: letters ----------
    await expect(page.getByText(/rearrange too/i)).toBeVisible()
    await answer(page, '6') // ignoring repeats: 3!
    await expect(page.locator('.anagram__tiles')).toBeVisible()
    const before = (await page.locator('.anagram-tile').allInnerTexts()).join('')
    await page.screenshot({ path: `${SHOTS}/08-word-revealed.png` })

    // Drag the first tile past the end — exercises drop-at-end.
    const tiles = page.locator('.anagram-tile')
    const last = await center(tiles.last())
    await dragWithMidShot(
      page,
      tiles.first(),
      { x: last.box.x + last.box.width + 12, y: last.y },
      '09-word-middrag.png',
    )
    await page.waitForTimeout(500)
    const after = (await page.locator('.anagram-tile').allInnerTexts()).join('')
    await page.screenshot({ path: `${SHOTS}/10-word-reordered.png` })
    expect(after).not.toBe(before) // the tile actually moved

    await answer(page, '3') // considering repeats: 6 ÷ 2

    // ---------- Reached the rule step ----------
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${SHOTS}/11-after-lesson.png` })
  })
})
