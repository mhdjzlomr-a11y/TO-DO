'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Check, Plus, Clock } from 'lucide-react';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import confetti from 'canvas-confetti';

interface TaskListBoxProps {
  title: string;
  tasks: Task[];
  language: Language;
  onToggle: (taskId: string) => void;
  onAddNew: () => void;
  onOpenCounter?: (task: Task) => void;
  onOpenReading?: (task: Task) => void;
}

export default function TaskListBox({
  title,
  tasks,
  language,
  onToggle,
  onAddNew,
  onOpenCounter,
  onOpenReading,
}: TaskListBoxProps) {
  const t = TRANSLATIONS[language];

  const handleCheck = (taskId: string, completed: boolean) => {
    triggerHaptic([40]);
    if (!completed) {
      playChimeSound();
      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch (e) {}
    }
    onToggle(taskId);
  };

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col justify-between space-y-3">
      {/* Box Header */}
      <div className="flex items-center justify-between pb-1 border-b border-taskati-border/50 dark:border-white/5">
        <h4 className="text-xs font-bold text-taskati-navy dark:text-white uppercase tracking-wider">{title}</h4>
        <span className="px-2.5 py-0.5 rounded-full bg-taskati-blue text-white text-[10px] font-bold">
          {t.details}
        </span>
      </div>

      {/* Task Items matching Taskati clean checkboxes */}
      <div className="space-y-2.5 flex-1 min-h-[120px]">
        {tasks.map((task) => {
          const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

          return (
            <div
              key={task.id}
              onClick={() => handleCheck(task.id, task.completed)}
              className="flex items-center justify-between gap-2.5 group cursor-pointer py-1 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Circle Checkbox */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    task.completed
                      ? 'bg-taskati-navy dark:bg-taskati-blue text-white shadow-xs'
                      : 'border-2 border-taskati-muted/50 dark:border-white/30 group-hover:border-taskati-blue'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Title */}
                <span
                  className={`truncate font-semibold transition-colors ${
                    task.completed
                      ? 'line-through text-taskati-muted dark:text-gray-500'
                      : 'text-taskati-navy dark:text-white group-hover:text-taskati-blue'
                  }`}
                >
                  {displayTitle}
                </span>
              </div>

              {/* Time */}
              <span className="text-[10px] font-medium text-taskati-muted dark:text-gray-400 flex items-center gap-0.5 flex-shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {task.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer: + Add new task */}
      <button
        onClick={onAddNew}
        className="pt-2 text-left text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-blue flex items-center justify-between border-t border-taskati-border/50 dark:border-white/5 transition-colors"
      >
        <span>{t.addNewTask}</span>
        <span className="text-sm">+</span>
      </button>
    </div>
  );
}
