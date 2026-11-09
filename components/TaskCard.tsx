'use client';

import React from 'react';
import { Task } from '@/types/task';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { Check, Clock, BookOpen, Hash, MoreVertical, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onOpenCounter?: (task: Task) => void;
  onOpenReading?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({
  task,
  onToggle,
  onOpenCounter,
  onOpenReading,
  onDelete,
}: TaskCardProps) {
  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([45]);

    if (!task.completed) {
      playChimeSound();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    onToggle(task.id);
  };

  // Format 24h time to 12h AM/PM nicely
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    if (isNaN(h)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div
      className={`group relative w-full bg-white rounded-3xl p-4 transition-all duration-200 border ${
        task.completed
          ? 'border-taskati-border/60 bg-white/70 shadow-none'
          : 'border-taskati-border shadow-taskati-card hover:shadow-taskati hover:border-taskati-blue/40'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox button */}
        <button
          onClick={handleCheckClick}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all transform active:scale-90 ${
            task.completed
              ? 'bg-taskati-navy text-white shadow-sm ring-2 ring-taskati-navy/20'
              : 'border-2 border-taskati-muted/50 hover:border-taskati-blue hover:bg-taskati-blue-light/50 text-transparent'
          }`}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
        >
          <Check className={`w-3.5 h-3.5 stroke-[3] ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              onClick={handleCheckClick}
              className={`text-sm font-bold cursor-pointer transition-colors truncate ${
                task.completed
                  ? 'line-through text-taskati-muted'
                  : 'text-taskati-navy hover:text-taskati-blue'
              }`}
            >
              {task.title}
            </h4>

            {/* Time pill */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                task.completed
                  ? 'bg-taskati-bg text-taskati-muted'
                  : 'bg-taskati-blue-light text-taskati-blue'
              }`}
            >
              <Clock className="w-3 h-3" />
              {formatTime(task.time)}
            </span>
          </div>

          {/* Arabic Title */}
          {task.arabicTitle && (
            <p
              className={`text-base font-serif font-medium mt-0.5 tracking-wide dir-rtl ${
                task.completed ? 'text-taskati-muted/70 line-through' : 'text-taskati-purple'
              }`}
            >
              {task.arabicTitle}
            </p>
          )}

          {/* Subtitle / Notes */}
          {task.subtitle && (
            <p className="text-xs text-taskati-muted mt-0.5 line-clamp-1">{task.subtitle}</p>
          )}

          {/* Interactive Badges / Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Dhikr Counter Action Pill */}
            {task.type === 'counter' && onOpenCounter && (
              <button
                type="button"
                onClick={() => onOpenCounter(task)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  task.completed
                    ? 'bg-taskati-bg text-taskati-muted'
                    : 'bg-taskati-pink-light text-taskati-pink hover:bg-taskati-pink hover:text-white shadow-sm'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>
                  Counter: {task.counterCurrent || 0}/{task.counterTarget || 100}
                </span>
                <span className="text-[10px] opacity-80">(Tap to count)</span>
              </button>
            )}

            {/* Reading Options Action Pill */}
            {task.type === 'reading' && onOpenReading && (
              <button
                type="button"
                onClick={() => onOpenReading(task)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  task.completed
                    ? 'bg-taskati-bg text-taskati-muted'
                    : 'bg-taskati-purple-light text-taskati-purple hover:bg-taskati-purple hover:text-white shadow-sm'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {task.readingDetails?.materialType || 'Reading'}: {task.readingDetails?.title || 'Daily Book'}
                </span>
                <span className="text-[10px] opacity-80">⚙️ Options</span>
              </button>
            )}

            {/* Category tag */}
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                task.category === 'spiritual'
                  ? 'bg-emerald-50 text-emerald-700'
                  : task.category === 'learning'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-taskati-bg text-taskati-muted'
              }`}
            >
              {task.category}
            </span>

            {/* Priority Indicator */}
            {task.priority === 'high' && !task.completed && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-taskati-pink">
                <AlertCircle className="w-3 h-3" /> Important
              </span>
            )}
          </div>
        </div>

        {/* Delete option on hover / mobile */}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-50 text-taskati-muted hover:text-red-500 transition-all"
            title="Delete task"
          >
            <span className="text-xs">✕</span>
          </button>
        )}
      </div>
    </div>
  );
}
