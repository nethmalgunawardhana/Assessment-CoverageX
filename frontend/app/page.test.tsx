import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';
import * as useTasks from '@/app/hooks/useTasks';

// Mock the TodoApp component
jest.mock('./components/TodoApp', () => {
  return function MockTodoApp() {
    return <div data-testid="todo-app">TodoApp Component</div>;
  };
});

// Mock the useTasks hook
jest.mock('@/app/hooks/useTasks');

const mockUseTasks = useTasks.useTasks as jest.MockedFunction<typeof useTasks.useTasks>;

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      createTask: jest.fn(),
      deleteTask: jest.fn(),
      completeTask: jest.fn(),
      uncompleteTask: jest.fn(),
      updateTaskStatus: jest.fn(),
      refreshTasks: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('should render the TodoApp component', () => {
    render(<Home />);

    expect(screen.getByTestId('todo-app')).toBeInTheDocument();
    expect(screen.getByText('TodoApp Component')).toBeInTheDocument();
  });

  it('should have the correct container classes', () => {
    const { container } = render(<Home />);

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-100');
  });
});
