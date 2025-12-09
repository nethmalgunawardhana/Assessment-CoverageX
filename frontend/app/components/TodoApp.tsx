'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  ClipboardList,
  Loader2,
  Plus,
  Calendar,
  Moon,
  Sun,
  Trash2,
  MoreVertical,
  Check
} from 'lucide-react';
import { useTasks } from '@/app/hooks/useTasks';
import { Task } from '@/app/services/taskService';
import { handleApiError } from '@/app/services/taskService';

export default function TodoApp() {
  const {
    tasks,
    loading,
    createTask,
    deleteTask: deleteTaskFromService,
    completeTask,
    updateTaskStatus,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [priority, setPriority] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [status, setStatus] = useState<'Not Started' | 'In Progress' | 'Completed'>('Not Started');

  const addTask = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      setIsAddingTask(true);
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
      });
      setTitle('');
      setDescription('');
      setPriority('Moderate');
      setStatus('Not Started');
      toast.success('Task added successfully!');
    } catch (err) {
      console.error('Error adding task:', err);
      toast.error(handleApiError(err));
    } finally {
      setIsAddingTask(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setDeletingTaskId(id);
      await deleteTaskFromService(id);
      toast.success('Task deleted!');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error(handleApiError(err));
    } finally {
      setDeletingTaskId(null);
    }
  };

  const markTaskAsDone = async (id: number) => {
    try {
      setDeletingTaskId(id);
      // Optimistically update UI
      updateTaskStatus(id, 'Completed');
      await completeTask(id);
      toast.success('Task completed!');
    } catch (err) {
      console.error('Error completing task:', err);
      toast.error(handleApiError(err));
    } finally {
      setDeletingTaskId(null);
    }
  };

  const calculateStatusPercentages = () => {
    if (tasks.length === 0) return { completed: 0, inProgress: 0, notStarted: 0 };
    
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const notStarted = tasks.filter((t) => t.status === 'Not Started').length;
    
    return {
      completed: Math.round((completed / tasks.length) * 100),
      inProgress: Math.round((inProgress / tasks.length) * 100),
      notStarted: Math.round((notStarted / tasks.length) * 100),
    };
  };

  const statusPercentages = calculateStatusPercentages();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#1f2937' : '#363636',
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
      <div className={`min-h-screen lg:h-screen lg:overflow-hidden transition-colors duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      } p-6 pb-12 lg:pb-6`}>
        {/* Header with Theme Toggle */}
        <div className="mx-auto max-w-7xl mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <ClipboardList className="h-7 w-7 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              To-Do
            </h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-lg p-3 transition-all ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task List */}
          <div className="lg:col-span-2 space-y-4 lg:overflow-y-auto lg:max-h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  • Today
                </span>
              </div>
              <button
                onClick={() => {
                  const modal = document.getElementById('addTaskModal');
                  if (modal) modal.style.display = 'flex';
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add task</span>
              </button>
            </div>

            {loading && tasks.length === 0 ? (
              <div className={`flex flex-col items-center justify-center rounded-2xl p-12 ${
                darkMode ? 'bg-gray-800/50 border border-blue-400' : 'bg-white border border-blue-200'
              }`}>
                <Loader2 className={`mb-4 h-12 w-12 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your tasks...</p>
              </div>
            ) : tasks.filter((task) => task.status !== 'Completed').length === 0 ? (
              <div className={`flex flex-col items-center justify-center rounded-2xl p-12 ${
                darkMode ? 'bg-gray-800/50 border border-blue-400' : 'bg-white border border-blue-200'
              }`}>
                <p className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>No active tasks</p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tasks.length > 0 ? 'All tasks completed! Great job! 🎉' : 'Create your first task to get started!'}</p>
              </div>
            ) : (
              tasks.filter((task) => task.status !== 'Completed').map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl p-6 transition-all hover:shadow-lg ${
                    darkMode 
                      ? 'bg-gray-800/50 border border-blue-400 hover:border-blue-300' 
                      : 'bg-white border border-blue-200 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      checked={task.status === 'Completed'}
                      onChange={() => updateTaskStatus(task.id, task.status === 'Completed' ? 'Not Started' : 'Completed')}
                      className="mt-1 h-5 w-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-1 rounded font-medium ${
                          task.priority === 'High' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : task.priority === 'Moderate'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          Priority: {task.priority || 'Moderate'}
                        </span>
                        <span className={`px-2 py-1 rounded font-medium ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          Status: {task.status || 'Not Started'}
                        </span>
                        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Created on: {new Date(task.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markTaskAsDone(task.id)}
                        disabled={deletingTaskId === task.id}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          darkMode 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        } disabled:opacity-50`}
                      >
                        {deletingTaskId === task.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Done</span>
                          </>
                        )}
                      </button>
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                          className={`p-2 rounded-lg transition-all ${
                            darkMode 
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' 
                              : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
                          } disabled:opacity-50`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button className={`p-2 rounded-lg transition-all ${
                        darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
                      }`}>
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column - Task Status */}
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 ${
              darkMode ? 'bg-gray-800/50 border border-blue-400' : 'bg-white border border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <div className={`h-6 w-6 rounded ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Task Status
                </h2>
              </div>

              {/* Status Circles */}
              <div className="space-y-4">
                {/* Completed */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={darkMode ? '#374151' : '#e5e7eb'}
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#10b981"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - statusPercentages.completed / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statusPercentages.completed}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Completed
                    </span>
                  </div>
                </div>

                {/* In Progress */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={darkMode ? '#374151' : '#e5e7eb'}
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - statusPercentages.inProgress / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statusPercentages.inProgress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      In Progress
                    </span>
                  </div>
                </div>

                {/* Not Started */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-2">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={darkMode ? '#374151' : '#e5e7eb'}
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#ef4444"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - statusPercentages.notStarted / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {statusPercentages.notStarted}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Not Started
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        <div
          id="addTaskModal"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.style.display = 'none';
            }
          }}
        >
          <div className={`rounded-2xl p-8 max-w-md w-full mx-4 ${
            darkMode ? 'bg-gray-800 border border-blue-400' : 'bg-white border border-blue-200'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Task
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-lg px-4 py-3 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border border-blue-400 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-gray-50 border border-blue-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  placeholder="Add details about your task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full rounded-lg px-4 py-3 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border border-blue-400 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-gray-50 border border-blue-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Low' | 'Moderate' | 'High')}
                  className={`w-full rounded-lg px-4 py-3 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border border-blue-400 text-white focus:border-blue-500' 
                      : 'bg-gray-50 border border-blue-200 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Not Started' | 'In Progress' | 'Completed')}
                  className={`w-full rounded-lg px-4 py-3 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border border-blue-400 text-white focus:border-blue-500' 
                      : 'bg-gray-50 border border-blue-200 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('addTaskModal');
                    if (modal) modal.style.display = 'none';
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await addTask();
                    const modal = document.getElementById('addTaskModal');
                    if (modal) modal.style.display = 'none';
                  }}
                  disabled={isAddingTask}
                  className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAddingTask ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    'Add Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
