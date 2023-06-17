import { test, expect } from '@playwright/test'

test('has canvas', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  expect(page.locator('canvas')).toBeVisible()
})
