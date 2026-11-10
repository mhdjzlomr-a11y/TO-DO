'use client';

import React, { useState } from 'react';
import { Task, TaskCategory, TaskType } from '@/types/task';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { X, Plus, Clock, Tag, Sparkles, Hash, BookOpen } from 'lucide-react';

import { Language } from '@/lib/translations';

interface AddTaskModalProps {
  language?: Language;
  onClose: () => void;
  onAdd?: (newTask: Omit<Task, 'id' | 'completed'>) => void;
  onAddTask?: (newTask: Omit<Task, 'id' | 'completed'>) => void;
}

export default function AddTaskModal({ language, onClose, onAdd, onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [arabicTitle, setArabicTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [category, setCategory] = useState<TaskCategory>('spiritual');
  const [type, setType] = useState<TaskType>('standard');
  const [counterTarget, setCounterTarget] = useState(100);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic([40]);
    playChimeSound();

    const taskData: Omit<Task, 'id' | 'completed'> = {
      title: title.trim().toUpperCase(),
      arabicTitle: arabicTitle.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      time,
      category,
      type,
      counterTarget: type === 'counter' ? counterTarget : undefined,
      counterCurrent: type === 'counter' ? 0 : undefined,
      priority,
      readingDetails: type === 'reading' ? {
        materialType: 'Book',
        title: title.trim(),
        targetMinutes: 20,
        minutesSpent: 0,
        startPage: '1',
        endPage: '10'
      } : undefined
    };

    if (onAdd) onAdd(taskData);
    if (onAddTask) onAddTask(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taskati-navy/60 backdrop-blur-sm animate-pop overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-4xl p-6 shadow-taskati-float border border-taskati-border relative my-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-taskati-blue-light text-taskati-blue">
              <Plus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-taskati-navy">Add Daily Routine</h3>
              <p className="text-xs text-taskati-muted">Add a new scheduled daily task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-taskati-bg text-taskati-muted hover:text-taskati-navy transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
              Task / Routine Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DUHA PRAYER, PODCAST STUDY..."
              className="w-full px-4 py-2.5 rounded-2xl bg-taskati-bg border border-taskati-border text-sm text-taskati-navy font-semibold placeholder-taskati-muted focus:outline-none focus:border-taskati-blue"
            />
          </div>

          {/* Arabic Title (Optional) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
              Arabic Name (Optional)
            </label>
            <input
              type="text"
              value={arabicTitle}
              onChange={(e) => setArabicTitle(e.target.value)}
              placeholder="e.g. صلاة الضحى"
              className="w-full px-4 py-2.5 rounded-2xl bg-taskati-bg border border-taskati-border text-sm text-taskati-navy font-serif placeholder-taskati-muted focus:outline-none focus:border-taskati-blue dir-rtl"
            />
          </div>

          {/* Time Picker & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
                Specific Time (24h)
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-taskati-bg border border-taskati-border text-sm text-taskati-navy font-bold focus:outline-none focus:border-taskati-blue"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2.5 rounded-2xl bg-taskati-bg border border-taskati-border text-xs text-taskati-navy font-semibold focus:outline-none focus:border-taskati-blue"
              >
                <option value="spiritual">Spiritual / Dhikr</option>
                <option value="learning">Learning / Language</option>
                <option value="health">Health / Fitness</option>
                <option value="work">Work / Business</option>
                <option value="personal">Personal Habit</option>
              </select>
            </div>
          </div>

          {/* Task Type Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-2">
              Routine Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('standard')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all ${
                  type === 'standard'
                    ? 'bg-taskati-navy text-white border-taskati-navy shadow-sm'
                    : 'bg-taskati-bg text-taskati-navy border-taskati-border'
                }`}
              >
                Standard Check
              </button>

              <button
                type="button"
                onClick={() => setType('counter')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  type === 'counter'
                    ? 'bg-taskati-pink text-white border-taskati-pink shadow-sm'
                    : 'bg-taskati-bg text-taskati-navy border-taskati-border'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                Dhikr Counter
              </button>

              <button
                type="button"
                onClick={() => setType('reading')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  type === 'reading'
                    ? 'bg-taskati-purple text-white border-taskati-purple shadow-sm'
                    : 'bg-taskati-bg text-taskati-navy border-taskati-border'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Reading Hub
              </button>
            </div>
          </div>

          {/* Target Counter if counter type */}
          {type === 'counter' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
                Target Count (e.g. 33, 100, 300)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={counterTarget}
                onChange={(e) => setCounterTarget(parseInt(e.target.value, 10) || 100)}
                className="w-full px-4 py-2.5 rounded-2xl bg-taskati-bg border border-taskati-border text-sm font-bold text-taskati-navy focus:outline-none focus:border-taskati-blue"
              />
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-2xl text-xs font-bold capitalize border transition-all ${
                    priority === p
                      ? 'bg-taskati-blue text-white border-taskati-blue'
                      : 'bg-taskati-bg text-taskati-muted border-taskati-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-3xl bg-gradient-to-r from-taskati-blue to-taskati-blue-hover text-white font-bold text-sm shadow-taskati-float hover:shadow-taskati transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Save Routine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
