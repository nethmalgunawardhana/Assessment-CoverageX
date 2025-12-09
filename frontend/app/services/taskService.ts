/**
 * Task API Service
 * Handles all backend API calls for todo task management
 * Follows REST conventions and error handling best practices
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Type definitions
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.detail || `HTTP Error: ${response.status}`,
      data
    );
  }

  return data;
}

/**
 * Helper function for API requests with common headers
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  return handleResponse<T>(response);
}

/**
 * Task Service API methods
 */
export const taskService = {
  /**
   * Fetch all tasks (incomplete tasks by default)
   * @param limit - Number of tasks to fetch (default: 5)
   * @param skip - Number of tasks to skip for pagination (default: 0)
   */
  async getTasks(limit: number = 5, skip: number = 0): Promise<Task[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
      });

      return await apiCall<Task[]>(`/tasks?${params.toString()}`);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  /**
   * Fetch a single task by ID
   * @param id - Task ID
   */
  async getTask(id: number): Promise<Task> {
    try {
      return await apiCall<Task>(`/tasks/${id}`);
    } catch (error) {
      console.error(`Failed to fetch task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new task
   * @param taskData - Task creation data
   */
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      // Validate input
      if (!taskData.title || !taskData.title.trim()) {
        throw new ApiError(400, 'Title is required');
      }

      return await apiCall<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },

  /**
   * Update a task
   * @param id - Task ID
   * @param updateData - Partial task data to update
   */
  async updateTask(id: number, updateData: UpdateTaskRequest): Promise<Task> {
    try {
      return await apiCall<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark a task as completed
   * @param id - Task ID
   */
  async completeTask(id: number): Promise<Task> {
    return this.updateTask(id, { completed: true });
  },

  /**
   * Mark a task as incomplete
   * @param id - Task ID
   */
  async uncompleteTask(id: number): Promise<Task> {
    return this.updateTask(id, { completed: false });
  },

  /**
   * Delete a task
   * @param id - Task ID
   */
  async deleteTask(id: number): Promise<void> {
    try {
      await apiCall(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      throw error;
    }
  },
};

/**
 * Error handling utility
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Network error. Please check your connection.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
};
