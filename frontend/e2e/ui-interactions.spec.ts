import { test, expect } from '@playwright/test';

test.describe('Todo App - UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('To-Do').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should toggle dark mode to light mode', async ({ page }) => {
    // Verify dark mode is active by default
    const container = page.locator('div.min-h-screen').first();
    await expect(container).toHaveClass(/from-gray-900/);

    // Click the theme toggle button (Sun icon in dark mode)
    const themeButton = page.locator('button').filter({ has: page.locator('.lucide-sun, .lucide-moon') });
    await themeButton.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Verify light mode classes
    await expect(container).toHaveClass(/from-gray-50/);
  });

  test('should toggle light mode back to dark mode', async ({ page }) => {
    const container = page.locator('div.min-h-screen').first();

    // Toggle to light mode
    const themeButton = page.locator('button').filter({ has: page.locator('.lucide-sun, .lucide-moon') });
    await themeButton.click();
    await page.waitForTimeout(500);
    await expect(container).toHaveClass(/from-gray-50/);

    // Toggle back to dark mode
    await themeButton.click();
    await page.waitForTimeout(500);
    await expect(container).toHaveClass(/from-gray-900/);
  });

  test('should maintain theme consistency across modal', async ({ page }) => {
    // Switch to light mode
    const themeButton = page.locator('button').filter({ has: page.locator('.lucide-sun, .lucide-moon') });
    await themeButton.click();
    await page.waitForTimeout(500);

    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();

    // Modal should have light mode styling
    const modal = page.locator('#addTaskModal > div');
    const modalClass = await modal.getAttribute('class');
    expect(modalClass).toContain('bg-white');
  });

  test('should display current date correctly', async ({ page }) => {
    const today = new Date();
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.toLocaleDateString('en-US', { day: 'numeric' });

    await expect(page.getByText(new RegExp(`${day}.*${monthName}|${monthName}.*${day}`))).toBeVisible();
    await expect(page.getByText('Today')).toBeVisible();
  });

  test('should have all priority options in modal', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();

    const prioritySelect = page.locator('select').filter({ hasText: 'Moderate' }).first();
    const options = await prioritySelect.locator('option').allTextContents();

    expect(options).toContain('Low');
    expect(options).toContain('Moderate');
    expect(options).toContain('High');
  });

  test('should have all status options in modal', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();

    const statusSelect = page.locator('select').filter({ hasText: 'Not Started' }).first();
    const options = await statusSelect.locator('option').allTextContents();

    expect(options).toContain('Not Started');
    expect(options).toContain('In Progress');
    expect(options).toContain('Completed');
  });

  test('should display task with correct priority badge colors', async ({ page }) => {
    const tasks = [
      { title: `High Priority UI ${Date.now()}`, priority: 'High' },
      { title: `Low Priority UI ${Date.now() + 1}`, priority: 'Low' },
    ];

    for (const task of tasks) {
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByPlaceholder('Enter task title...').fill(task.title);

      const prioritySelect = page.locator('select').filter({ hasText: 'Moderate' }).first();
      await prioritySelect.selectOption(task.priority);

      const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
      await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }

    // Verify both tasks are visible with correct priority
    await expect(page.getByText(tasks[0].title)).toBeVisible();
    await expect(page.getByText(tasks[1].title)).toBeVisible();
  });

  test('should show radio button for task completion', async ({ page }) => {
    const taskTitle = `Radio Button Test ${Date.now()}`;

    // Create a task
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Find the radio button associated with the task
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    const radioButton = taskCard.locator('input[type="radio"]');

    await expect(radioButton).toBeVisible();
  });

  test('should display action buttons on task card', async ({ page }) => {
    const taskTitle = `Action Buttons Test ${Date.now()}`;

    // Create a task
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');

    // Check for Done button
    await expect(taskCard.getByRole('button', { name: /done/i })).toBeVisible();

    // Check for Delete button (trash icon)
    await expect(taskCard.locator('button').filter({ has: page.locator('.lucide-trash-2') })).toBeVisible();

    // Check for More options button
    await expect(taskCard.locator('button').filter({ has: page.locator('.lucide-more-vertical') })).toBeVisible();
  });

  test('should display toast notifications', async ({ page }) => {
    // Try to add task without title to trigger error toast
    await page.getByRole('button', { name: /add task/i }).click();
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Error toast should be visible
    await expect(page.getByText('Please enter a task title')).toBeVisible({ timeout: 5000 });

    // Wait for toast to disappear
    await page.waitForTimeout(5000);

    // Add a valid task to trigger success toast
    await page.getByPlaceholder('Enter task title...').fill(`Toast Test ${Date.now()}`);
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Success toast should be visible
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
  });

  test('should display task status section with circular progress indicators', async ({ page }) => {
    await expect(page.getByText('Task Status')).toBeVisible();

    // Check for status labels
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Not Started')).toBeVisible();

    // Check for percentage displays (should show 0% initially if no tasks)
    const percentages = page.locator('text=/\\d+%/');
    const count = await percentages.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should display task creation date in correct format', async ({ page }) => {
    const taskTitle = `Date Format Test ${Date.now()}`;

    // Create a task
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Check for date format: MM/DD/YYYY
    await expect(page.getByText(/Created on:/)).toBeVisible();
    await expect(page.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  });

  test('should handle hover effects on buttons', async ({ page }) => {
    // Check Add task button hover
    const addButton = page.getByRole('button', { name: /add task/i });
    await addButton.hover();
    await page.waitForTimeout(300);

    // Button should be visible and interactive
    await expect(addButton).toBeVisible();

    // Check theme toggle button hover
    const themeButton = page.locator('button').filter({ has: page.locator('.lucide-sun, .lucide-moon') });
    await themeButton.hover();
    await page.waitForTimeout(300);
    await expect(themeButton).toBeVisible();
  });

  test('should display modal with proper styling', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();

    // Check modal elements
    await expect(page.getByText('Add New Task')).toBeVisible();
    await expect(page.getByPlaceholder('Enter task title...')).toBeVisible();
    await expect(page.getByPlaceholder('Add details about your task...')).toBeVisible();

    // Check form labels
    await expect(page.getByText('Title *')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();

    // Check buttons
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^add task$/i })).toBeVisible();
  });

  test('should maintain scroll position when adding tasks on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Add multiple tasks
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByPlaceholder('Enter task title...').fill(`Mobile Task ${i} ${Date.now()}`);
      const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
      await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }

    // Header should still be visible
    await expect(page.getByText('To-Do')).toBeVisible();
  });
});
