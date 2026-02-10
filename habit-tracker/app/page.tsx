'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, FireIcon } from '@heroicons/react/24/solid';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  completedDates: string[];
  reminder?: string;
  createdAt: string;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('⭐');
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6');
  const [newHabitReminder, setNewHabitReminder] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('habits');
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getStreak = (habit: Habit): number => {
    if (habit.completedDates.length === 0) return 0;

    const sorted = [...habit.completedDates].sort().reverse();
    let streak = 0;
    const today = getTodayString();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sorted[0] !== today && sorted[0] !== yesterday) {
      return 0;
    }

    for (let i = 0; i < sorted.length; i++) {
      const expectedDate = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (sorted[i] === expectedDate) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const isCompletedToday = (habit: Habit): boolean => {
    return habit.completedDates.includes(getTodayString());
  };

  const toggleHabitToday = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const today = getTodayString();
        const completed = habit.completedDates.includes(today);

        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today]
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      emoji: newHabitEmoji,
      color: newHabitColor,
      completedDates: [],
      reminder: newHabitReminder || undefined,
      createdAt: new Date().toISOString()
    };

    setHabits([...habits, newHabit]);
    setShowAddModal(false);
    setNewHabitName('');
    setNewHabitEmoji('⭐');
    setNewHabitColor('#3b82f6');
    setNewHabitReminder('');

    if (newHabitReminder && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const checkReminders = () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        habits.forEach(habit => {
          if (habit.reminder === currentTime && !isCompletedToday(habit)) {
            new Notification(`Time to ${habit.name}!`, {
              body: `Don't break your ${getStreak(habit)} day streak!`,
              icon: '⏰'
            });
          }
        });
      };

      const interval = setInterval(checkReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [habits]);

  const emojis = ['⭐', '💪', '📚', '🏃', '🧘', '💧', '🎯', '✍️', '🎨', '🎵', '🌱', '🔥'];
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-md mx-auto p-4 pb-20">
        <header className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Habit Tracker</h1>
          <p className="text-gray-600">Build streaks, build habits 🔥</p>
        </header>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No habits yet</h2>
            <p className="text-gray-500 mb-6">Start building your routine!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => {
              const streak = getStreak(habit);
              const completed = isCompletedToday(habit);

              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl shadow-md p-4 transition-all hover:shadow-lg"
                  style={{ borderLeft: `4px solid ${habit.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                          completed
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 scale-110'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {completed ? '✓' : habit.emoji}
                      </button>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {streak > 0 && (
                            <div className="flex items-center gap-1 text-orange-500">
                              <FireIcon className="w-4 h-4" />
                              <span className="text-sm font-bold">{streak} days</span>
                            </div>
                          )}
                          {habit.reminder && (
                            <span className="text-xs text-gray-500">⏰ {habit.reminder}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <PlusIcon className="w-7 h-7" />
        </button>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl p-6 w-full max-w-md animate-slide-up">
              <h2 className="text-2xl font-bold mb-4">New Habit</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g., Morning workout"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setNewHabitEmoji(emoji)}
                        className={`text-2xl p-3 rounded-xl transition-all ${
                          newHabitEmoji === emoji
                            ? 'bg-indigo-100 scale-110'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewHabitColor(color)}
                        className={`h-12 rounded-xl transition-all ${
                          newHabitColor === color ? 'ring-4 ring-gray-300 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Reminder (optional)
                  </label>
                  <input
                    type="time"
                    value={newHabitReminder}
                    onChange={(e) => setNewHabitReminder(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addHabit}
                    disabled={!newHabitName.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Habit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
