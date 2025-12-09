'use client';

import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Buy books',
      description: 'Buy books for the next school year',
      completed: false,
    },
    {
      id: 2,
      title: 'Clean home',
      description: 'Need to clean the bed room',
      completed: false,
    },
    {
      id: 3,
      title: 'Takehome assignment',
      description: 'Finish the mid-term assignment',
      completed: false,
    },
    {
      id: 4,
      title: 'Play Cricket',
      description: 'Plan the soft ball cricket match on next Sunday',
      completed: false,
    },
    {
      id: 5,
      title: 'Help Saman',
      description: 'Saman need help with his software project',
      completed: false,
    },
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const addTask = () => {
    if (title.trim()) {
      const newTask: Task = {
        id: Math.max(0, ...tasks.map((t) => t.id)) + 1,
        title,
        description,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setTitle('');
      setDescription('');
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto flex max-w-6xl gap-8">
        {/* Add Task Form */}
        <div className="w-80 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Add a Task</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') addTask();
              }}
              className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={4}
            />

            <button
              onClick={addTask}
              className="w-full rounded bg-blue-600 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg bg-gray-200 p-6 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {task.title}
                  </h3>
                  <p className="text-gray-700">{task.description}</p>
                </div>
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`ml-4 rounded border-2 px-6 py-2 font-semibold transition-colors ${
                    task.completed
                      ? 'border-green-600 bg-green-100 text-green-700 hover:bg-green-200'
                      : 'border-gray-400 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {task.completed ? 'Undone' : 'Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
