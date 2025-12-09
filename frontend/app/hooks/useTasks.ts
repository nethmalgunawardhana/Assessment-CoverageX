/**
 * useTasks Hook
 * Manages task state and API interactions with loading and error handling
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Task, CreateTaskRequest, taskService, handleApiError } from '@/app/services/taskService';

export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (taskData: CreateTaskRequest) => Promise<void>;
  completeTask: (id: number) => Promise<void>;
  uncompleteTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  updateTaskStatus: (id: number, status: 'Not Started' | 'In Progress' | 'Completed') => void;
  refreshTasks: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing tasks
 */
export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch tasks from the API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskService.getTasks(10, 0);
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch tasks on component mount
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    try {
      setError(null);
      const newTask = await taskService.createTask(taskData);
      setTasks((prevTasks) => [newTask, ...prevTasks].slice(0, 10)); // Keep only 10 most recent
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Mark a task as completed
   */
  const completeTask = useCallback(async (id: number) => {
    try {
      setError(null);
      await taskService.completeTask(id);
      // Remove completed task from the list
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Mark a task as incomplete
   */
  const uncompleteTask = useCallback(async (id: number) => {
    try {
      setError(null);
      await taskService.uncompleteTask(id);
      // Note: This would need to be added back to the list if desired
      // For now, we'll just remove it since the API returns incomplete tasks
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: number) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Refresh tasks from the API
   */
  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  /**
   * Update task status locally (optimistic update)
   */
  const updateTaskStatus = useCallback((id: number, status: 'Not Started' | 'In Progress' | 'Completed') => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    completeTask,
    uncompleteTask,
    deleteTask,
    updateTaskStatus,
    refreshTasks,
    clearError,
  };
};
