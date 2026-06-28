import { test, expect, type Page, type Locator } from '@playwright/test'

const SHOTS = 'playwright-shots'

/** Drag inside an SVG using STAGE (0..300) coordinates mapped onto its box. */
async function stageDrag(
  page: Page,
  svg: Locator,
  from: [number, number],
  to: [number, number],
  steps = 10,
) {
  const box = await svg.boundingBox()
  if (!box) throw new Error('no svg box')
  const px = (x: number) => box.x + (x / 300) * box.width
  const py = (y: number) => box.y + (y / 300) * box.height
  await page.mouse.move(px(from[0]), py(from[1]))
  await page.mouse.down()
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      px(from[0] + ((to[0] - from[0]) * i) / steps),
      py(from[1] + ((to[1] - from[1]) * i) / steps),
    )
    await page.waitForTimeout(28)
  }
  await page.mouse.up()
}

async function dragEls(page: Page, from: Locator, to: Locator) {
  const a = await from.boundingBox()
  const b = await to.boundingBox()
  if (!a || !b) throw new Error('missing drag element')
  const cx = (r: { x: number; width: number }) => r.x + r.width / 2
  const cy = (r: { y: number; height: number }) => r.y + r.height / 2
  await page.mouse.move(cx(a), cy(a))
  await page.mouse.down()
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(cx(a) + ((cx(b) - cx(a)) * i) / 6, cy(a) + ((cy(b) - cy(a)) * i) / 6)
    await page.waitForTimeout(35)
  }
  await page.mouse.up()
}

async function startLesson(page: Page, id: string) {
  await page.setViewportSize({ width: 900, height: 1250 })
  await page.goto(`/lesson/${id}`)
  await page.getByRole('button', { name: 'Start lesson' }).click()
  await page.waitForTimeout(350)
}

const answerNum = async (page: Page, v: string) => {
  await page.getByLabel('Your answer').fill(v)
  await page.getByRole('button', { name: 'Check' }).click()
  await page.waitForTimeout(650)
}

test.describe('Substitution & Elimination course', () => {
  test('oc-1 Curved Arrows: drag arrows through to mastery', async ({ page }) => {
    test.setTimeout(120000)
    await startLesson(page, 'oc-1')

    // scene 1 — one arrow: lone pair → carbon
    await dragEls(page, page.locator('.ap__tail').first(), page.locator('.ap__head').first())
    await page.waitForTimeout(800)
    await expect(page.locator('.orgo-step__gate')).toBeVisible()
    await page.getByRole('button', { name: 'HO⁻' }).click()
    await page.waitForTimeout(650)
    await answerNum(page, '2')

    // scene 2 — two arrows: form O–C, break C–Br
    const liveTails = page.locator('.ap__tail:not(.is-used)')
    const heads = page.locator('.ap__head')
    await dragEls(page, liveTails.first(), heads.nth(0))
    await page.waitForTimeout(300)
    await dragEls(page, liveTails.first(), heads.nth(1))
    await page.waitForTimeout(800)
    await answerNum(page, '2')
    await page.getByRole('button', { name: 'Br⁻' }).click()
    await page.waitForTimeout(650)

    // rule → teach-back (AI off in e2e) → cold problem
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Continue to the check/ }).click()
    await page.waitForTimeout(300)
    await answerNum(page, '2')

    await expect(page.getByText('Lesson mastered')).toBeVisible({ timeout: 5000 })
  })

  test('oc-2 SN2: backside attack inverts the centre', async ({ page }) => {
    test.setTimeout(90000)
    await startLesson(page, 'oc-2')
    const svg = page.locator('.bsa__svg')
    await stageDrag(page, svg, [150, 262], [72, 150], 12)
    await page.waitForTimeout(1100)
    await expect(page.locator('.bsa.is-solved')).toBeVisible()
    await expect(page.locator('.orgo-step__gate')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/oc2-final.png` })
  })

  test('oc-3 SN1: ionize then attack a face', async ({ page }) => {
    test.setTimeout(90000)
    await startLesson(page, 'oc-3')
    const svg = page.locator('.cf__svg')
    await stageDrag(page, svg, [150, 56], [150, 14], 8)
    await page.waitForTimeout(800)
    await stageDrag(page, svg, [40, 150], [150, 98], 10)
    await page.waitForTimeout(900)
    await expect(page.locator('.cf__ratio')).toBeVisible()
    await expect(page.locator('.orgo-step__gate')).toBeVisible()
  })

  test('oc-4 E2: rotate to anti-periplanar and eliminate', async ({ page }) => {
    test.setTimeout(90000)
    await startLesson(page, 'oc-4')
    const svg = page.locator('.nd__svg')
    await stageDrag(page, svg, [230, 150], [110, 219], 14)
    await page.waitForTimeout(300)
    await expect(page.locator('.nd__meter.is-anti')).toBeVisible()
    await page.locator('.nd__base').click({ force: true })
    await page.waitForTimeout(1300)
    await expect(page.locator('.orgo-step__gate')).toBeVisible()
  })

  test('oc-5 E1: ionize then pluck a β-hydrogen (Zaitsev)', async ({ page }) => {
    test.setTimeout(90000)
    await startLesson(page, 'oc-5')
    const svg = page.locator('.e1__svg')
    await stageDrag(page, svg, [150, 54], [150, 12], 8)
    await page.waitForTimeout(800)
    // the terminal β-H sits up-left of centre (≈ 81,50)
    await stageDrag(page, svg, [58, 250], [81, 50], 12)
    await page.waitForTimeout(1100)
    await expect(page.locator('.e1__bars')).toBeVisible()
    await expect(page.locator('.orgo-step__gate')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/oc5-final.png` })
  })

  test('the course is listed and its path shows all six lessons', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 1400 })
    await page.goto('/')
    const card = page.locator('a[href="/course/orgo"]')
    await expect(card).toBeVisible()
    await expect(card).toContainText('Substitution & Elimination')
    await page.screenshot({ path: `${SHOTS}/oc-landing.png` })

    await page.goto('/course/orgo')
    await expect(page.getByText('Curved Arrows: Nucleophiles & Electrophiles')).toBeVisible()
    await expect(page.getByText('SN2: Backside Attack & Inversion')).toBeVisible()
    await expect(page.getByText('Choosing the Pathway')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/oc-coursepath.png`, fullPage: true })
  })

  test('oc-6 Choosing the Pathway: the prediction map moves', async ({ page }) => {
    test.setTimeout(90000)
    await startLesson(page, 'oc-6')
    // 3° + bulky base + heat → E2
    await page.getByRole('button', { name: '3°', exact: true }).click()
    await page.getByRole('button', { name: /t-BuOK/ }).click()
    await page.getByRole('button', { name: /heat/ }).click()
    await expect(page.locator('.pc__cell--major')).toContainText('E2')
    // surface two more distinct mechanisms to finish exploring
    await page.getByRole('button', { name: 'methyl', exact: true }).click()
    await page.getByRole('button', { name: /I⁻/ }).click()
    await page.getByRole('button', { name: '2°', exact: true }).click()
    await page.getByRole('button', { name: /H₂O/ }).click()
    await page.waitForTimeout(800)
    await expect(page.locator('.orgo-step__gate')).toBeVisible()
  })
})
