'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { CheckSquare, Plus, Check, Clock, Search, Filter, Hash, BookOpen, Trash2 } from 'lucide-react';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import confetti from 'canvas-confetti';

interface MyTasksViewProps {
  tasks: Task[];
  language: Language;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
  onAddNew: () => void;
}

export default function MyTasksView({
  tasks,
  language,
  onToggle,
  onDelete,
  onOpenCounter,
  onOpenReading,
  onAddNew,
}: MyTasksViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'spiritual' | 'learning'>('all');
  const [search, setSearch] = useState('');
  const t = TRANSLATIONS[language];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.malayalamTitle && task.malayalamTitle.includes(search)) ||
        (task.arabicTitle && task.arabicTitle.includes(search));

      if (!matchSearch) return false;

      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      if (filter === 'spiritual') return task.category === 'spiritual';
      if (filter === 'learning') return task.category === 'learning';
      return true;
    });
  }, [tasks, search, filter]);

  const handleCheck = (taskId: string, completed: boolean) => {
    triggerHaptic([40]);
    if (!completed) {
      playChimeSound();
      try {
        confetti({ particleCount: 35, spread: 45 });
      } catch (err) {}
    }
    onToggle(taskId);
  };

  return (
    <div className="space-y-6 animate-pop">
      {/* Header */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-taskati-navy dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-taskati-blue" />
            <span>{language === 'ml' ? 'എന്റെ ടാസ്കുകൾ (My Tasks)' : 'My Tasks'}</span>
          </h2>
          <p className="text-xs text-taskati-muted dark:text-gray-400 pt-1">
            {language === 'ml'
              ? 'ദിവസേനയുള്ള എല്ലാ ടാസ്കുകളുടെയും ലിസ്റ്റും പൂർത്തീകരണവും'
              : 'Complete checklist of all scheduled tasks & routines'}
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 rounded-2xl bg-taskati-blue text-white text-xs font-bold shadow-taskati hover:bg-taskati-blue-hover active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewTask}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-4 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-taskati-bg dark:bg-[#121528] px-3.5 py-2 rounded-2xl border border-taskati-border/60 dark:border-white/5 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-taskati-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="bg-transparent text-xs font-semibold outline-none w-full text-taskati-navy dark:text-white placeholder:text-taskati-muted"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-taskati-bg dark:bg-[#121528] p-1 rounded-2xl border border-taskati-border/60 dark:border-white/5 text-xs font-bold">
          {(['all', 'pending', 'completed', 'spiritual', 'learning'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === f
                  ? 'bg-taskati-blue text-white shadow-xs'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
              }`}
            >
              {f === 'all'
                ? t.all
                : f === 'pending'
                ? t.pending
                : f === 'completed'
                ? t.completed
                : f === 'spiritual'
                ? t.spiritual
                : t.learning}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-taskati-muted dark:text-gray-400 text-xs">
            {language === 'ml' ? 'ടാസ്കുകളൊന്നും കണ്ടെത്തിയില്ല.' : 'No tasks found.'}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

            return (
              <div
                key={task.id}
                onClick={() => handleCheck(task.id, task.completed)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-gray-50/70 dark:bg-white/5 border-gray-100 dark:border-white/5 opacity-70'
                    : 'bg-[#F8FAFF] dark:bg-[#141A30] border-[#E8ECF5] dark:border-white/10 hover:border-taskati-blue shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Circular Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      task.completed
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white dark:bg-[#1E293B] border-2 border-taskati-border dark:border-white/30'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  {/* Title & Tags */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          task.completed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-taskati-navy dark:text-white'
                        }`}
                      >
                        {displayTitle}
                      </span>

                      {task.arabicTitle && (
                        <span dir="rtl" className="hidden sm:inline text-xs text-gray-400 font-serif">
                          {task.arabicTitle}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-taskati-muted dark:text-gray-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.time}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.type === 'counter' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCounter(task);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-taskati-blue text-[11px] font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                    >
                      <Hash className="w-3 h-3" />
                      <span>{task.counterCurrent || 0}/100</span>
                    </button>
                  )}

                  {task.type === 'reading' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenReading(task);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-taskati-purple text-[11px] font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{language === 'ml' ? 'ഓപ്ഷനുകൾ' : 'Options'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(language === 'ml' ? 'ഈ ടാസ്ക് നീക്കം ചെയ്യണോ?' : 'Delete this task?')) {
                        onDelete(task.id);
                      }
                    }}
                    className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
