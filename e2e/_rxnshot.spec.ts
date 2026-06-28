import { test, type Page } from '@playwright/test'

const SHOTS = 'playwright-shots'
test.use({ viewport: { width: 900, height: 1200 } })

async function stagePoint(page: Page, sx: number, sy: number) {
  const box = await page.locator('.mcanvas__svg').first().boundingBox()
  if (!box) throw new Error('no canvas')
  return { x: box.x + (sx / 320) * box.width, y: box.y + (sy / 220) * box.height }
}
async function dragArrow(page: Page, from: [number, number], to: [number, number]) {
  const a = await stagePoint(page, from[0], from[1])
  const b = await stagePoint(page, to[0], to[1])
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 6 })
  await page.mouse.move(b.x, b.y, { steps: 6 })
  await page.mouse.up()
  await page.waitForTimeout(250)
}
async function num(page: Page, value: string) {
  await page.getByLabel('Your answer').fill(value)
  await page.getByRole('button', { name: 'Check' }).click()
  await page.waitForTimeout(750)
}
async function choose(page: Page, name: string) {
  await page.getByRole('button', { name, exact: true }).click()
  await page.waitForTimeout(750)
}
async function slide(page: Page, nth: number, frac: number) {
  const box = await page.locator('.ratelab__track').nth(nth).boundingBox()
  if (!box) throw new Error('no track')
  const x = box.x + frac * box.width
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
  await page.waitForTimeout(300)
}

test('rxn-1 curved arrows: product renders on solve', async ({ page }) => {
  await page.goto('/lesson/rxn-1')
  await page.getByRole('button', { name: 'Start lesson' }).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/rxn1-s1-initial.png`, fullPage: true })
  await dragArrow(page, [124, 89], [204, 116]) // N lone pair → H⁺
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${SHOTS}/rxn1-s1-product.png`, fullPage: true })
})

test('rxn-3 SN1: ionize → attack → rate lab', async ({ page }) => {
  await page.goto('/lesson/rxn-3')
  await page.getByRole('button', { name: 'Start lesson' }).click()
  await page.waitForTimeout(400)
  await dragArrow(page, [197, 125], [245, 125]) // C–Br → Br
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/rxn3-s1-ionized.png`, fullPage: true })
  await choose(page, 'Trigonal planar')
  await num(page, '120')

  await page.waitForTimeout(400)
  await dragArrow(page, [58, 97], [170, 92]) // O lone pair → top face
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/rxn3-s2-attacked.png`, fullPage: true })
  await num(page, '2')
  await choose(page, 'A ~50:50 mix of both mirror images')

  await page.waitForTimeout(500)
  await slide(page, 0, 1) // substrate → 3°
  await slide(page, 1, 0.85) // nucleophile up
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${SHOTS}/rxn3-s3-ratelab.png`, fullPage: true })
})

test('rxn-5 E1: ionize → eliminate → zaitsev', async ({ page }) => {
  await page.goto('/lesson/rxn-5')
  await page.getByRole('button', { name: 'Start lesson' }).click()
  await page.waitForTimeout(400)
  await dragArrow(page, [197, 125], [245, 125])
  await page.waitForTimeout(700)
  await choose(page, 'SN1')

  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/rxn5-s2-before.png`, fullPage: true })
  await dragArrow(page, [52, 70], [102, 78]) // base → β-H
  await dragArrow(page, [102, 105], [133, 132]) // C–H bond → π
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/rxn5-s2-eliminated.png`, fullPage: true })
  await choose(page, 'Alkene (elimination)')
  await choose(page, 'Carbocation')

  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOTS}/rxn5-s3-zaitsev.png`, fullPage: true })
  await dragArrow(page, [160, 48], [100, 86]) // base → internal β-H
  await dragArrow(page, [100, 112], [130, 138]) // internal C–H → π
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${SHOTS}/rxn5-s3-after.png`, fullPage: true })
})
