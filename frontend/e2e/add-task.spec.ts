import { test, expect } from '@playwright/test';

test.describe('Todo App - Add Task Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the main heading to be visible
    await page.getByText('To-Do').waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should open add task modal when clicking Add task button', async ({ page }) => {
    // Click the Add task button
    await page.getByRole('button', { name: /add task/i }).click();

    // Check if modal is visible
    await expect(page.getByText('Add New Task')).toBeVisible();
    await expect(page.getByPlaceholder('Enter task title...')).toBeVisible();
    await expect(page.getByPlaceholder('Add details about your task...')).toBeVisible();
  });

  test('should close modal when clicking Cancel button', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();
    await expect(page.getByText('Add New Task')).toBeVisible();

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should be hidden
    await expect(page.getByText('Add New Task')).not.toBeVisible();
  });

  test('should close modal when clicking outside', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();
    await expect(page.getByText('Add New Task')).toBeVisible();

    // Click on backdrop (outside modal)
    await page.locator('#addTaskModal').click({ position: { x: 10, y: 10 } });

    // Modal should be hidden
    await expect(page.getByText('Add New Task')).not.toBeVisible();
  });

  test('should show error when trying to add task without title', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();

    // Click Add Task without filling title - use the button inside the modal
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Should show error toast
    await expect(page.getByText('Please enter a task title')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully add a task with title only', async ({ page }) => {
    const taskTitle = `E2E Test Task ${Date.now()}`;

    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();

    // Fill in title
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);

    // Submit - use the button inside the modal
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Wait for success message
    await expect(page.getByText('Task added successfully!').first()).toBeVisible({ timeout: 5000 });

    // Modal should close
    await expect(page.getByText('Add New Task')).not.toBeVisible();

    // Task should appear in the list
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully add a task with title and description', async ({ page }) => {
    const taskTitle = `E2E Task with Description ${Date.now()}`;
    const taskDescription = 'This is a detailed description for the E2E test task';

    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();

    // Fill in form
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);
    await page.getByPlaceholder('Add details about your task...').fill(taskDescription);

    // Submit - use the button inside the modal
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Wait for success message
    await expect(page.getByText('Task added successfully!').first()).toBeVisible({ timeout: 5000 });

    // Both title and description should be visible
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 });
  });

  test('should add task with custom priority', async ({ page }) => {
    const taskTitle = `High Priority Task ${Date.now()}`;

    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();

    // Fill in title
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);

    // Select High priority
    const prioritySelect = page.locator('select').filter({ hasText: 'Moderate' }).first();
    await prioritySelect.selectOption('High');

    // Submit - use the button inside the modal
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Wait for success
    await expect(page.getByText('Task added successfully!').first()).toBeVisible({ timeout: 5000 });

    // Check if the task appears with High priority
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Priority: High').first()).toBeVisible({ timeout: 5000 });
  });

  test('should add task with custom status', async ({ page }) => {
    const taskTitle = `In Progress Task ${Date.now()}`;

    // Open modal
    await page.getByRole('button', { name: /add task/i }).click();

    // Fill in title
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);

    // Select In Progress status
    const statusSelect = page.locator('select').filter({ hasText: 'Not Started' }).first();
    await statusSelect.selectOption('In Progress');

    // Submit - use the button inside the modal
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Wait for success
    await expect(page.getByText('Task added successfully!').first()).toBeVisible({ timeout: 5000 });

    // Check if the task appears with In Progress status
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Status: In Progress').first()).toBeVisible({ timeout: 5000 });
  });

  test('should reset form after successful task creation', async ({ page }) => {
    const taskTitle = `Reset Form Test ${Date.now()}`;

    // Open modal and add a task
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);
    await page.getByPlaceholder('Add details about your task...').fill('Some description');
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();

    // Wait for success
    await expect(page.getByText('Task added successfully!').first()).toBeVisible({ timeout: 5000 });

    // Open modal again
    await page.getByRole('button', { name: /add task/i }).click();

    // Check if form is reset
    const titleInput = page.getByPlaceholder('Enter task title...');
    const descriptionInput = page.getByPlaceholder('Add details about your task...');

    await expect(titleInput).toHaveValue('');
    await expect(descriptionInput).toHaveValue('');
  });

  test('should handle adding multiple tasks sequentially', async ({ page }) => {
    const tasks = [
      { title: `Task 1 ${Date.now()}`, description: 'First task' },
      { title: `Task 2 ${Date.now()}`, description: 'Second task' },
      { title: `Task 3 ${Date.now()}`, description: 'Third task' },
    ];

    for (const task of tasks) {
      // Open modal
      await page.getByRole('button', { name: /add task/i }).click();

      // Fill in task details
      await page.getByPlaceholder('Enter task title...').fill(task.title);
      await page.getByPlaceholder('Add details about your task...').fill(task.description);

      // Submit
      const modal = page.locator('#addTaskModal');
      await modal.getByRole('button', { name: 'Add Task' }).click();

      // Wait for success (use .first() to handle multiple toasts)
      await expect(page.getByText('Task added successfully!').first()).toBeVisible({ timeout: 5000 });

      // Wait for toast to disappear before adding next task
      await page.getByText('Task added successfully!').first().waitFor({ state: 'hidden', timeout: 5000 });
    }

    // All tasks should be visible
    for (const task of tasks) {
      await expect(page.getByText(task.title)).toBeVisible();
    }
  });
});
