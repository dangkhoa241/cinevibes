import { test, expect } from '@playwright/test';

test('sign up, log in, post a comment, and log out', async ({ page }) => {
    const username = `e2euser${Date.now()}`;

    await page.goto('/signup');
    await page.getByPlaceholder('Full Name').fill('E2E Test User');
    await page.getByPlaceholder(/Username/).fill(username);
    await page.getByPlaceholder(/Password/).fill('testpass123');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL(/\/login/);

    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill('testpass123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByText(username)).toBeVisible();

    await page.locator('.movie-card').first().click();
    await expect(page).toHaveURL(/\/movie\//);

    const commentText = `e2e comment ${Date.now()}`;
    await page.getByPlaceholder(/Write a normal comment/i).fill(commentText);
    await page.getByRole('button', { name: 'Post Comment' }).click();

    await expect(page.getByText(commentText)).toBeVisible();

    await page.getByText('Logout').click();
    await expect(page.locator('header').getByText('Login')).toBeVisible();
});

test('logged-out users are prompted to log in before commenting', async ({ page }) => {
    await page.goto('/');
    await page.locator('.movie-card').first().click();

    await expect(page.getByText(/Please/).getByRole('link', { name: 'Login' })).toBeVisible();
});
