import { test, expect } from '@playwright/test';

test('searching a nonsense term shows the empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/Search for a movie/i).fill('zzzznonexistentmovie123');

    await expect(page.getByText(/No movies found/i)).toBeVisible();
});

test('filtering by genre updates the URL', async ({ page }) => {
    await page.goto('/');

    await page.locator('select').nth(0).selectOption('Comedy');

    await expect(page).toHaveURL(/genre=Comedy/);
});

test('clicking the logo from a paginated page resets back to the plain homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.movie-card').first()).toBeVisible();

    await page.getByText('Next', { exact: true }).click();
    await expect(page).toHaveURL(/page=2/);

    await page.locator('header').getByText('CineVibes').click();

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByText('Trending Movies')).toBeVisible();
});
