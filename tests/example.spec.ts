import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  expect(page.locator('canvas')).toBeVisible()
})
