import { test, expect } from '@playwright/test'

const SHOTS = 'playwright-shots'

test.describe('New lessons (2–6)', () => {
  test('lesson 2 slot picker places a racer and advances to the next medal', async ({ page }) => {
    await page.goto('/lesson/lesson-2')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // Gold: 4 racers available. After the spin animation, Silver should be asked.
    await page.getByLabel(/available for Gold/i).fill('4')
    await page.getByRole('button', { name: 'Check' }).click()

    await expect(page.getByLabel(/available for Silver/i)).toBeVisible({ timeout: 6000 })
  })

  test('stars-and-bars solves a whole problem on one screen', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/lesson/lesson-6')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    const answer = async (value: string) => {
      await page.getByLabel('Your answer').fill(value)
      await page.getByRole('button', { name: 'Check' }).click()
    }

    // Step 1 GIVES the slots: there's no "Slots" input, just a Next button. The
    // live sharing already reads as one concrete distribution (one pill per kid).
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible()
    await expect(page.getByLabel('Your answer')).toHaveCount(0)
    await expect(page.locator('.sbsolve__group')).toHaveCount(3)
    await expect(page.locator('.sbsolve__bar')).toHaveCount(2)
    await page.screenshot({ path: `${SHOTS}/30-sb-given.png` })

    // Next morphs the row into one fixed box per symbol — no extra gate between.
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.locator('.sbsolve__pos')).toHaveCount(6, { timeout: 4000 })
    await expect(page.locator('.sbsolve__pos--bar')).toHaveCount(2)
    await page.screenshot({ path: `${SHOTS}/31-sb-boxes.png` })

    // The ways gate appears on its own once the split has played out.
    await expect(page.getByText(/every sharing just chooses/i)).toBeVisible({ timeout: 4000 })

    // Dragging a bar box onto a star box is a content SWAP, not a duplication:
    // still exactly two bars across six fixed boxes.
    const barBox = page.locator('.sbsolve__pos--bar').first()
    const starBox = page.locator('.sbsolve__pos:not(.sbsolve__pos--bar)').first()
    await barBox.dragTo(starBox)
    await expect(page.locator('.sbsolve__pos--bar')).toHaveCount(2)
    await expect(page.locator('.sbsolve__pos')).toHaveCount(6)

    // Ways: a wrong answer (30) surfaces the hint (not explanatory text), then C(6,2) = 15 finishes it.
    await answer('30')
    await expect(page.getByText(/the stars never move/i)).toBeVisible()
    await answer('15')
    await expect(page.getByText(/15 ways to share/i)).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/32-sb-done.png` })
  })

  test('lesson 2 permutation builder: write 5 × 4 × 3 with factorials', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto('/lesson/lesson-2')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    // Each permutation slot-select: enter the shrinking option counts (each followed
    // by a roulette pick), then the total. Podium = 4·3·2, shelf = 5·4·3 → 60.
    const option = async (value: string) => {
      const input = page.getByLabel(/available for/i)
      await expect(input).toBeVisible({ timeout: 10000 })
      await input.fill(value)
      await page.getByRole('button', { name: 'Check' }).click()
    }
    const total = async (value: string) => {
      const input = page.getByLabel('Your answer')
      await expect(input).toBeVisible({ timeout: 10000 })
      await input.fill(value)
      await page.getByRole('button', { name: 'Check' }).click()
    }
    await option('4')
    await option('3')
    await option('2')
    await total('24')
    await option('5')
    await option('4')
    await option('3')
    await total('60')

    // The builder is framed from the concrete product they just found, not from
    // notation: the LHS is "5 × 4 × 3", never "P(5, …)".
    await expect(page.locator('.ebuild')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.fsplit')).toBeVisible()
    await expect(page.locator('.ebuild__lhs')).toContainText('5 × 4 × 3')
    await expect(page.locator('.ebuild__lhs')).not.toContainText('P(')
    await page.screenshot({ path: `${SHOTS}/40-perm-build.png` })

    const slots = page.locator('.ebuild__slot')
    await expect(slots).toHaveCount(3)
    const nChip = page.getByRole('button', { name: /total objects/i })
    const kChip = page.getByRole('button', { name: /objects to choose/i })

    // Wrong: k into the numerator (which wants the total n) → hint, slot stays empty.
    await kChip.click()
    await slots.nth(0).click()
    await expect(page.getByText(/which number is the total/i)).toBeVisible()
    await expect(slots.nth(0)).toHaveText('')
    await page.screenshot({ path: `${SHOTS}/41-perm-wrong.png` })

    // Correct: n in numerator + denominator-left, k in denominator-right.
    await nChip.click()
    await slots.nth(0).click()
    await slots.nth(1).click()
    await kChip.click()
    await slots.nth(2).click()

    // The rule (P) is named only now, on the solved screen.
    await expect(page.getByText(/built it/i)).toBeVisible()
    await expect(page.locator('.ebuild__result')).toContainText('5 × 4 × 3 = 60')
    await expect(page.locator('.ebuild__rule')).toContainText('P(n, k)')
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/42-perm-solved.png` })
  })

  test('operators are gated by level: level 2 allows ! but locks P; level 6 allows C even when skipped to', async ({
    page,
  }) => {
    test.setTimeout(60000)

    // ----- Level 2 (Permutations & Combinations): you LEARN perms/combos here,
    // so the P and C shortcuts stay locked for the whole level. Factorials — the
    // tool you write the formula with — are available from the start.
    await page.goto('/lesson/lesson-2')
    await page.getByRole('button', { name: 'Start lesson' }).click()

    const gate = page.getByLabel(/available for/i)
    await expect(gate).toBeVisible({ timeout: 10000 })

    // ! is allowed at level 2 → the live preview evaluates it (no locked message).
    await gate.fill('5!')
    await expect(page.locator('.gate-input__preview')).toContainText('= 120')

    // P is NOT available anywhere in level 2 → rejected as locked on submit.
    await gate.fill('P(5,3)')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.locator('.gate-input__msg')).toContainText(/unlocked yet/i)
    await expect(page.locator('.gate-input__preview')).toHaveCount(0)

    // ----- Level 6 (Stars and Bars), reached directly without doing levels 1–5:
    // C is available because operators follow the level, not lesson completion.
    await page.goto('/lesson/lesson-6')
    await page.getByRole('button', { name: 'Start lesson' }).click()
    await page.getByRole('button', { name: /next/i }).click()

    const waysGate = page.getByLabel('Your answer')
    await expect(waysGate).toBeVisible({ timeout: 10000 })
    await waysGate.fill('C(6,2)')
    await expect(page.locator('.gate-input__preview')).toContainText('= 15')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/15 ways to share/i)).toBeVisible({ timeout: 6000 })
  })

  // Step 1 (cookies, slots given): Next → ways C(6, 2) = 15 → Continue.
  const clearCookies = async (page: import('@playwright/test').Page) => {
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.getByText(/every sharing just chooses/i)).toBeVisible({ timeout: 6000 })
    await page.getByLabel('Your answer').fill('15')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/15 ways to share/i)).toBeVisible({ timeout: 6000 })
    await page.getByRole('button', { name: 'Continue' }).click()
  }

  test('lesson 6 balloons step scaffolds the setup into stars → bars → slots → ways', async ({
    page,
  }) => {
    test.setTimeout(60000)
    await page.goto('/lesson/lesson-6')
    await page.getByRole('button', { name: 'Start lesson' }).click()
    await clearCookies(page)

    // Balloons (6 among 4) breaks the setup into gates asked one at a time.
    // Stars = one per balloon (6); a wrong answer surfaces only the hint.
    await expect(page.getByText(/draw the balloons as stars/i)).toBeVisible({ timeout: 6000 })
    await page.getByLabel('Your answer').fill('4')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/each identical balloon is a single star/i)).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/33-sb-scaffold-stars.png` })
    await page.getByLabel('Your answer').fill('6')
    await page.getByRole('button', { name: 'Check' }).click()

    // Bars = one fewer than the 4 friends (3) — revealed only after stars.
    await expect(page.getByText(/how many bars split the row into 4 friends/i)).toBeVisible({
      timeout: 6000,
    })
    await page.getByLabel('Your answer').fill('3')
    await page.getByRole('button', { name: 'Check' }).click()

    // Slots = stars + bars (9); answering it splits the row into 9 boxes.
    await expect(page.getByText(/how many slots are in the row/i)).toBeVisible({ timeout: 6000 })
    await page.getByLabel('Your answer').fill('9')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.locator('.sbsolve__pos')).toHaveCount(9, { timeout: 4000 })
    await page.screenshot({ path: `${SHOTS}/34-sb-scaffold-boxes.png` })

    // Ways = C(9, 3) = 84 finishes it.
    await expect(page.getByText(/every sharing just chooses which 3 of the 9 boxes/i)).toBeVisible({
      timeout: 4000,
    })
    await page.getByLabel('Your answer').fill('84')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/84 ways to share/i)).toBeVisible({ timeout: 6000 })

    // The ledger ends with all four gates (stars, bars, slots, ways) confirmed.
    await expect(page.locator('.sbsolve__row-label')).toHaveCount(4)
  })

  test('lesson 6 stars-and-bars builder: build C(n + k − 1, k − 1) from items and groups', async ({
    page,
  }) => {
    test.setTimeout(90000)
    await page.goto('/lesson/lesson-6')
    await page.getByRole('button', { name: 'Start lesson' }).click()
    await clearCookies(page)

    // Clear step 2 (balloons, scaffolded): stars 6 → bars 3 → slots 9 → ways 84.
    await expect(page.getByText(/draw the balloons as stars/i)).toBeVisible({ timeout: 6000 })
    await page.getByLabel('Your answer').fill('6')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/how many bars split the row/i)).toBeVisible({ timeout: 6000 })
    await page.getByLabel('Your answer').fill('3')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/how many slots are in the row/i)).toBeVisible({ timeout: 6000 })
    await page.getByLabel('Your answer').fill('9')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/every sharing just chooses which 3 of the 9 boxes/i)).toBeVisible({
      timeout: 6000,
    })
    await page.getByLabel('Your answer').fill('84')
    await page.getByRole('button', { name: 'Check' }).click()
    await expect(page.getByText(/84 ways to share/i)).toBeVisible({ timeout: 6000 })
    await page.getByRole('button', { name: 'Continue' }).click()

    // The stars-bars builder renders the combination C(items + groups − 1, groups − 1)
    // from the problem's own numbers (cookies: items 4, groups 3). 3 slots, no split.
    await expect(page.locator('.ebuild')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('.fsplit')).toHaveCount(0)
    await expect(page.locator('.ebuild__combo-fn')).toHaveText('C')
    await page.screenshot({ path: `${SHOTS}/43-stars-bars-build.png` })

    const slots = page.locator('.ebuild__slot')
    await expect(slots).toHaveCount(3)
    const nChip = page.getByRole('button', { name: /cookies \(items\)/i })
    const kChip = page.getByRole('button', { name: /kids \(groups\)/i })

    // Wrong: groups into the first slot (which wants the items) → hint, slot stays empty.
    await kChip.click()
    await slots.nth(0).click()
    await expect(page.getByText(/which chip counts the items/i)).toBeVisible()
    await expect(slots.nth(0)).toHaveText('')
    await page.screenshot({ path: `${SHOTS}/44-stars-bars-wrong.png` })

    // Correct: items in the first slot; groups in the +groups slot and the (… − 1) slot.
    await nChip.click()
    await slots.nth(0).click()
    await kChip.click()
    await slots.nth(1).click()
    await slots.nth(2).click()

    // The stars-and-bars rule is named only now, on the solved screen: C(6, 2) = 15.
    await expect(page.getByText(/built it/i)).toBeVisible()
    await expect(page.locator('.ebuild__result')).toContainText('C(6, 2) = 15')
    await expect(page.locator('.ebuild__rule')).toContainText('Stars & bars')
    await page.screenshot({ path: `${SHOTS}/45-stars-bars-solved.png` })
  })
})
