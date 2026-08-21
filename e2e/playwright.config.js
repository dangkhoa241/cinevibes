import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    webServer: [
        {
            command: 'npm run dev',
            cwd: '../backend-cinevibes',
            url: 'http://localhost:8000/api/movies/trending',
            reuseExistingServer: !process.env.CI,
            timeout: 30000,
            env: { PORT: '8000' },
        },
        {
            command: 'npm run dev',
            cwd: '../frontend-cinevibes',
            url: 'http://localhost:5173',
            reuseExistingServer: !process.env.CI,
            timeout: 30000,
        },
    ],
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
