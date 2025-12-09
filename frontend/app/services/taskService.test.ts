import { taskService, handleApiError } from './taskService';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          priority: 'High' as const,
          status: 'Not Started' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      } as Response);

      const tasks = await taskService.getTasks(10, 0);

      expect(tasks).toEqual(mockTasks);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks?limit=10&skip=0',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(taskService.getTasks()).rejects.toThrow('Network error');
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Server error' }),
      } as Response);

      await expect(taskService.getTasks()).rejects.toThrow('Server error');
    });
  });

  describe('getTask', () => {
    it('should fetch a single task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: 'High' as const,
        status: 'Not Started' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      } as Response);

      const task = await taskService.getTask(1);

      expect(task).toEqual(mockTask);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.any(Object)
      );
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTaskData = {
        title: 'New Task',
        description: 'New Description',
        priority: 'Moderate' as const,
        status: 'Not Started' as const,
      };

      const createdTask = {
        id: 1,
        ...newTaskData,
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdTask,
      } as Response);

      const task = await taskService.createTask(newTaskData);

      expect(task).toEqual(createdTask);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newTaskData),
        })
      );
    });

    it('should throw error when title is empty', async () => {
      await expect(
        taskService.createTask({ title: '' })
      ).rejects.toThrow('Title is required');
    });

    it('should throw error when title is only whitespace', async () => {
      await expect(
        taskService.createTask({ title: '   ' })
      ).rejects.toThrow('Title is required');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        priority: 'High' as const,
      };

      const updatedTask = {
        id: 1,
        title: 'Updated Task',
        description: 'Test Description',
        completed: false,
        priority: 'High' as const,
        status: 'Not Started' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTask,
      } as Response);

      const task = await taskService.updateTask(1, updateData);

      expect(task).toEqual(updatedTask);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', async () => {
      const completedTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: true,
        priority: 'High' as const,
        status: 'Completed' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => completedTask,
      } as Response);

      const task = await taskService.completeTask(1);

      expect(task).toEqual(completedTask);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ completed: true }),
        })
      );
    });
  });

  describe('uncompleteTask', () => {
    it('should mark task as incomplete', async () => {
      const incompleteTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: 'High' as const,
        status: 'Not Started' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteTask,
      } as Response);

      const task = await taskService.uncompleteTask(1);

      expect(task).toEqual(incompleteTask);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ completed: false }),
        })
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await taskService.deleteTask(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/tasks/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle delete error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Task not found' }),
      } as Response);

      await expect(taskService.deleteTask(1)).rejects.toThrow('Task not found');
    });
  });
});

describe('handleApiError', () => {
  it('should handle ApiError', () => {
    const error = new (class extends Error {
      name = 'ApiError';
      status = 400;
      constructor(message: string) {
        super(message);
      }
    })('Bad request');

    const message = handleApiError(error);
    expect(message).toBe('Bad request');
  });

  it('should handle TypeError as network error', () => {
    const error = new TypeError('Failed to fetch');
    const message = handleApiError(error);
    expect(message).toBe('Network error. Please check your connection.');
  });

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong');
    const message = handleApiError(error);
    expect(message).toBe('Something went wrong');
  });

  it('should handle unknown error type', () => {
    const error = { unknown: 'error' };
    const message = handleApiError(error);
    expect(message).toBe('An unknown error occurred');
  });
});
