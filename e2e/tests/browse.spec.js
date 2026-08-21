import { test, expect } from '@playwright/test';

test('homepage shows trending movies and opens a detail page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Trending Movies')).toBeVisible();

    const firstCard = page.locator('.movie-card').first();
    await expect(firstCard).toBeVisible();
    const title = await firstCard.locator('h3').innerText();

    await firstCard.click();

    await expect(page).toHaveURL(/\/movie\//);
    await expect(page.getByRole('heading', { level: 1 }).nth(1)).toHaveText(title);
    await expect(page.getByText('Discussions')).toBeVisible();
});
