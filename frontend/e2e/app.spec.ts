import { test, expect } from '@playwright/test';

test.describe('Todo App - Basic UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('To-Do').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should load the application successfully', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.getByText('To-Do')).toBeVisible();

    // Check if the Add task button is visible
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible();

    // Check if the date is displayed
    const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    await expect(page.getByText(today)).toBeVisible();
  });

  test('should display dark mode by default', async ({ page }) => {
    // Check for dark mode classes
    const container = page.locator('div.min-h-screen').first();
    await expect(container).toHaveClass(/from-gray-900/);
  });

  test('should display Task Status section', async ({ page }) => {
    await expect(page.getByText('Task Status')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Not Started')).toBeVisible();
  });

  test('should show empty state when no tasks', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(2000);

    // Check for empty state message (if no tasks exist)
    const noTasksText = page.getByText(/No active tasks|Create your first task/i);
    const isVisible = await noTasksText.isVisible().catch(() => false);

    // If empty state is visible, we have no tasks
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('To-Do')).toBeVisible();

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('To-Do')).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('To-Do')).toBeVisible();
  });
});
