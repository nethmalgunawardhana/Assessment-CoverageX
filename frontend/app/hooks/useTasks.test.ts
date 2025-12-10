import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';
import * as taskService from '@/app/services/taskService';

// Mock the taskService module
jest.mock('@/app/services/taskService', () => ({
  taskService: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    completeTask: jest.fn(),
    uncompleteTask: jest.fn(),
    deleteTask: jest.fn(),
  },
  handleApiError: jest.fn((err) => err.message || 'Error occurred'),
}));

const mockTaskService = taskService.taskService as jest.Mocked<typeof taskService.taskService>;

describe('useTasks', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'Description 1',
      completed: false,
      priority: 'High' as const,
      status: 'Not Started' as const,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Description 2',
      completed: false,
      priority: 'Moderate' as const,
      status: 'In Progress' as const,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should fetch tasks on mount', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      expect(result.current.loading).toBe(true);
      expect(result.current.tasks).toEqual([]);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(mockTaskService.getTasks).toHaveBeenCalledWith(10, 0);
    });

    it('should handle fetch error on mount', async () => {
      const error = new Error('Fetch failed');
      mockTaskService.getTasks.mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Fetch failed');
      expect(result.current.tasks).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create a task and add it to the list', async () => {
      mockTaskService.getTasks.mockResolvedValue([]);
      const newTask = {
        id: 3,
        title: 'New Task',
        description: 'New Description',
        completed: false,
        priority: 'Low' as const,
        status: 'Not Started' as const,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };
      mockTaskService.createTask.mockResolvedValue(newTask);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createTask({
        title: 'New Task',
        description: 'New Description',
        priority: 'Low',
      });

      await waitFor(() => {
        expect(result.current.tasks).toContainEqual(newTask);
      });

      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        priority: 'Low',
      });
    });

    it('should handle create task error', async () => {
      mockTaskService.getTasks.mockResolvedValue([]);
      const error = new Error('Create failed');
      mockTaskService.createTask.mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.createTask({ title: 'New Task' })
      ).rejects.toThrow('Create failed');

      await waitFor(() => {
        expect(result.current.error).toBe('Create failed');
      });
    });

    it('should limit tasks to 10 most recent', async () => {
      const existingTasks = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
        description: `Description ${i + 1}`,
        completed: false,
        priority: 'Moderate' as const,
        status: 'Not Started' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }));
      mockTaskService.getTasks.mockResolvedValue(existingTasks);

      const newTask = {
        id: 11,
        title: 'Task 11',
        description: 'Description 11',
        completed: false,
        priority: 'High' as const,
        status: 'Not Started' as const,
        created_at: '2024-01-11T00:00:00Z',
        updated_at: '2024-01-11T00:00:00Z',
      };
      mockTaskService.createTask.mockResolvedValue(newTask);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.createTask({ title: 'Task 11' });

      await waitFor(() => {
        expect(result.current.tasks.length).toBe(10);
        expect(result.current.tasks[0]).toEqual(newTask);
      });
    });
  });

  describe('completeTask', () => {
    it('should complete a task and remove it from the list', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
      mockTaskService.completeTask.mockResolvedValue({
        ...mockTasks[0],
        completed: true,
        status: 'Completed',
      });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.completeTask(1);

      await waitFor(() => {
        expect(result.current.tasks).not.toContainEqual(
          expect.objectContaining({ id: 1 })
        );
      });

      expect(mockTaskService.completeTask).toHaveBeenCalledWith(1);
    });

    it('should handle complete task error', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
      const error = new Error('Complete failed');
      mockTaskService.completeTask.mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.completeTask(1)).rejects.toThrow(
        'Complete failed'
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Complete failed');
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and remove it from the list', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
      mockTaskService.deleteTask.mockResolvedValue();

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteTask(1);

      await waitFor(() => {
        expect(result.current.tasks).not.toContainEqual(
          expect.objectContaining({ id: 1 })
        );
      });

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
    });

    it('should handle delete task error', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);
      const error = new Error('Delete failed');
      mockTaskService.deleteTask.mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.deleteTask(1)).rejects.toThrow(
        'Delete failed'
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed');
      });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status optimistically', async () => {
      mockTaskService.getTasks.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      result.current.updateTaskStatus(1, 'Completed');

      await waitFor(() => {
        const task = result.current.tasks.find((t) => t.id === 1);
        expect(task?.status).toBe('Completed');
      });
    });
  });

  describe('refreshTasks', () => {
    it('should refresh tasks from the API', async () => {
      mockTaskService.getTasks.mockResolvedValueOnce(mockTasks);
      const updatedTasks = [
        {
          ...mockTasks[0],
          title: 'Updated Task',
        },
      ];
      mockTaskService.getTasks.mockResolvedValueOnce(updatedTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.refreshTasks();

      await waitFor(() => {
        expect(result.current.tasks).toEqual(updatedTasks);
      });

      expect(mockTaskService.getTasks).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const error = new Error('Test error');
      mockTaskService.getTasks.mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      result.current.clearError();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
