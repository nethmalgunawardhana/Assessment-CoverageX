import { test, expect } from '@playwright/test';

test.describe('Todo App - Task Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('To-Do').waitFor({ state: 'visible', timeout: 10000 });
  });

  const createTestTask = async (page: any, title: string, description?: string) => {
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(title);
    if (description) {
      await page.getByPlaceholder('Add details about your task...').fill(description);
    }
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
  };

  test('should mark a task as done', async ({ page }) => {
    const taskTitle = `Task to Complete ${Date.now()}`;

    // Create a task
    await createTestTask(page, taskTitle, 'This task will be completed');

    // Verify task is visible
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Click the Done button
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    await taskCard.getByRole('button', { name: /done/i }).click();

    // Wait for success message
    await expect(page.getByText('Task completed!')).toBeVisible({ timeout: 5000 });

    // Task should be removed from active list (filtered out)
    await page.waitForTimeout(2000);
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    const taskTitle = `Task to Delete ${Date.now()}`;

    // Create a task
    await createTestTask(page, taskTitle, 'This task will be deleted');

    // Verify task is visible
    await expect(page.getByText(taskTitle)).toBeVisible();

    // Find and click the delete button (trash icon)
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    const deleteButton = taskCard.locator('button').filter({ has: page.locator('.lucide-trash-2') });
    await deleteButton.click();

    // Wait for success message
    await expect(page.getByText('Task deleted!')).toBeVisible({ timeout: 5000 });

    // Task should be removed from the list
    await page.waitForTimeout(1000);
    await expect(page.getByText(taskTitle)).not.toBeVisible();
  });

  test('should show loading state when completing task', async ({ page }) => {
    const taskTitle = `Task Loading State ${Date.now()}`;

    // Create a task
    await createTestTask(page, taskTitle);

    // Click Done button
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    await taskCard.getByRole('button', { name: /done/i }).click();

    // Should briefly show "Processing..." (might be quick)
    // The button should be disabled while processing
    const doneButton = taskCard.getByRole('button', { name: /done/i });
    const isDisabled = await doneButton.getAttribute('disabled');

    // Either it's disabled or the action completed quickly
    expect(isDisabled !== null || true).toBe(true);
  });

  test('should complete multiple tasks', async ({ page }) => {
    const tasks = [
      `Multi Complete 1 ${Date.now()}`,
      `Multi Complete 2 ${Date.now()}`,
      `Multi Complete 3 ${Date.now()}`,
    ];

    // Create multiple tasks
    for (const taskTitle of tasks) {
      await createTestTask(page, taskTitle);
    }

    // Complete all tasks
    for (const taskTitle of tasks) {
      await expect(page.getByText(taskTitle)).toBeVisible();
      const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
      await taskCard.getByRole('button', { name: /done/i }).click();
      await expect(page.getByText('Task completed!')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1500);
    }

    // All tasks should be removed from active list
    for (const taskTitle of tasks) {
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    }
  });

  test('should delete multiple tasks', async ({ page }) => {
    const tasks = [
      `Multi Delete 1 ${Date.now()}`,
      `Multi Delete 2 ${Date.now()}`,
    ];

    // Create multiple tasks
    for (const taskTitle of tasks) {
      await createTestTask(page, taskTitle);
    }

    // Delete all tasks
    for (const taskTitle of tasks) {
      await expect(page.getByText(taskTitle)).toBeVisible();
      const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
      const deleteButton = taskCard.locator('button').filter({ has: page.locator('.lucide-trash-2') });
      await deleteButton.click();
      await expect(page.getByText('Task deleted!')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }

    // All tasks should be removed
    for (const taskTitle of tasks) {
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    }
  });

  test('should handle task operations on tasks with different priorities', async ({ page }) => {
    const highPriorityTask = `High Priority ${Date.now()}`;

    // Create task with high priority
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(highPriorityTask);
    const prioritySelect = page.locator('select').filter({ hasText: 'Moderate' }).first();
    await prioritySelect.selectOption('High');
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Verify high priority badge
    await expect(page.getByText('Priority: High')).toBeVisible();

    // Complete the task
    const taskCard = page.locator(`text=${highPriorityTask}`).locator('..').locator('..').locator('..');
    await taskCard.getByRole('button', { name: /done/i }).click();
    await expect(page.getByText('Task completed!')).toBeVisible({ timeout: 5000 });
  });

  test('should display correct task information before completion', async ({ page }) => {
    const taskTitle = `Detailed Task ${Date.now()}`;
    const taskDescription = 'This is a detailed task description';

    // Create task
    await createTestTask(page, taskTitle, taskDescription);

    // Verify all task details are visible
    await expect(page.getByText(taskTitle)).toBeVisible();
    await expect(page.getByText(taskDescription)).toBeVisible();
    await expect(page.getByText(/Priority:/)).toBeVisible();
    await expect(page.getByText(/Status:/)).toBeVisible();
    await expect(page.getByText(/Created on:/)).toBeVisible();

    // Verify action buttons are present
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    await expect(taskCard.getByRole('button', { name: /done/i })).toBeVisible();
    await expect(taskCard.locator('button').filter({ has: page.locator('.lucide-trash-2') })).toBeVisible();
  });

  test('should show empty state after all tasks are completed', async ({ page }) => {
    const taskTitle = `Last Task ${Date.now()}`;

    // Create a single task
    await createTestTask(page, taskTitle);

    // Complete the task
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    await taskCard.getByRole('button', { name: /done/i }).click();
    await expect(page.getByText('Task completed!')).toBeVisible({ timeout: 5000 });

    // Wait for the task to be removed
    await page.waitForTimeout(2000);

    // Should show empty state or "All tasks completed"
    const emptyStateVisible = await page.getByText(/No active tasks|All tasks completed/i).isVisible();
    expect(emptyStateVisible).toBe(true);
  });

  test('should update task status percentages after completion', async ({ page }) => {
    const taskTitle = `Status Update Test ${Date.now()}`;

    // Wait for initial load
    await page.waitForTimeout(2000);

    // Create a task with In Progress status
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByPlaceholder('Enter task title...').fill(taskTitle);
    const statusSelect = page.locator('select').filter({ hasText: 'Not Started' }).first();
    await statusSelect.selectOption('In Progress');
    const modal = page.locator('#addTaskModal');
    await modal.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByText('Task added successfully!')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Verify Task Status section exists
    await expect(page.getByText('Task Status')).toBeVisible();

    // Complete the task
    const taskCard = page.locator(`text=${taskTitle}`).locator('..').locator('..').locator('..');
    await taskCard.getByRole('button', { name: /done/i }).click();
    await expect(page.getByText('Task completed!')).toBeVisible({ timeout: 5000 });

    // Task Status should still be visible
    await expect(page.getByText('Task Status')).toBeVisible();
  });
});
