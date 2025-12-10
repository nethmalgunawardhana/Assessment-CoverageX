import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TodoApp from './TodoApp';
import * as useTasks from '@/app/hooks/useTasks';
import toast from 'react-hot-toast';

// Mock the hooks and dependencies
jest.mock('@/app/hooks/useTasks');
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

const mockUseTasks = useTasks.useTasks as jest.MockedFunction<typeof useTasks.useTasks>;

describe('TodoApp', () => {
  const mockCreateTask = jest.fn();
  const mockDeleteTask = jest.fn();
  const mockCompleteTask = jest.fn();
  const mockUpdateTaskStatus = jest.fn();

  const defaultMockReturn = {
    tasks: [],
    loading: false,
    error: null,
    createTask: mockCreateTask,
    deleteTask: mockDeleteTask,
    completeTask: mockCompleteTask,
    uncompleteTask: jest.fn(),
    updateTaskStatus: mockUpdateTaskStatus,
    refreshTasks: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTasks.mockReturnValue(defaultMockReturn);
  });

  describe('Rendering', () => {
    it('should render the main app structure', () => {
      render(<TodoApp />);

      expect(screen.getByText('To-Do')).toBeInTheDocument();
      expect(screen.getByText('Add task')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        loading: true,
        tasks: [],
      });

      render(<TodoApp />);

      expect(screen.getByText('Loading your tasks...')).toBeInTheDocument();
    });

    it('should display no active tasks message when tasks are empty', () => {
      render(<TodoApp />);

      expect(screen.getByText(/No active tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/Create your first task to get started!/i)).toBeInTheDocument();
    });

    it('should display tasks when available', () => {
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

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('should not display completed tasks in the main list', () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Active Task',
          description: 'Active',
          completed: false,
          priority: 'High' as const,
          status: 'Not Started' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          title: 'Completed Task',
          description: 'Done',
          completed: true,
          priority: 'Moderate' as const,
          status: 'Completed' as const,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      expect(screen.getByText('Active Task')).toBeInTheDocument();
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
    });
  });

  describe('Dark mode toggle', () => {
    it('should toggle dark mode when button is clicked', () => {
      render(<TodoApp />);

      const toggleButton = screen.getByRole('button', { name: '' }).parentElement;
      const container = toggleButton?.closest('div[class*="min-h-screen"]');

      expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-900');

      // Click the theme toggle button
      const themeButton = screen.getAllByRole('button')[0];
      fireEvent.click(themeButton);

      // The class should change to light mode
      expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-50');
    });
  });

  describe('Add task modal', () => {
    it('should open add task modal when clicking Add task button', async () => {
      render(<TodoApp />);

      const addButton = screen.getByText('Add task');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Enter task title...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Add details about your task...')).toBeInTheDocument();
    });

    it('should close modal when clicking Cancel', async () => {
      render(<TodoApp />);

      const addButton = screen.getByText('Add task');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Modal should be hidden (display: none)
      const modal = screen.getByText('Add New Task').closest('div[id="addTaskModal"]');
      expect(modal).toHaveStyle({ display: 'none' });
    });
  });

  describe('Adding tasks', () => {
    it('should create a task with valid input', async () => {
      mockCreateTask.mockResolvedValue(undefined);

      render(<TodoApp />);

      // Open modal
      const addButton = screen.getByText('Add task');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });

      // Fill in form
      const titleInput = screen.getByPlaceholderText('Enter task title...');
      const descriptionInput = screen.getByPlaceholderText('Add details about your task...');

      await userEvent.type(titleInput, 'New Test Task');
      await userEvent.type(descriptionInput, 'New Test Description');

      // Submit form
      const submitButton = screen.getByText('Add Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Test Task',
          description: 'New Test Description',
          priority: 'Moderate',
          status: 'Not Started',
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Task added successfully!');
    });

    it('should show error when trying to add task without title', async () => {
      render(<TodoApp />);

      // Open modal
      const addButton = screen.getByText('Add task');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });

      // Submit without filling title
      const submitButton = screen.getByText('Add Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter a task title');
      });

      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it('should handle task creation error', async () => {
      mockCreateTask.mockRejectedValue(new Error('Creation failed'));

      render(<TodoApp />);

      // Open modal
      const addButton = screen.getByText('Add task');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });

      // Fill in form
      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await userEvent.type(titleInput, 'New Task');

      // Submit form
      const submitButton = screen.getByText('Add Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should reset form after successful task creation', async () => {
      mockCreateTask.mockResolvedValue(undefined);

      render(<TodoApp />);

      // Open modal
      const addButton = screen.getByText('Add task');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });

      // Fill in form
      const titleInput = screen.getByPlaceholderText('Enter task title...') as HTMLInputElement;
      const descriptionInput = screen.getByPlaceholderText('Add details about your task...') as HTMLTextAreaElement;

      await userEvent.type(titleInput, 'New Task');
      await userEvent.type(descriptionInput, 'New Description');

      // Submit form
      const submitButton = screen.getByText('Add Task');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalled();
      });

      // Check if form is reset - reopen modal to check
      fireEvent.click(addButton);
      await waitFor(() => {
        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
      });
    });
  });

  describe('Task operations', () => {
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

    it('should mark task as done', async () => {
      mockCompleteTask.mockResolvedValue(undefined);

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      const doneButton = screen.getByText('Done');
      fireEvent.click(doneButton);

      await waitFor(() => {
        expect(mockCompleteTask).toHaveBeenCalledWith(1);
      });

      expect(toast.success).toHaveBeenCalledWith('Task completed!');
    });

    it('should delete task', async () => {
      mockDeleteTask.mockResolvedValue(undefined);

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(mockDeleteTask).toHaveBeenCalledWith(1);
        });

        expect(toast.success).toHaveBeenCalledWith('Task deleted!');
      }
    });

    it('should handle task completion error', async () => {
      mockCompleteTask.mockRejectedValue(new Error('Completion failed'));

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      const doneButton = screen.getByText('Done');
      fireEvent.click(doneButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should handle task deletion error', async () => {
      mockDeleteTask.mockRejectedValue(new Error('Deletion failed'));

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Status calculations', () => {
    it('should calculate status percentages correctly', () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: '',
          completed: true,
          priority: 'High' as const,
          status: 'Completed' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          title: 'Task 2',
          description: '',
          completed: false,
          priority: 'Moderate' as const,
          status: 'In Progress' as const,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 3,
          title: 'Task 3',
          description: '',
          completed: false,
          priority: 'Low' as const,
          status: 'In Progress' as const,
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
        },
        {
          id: 4,
          title: 'Task 4',
          description: '',
          completed: false,
          priority: 'High' as const,
          status: 'Not Started' as const,
          created_at: '2024-01-04T00:00:00Z',
          updated_at: '2024-01-04T00:00:00Z',
        },
      ];

      mockUseTasks.mockReturnValue({
        ...defaultMockReturn,
        tasks: mockTasks,
      });

      render(<TodoApp />);

      // Check if the status section renders
      expect(screen.getByText('Task Status')).toBeInTheDocument();
      expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
      expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Not Started').length).toBeGreaterThan(0);

      // Percentages: 1/4 = 25% completed, 2/4 = 50% in progress, 1/4 = 25% not started
      expect(screen.getAllByText('25%')).toHaveLength(2); // Completed and Not Started both 25%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show 0% for all statuses when no tasks', () => {
      render(<TodoApp />);

      expect(screen.getByText('Task Status')).toBeInTheDocument();
      expect(screen.getAllByText('0%')).toHaveLength(3);
    });
  });
});
