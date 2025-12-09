'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks?limit=5`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      setIsAddingTask(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create task');
      }

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setTitle('');
      setDescription('');
      toast.success('Task added successfully!');

      if (tasks.length >= 5) {
        setTasks((prevTasks) => prevTasks.slice(0, 4));
      }
    } catch (err) {
      console.error('Error adding task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const toggleTask = async (id: number) => {
    try {
      setCompletingTaskId(id);
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
      toast.success('Task completed!');
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to complete task. Please try again.');
    } finally {
      setCompletingTaskId(null);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="mx-auto flex max-w-6xl gap-8">
          {/* Add Task Form */}
          <div className="w-80 rounded-xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              ✨ Add a Task
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isAddingTask) addTask();
                  }}
                  disabled={isAddingTask}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Add details about your task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isAddingTask}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                />
              </div>

              <button
                onClick={addTask}
                disabled={isAddingTask}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none"
              >
                {isAddingTask ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  '+ Add Task'
                )}
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 space-y-4">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              📋 Your Tasks
            </h2>

            {loading && tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-lg">
                <svg
                  className="mb-4 h-12 w-12 animate-spin text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-lg font-medium text-gray-600">Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-lg">
                <div className="mb-4 text-6xl">📝</div>
                <p className="mb-2 text-xl font-semibold text-gray-800">No tasks yet</p>
                <p className="text-gray-600">Create your first task to get started!</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="group rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.1}s backwards`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-gray-600">
                        {task.description || (
                          <span className="italic text-gray-400">No description provided</span>
                        )}
                      </p>
                      <p className="mt-3 text-xs text-gray-400">
                        Created: {new Date(task.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleTask(task.id)}
                      disabled={completingTaskId === task.id}
                      className="flex items-center gap-2 rounded-lg border-2 border-green-500 bg-white px-5 py-2.5 font-semibold text-green-600 transition-all hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
                    >
                      {completingTaskId === task.id ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>Done</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
