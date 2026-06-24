import { test, expect } from '@playwright/test'

test.describe('tree layout visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/lesson/lesson-1')
    await page.getByRole('button', { name: 'Start lesson' }).click()
  })

  async function measure(page: import('@playwright/test').Page) {
    return page.getByLabel('Decision tree').evaluate((svg) => {
      const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) ?? [0, 0, 0, 0]
      const [vbX, , vbWidth] = viewBox
      const rootGroup = svg.querySelector('.tree-build__node')
      const transform = rootGroup?.getAttribute('transform') ?? ''
      const match = /translate\(([-\d.]+)/.exec(transform)
      const rootX = match ? Number(match[1]) : 0
      const rootInView = rootX - (vbX ?? 0)
      const circle = svg.querySelector('.tree-build__node-circle')
      const r = circle ? Number(circle.getAttribute('r')) : 0
      const box = svg.getBoundingClientRect()
      const input = document.querySelector(
        '.gate-input, .visual-step__next-btn, .count-rail__input-form',
      )
      const inputBox = input?.getBoundingClientRect()
      return {
        rootDrift: Math.abs(rootInView - (vbWidth ?? 0) / 2),
        nodeRadius: r,
        svgHeight: box.height,
        inputVisible: inputBox ? inputBox.top < window.innerHeight : false,
      }
    })
  }

  test('root centered after first split, compact, input visible', async ({ page }) => {
    await page.getByRole('button', { name: /split first choice/i }).click()
    await page.waitForTimeout(450)

    const m = await measure(page)
    expect(m.rootDrift).toBeLessThan(4)
    expect(m.nodeRadius).toBeLessThanOrEqual(16)
    expect(m.svgHeight).toBeLessThan(260)
    expect(m.inputVisible).toBe(true)
  })

  test('input visible without scroll after full step 1 tree', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /split/i }).click()
      await page.waitForTimeout(400)
      await page.getByLabel('How many nodes at this level?').fill(['2', '6', '12'][i]!)
      await page.getByRole('button', { name: 'Check' }).click()
      await page.waitForTimeout(600)
    }

    const m = await measure(page)
    expect(m.rootDrift).toBeLessThan(4)
    expect(m.inputVisible).toBe(true)
  })
})
