'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Check, Plus, Clock, Hash, BookOpen } from 'lucide-react';
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

// 5 Vibrant Themes requested by user:
// 1: Blue (നീല), 2: Rose (റോസ്), 3: White (വൈറ്റ്), 4: Violet (വയലറ്റ്), 5: Dark Blue (ഡാർക്ക് ബ്ലൂ)
const VIBRANT_ROW_STYLES = [
  // 1. Blue (നീല)
  {
    name: 'blue',
    container: 'bg-[#EBF3FF] hover:bg-[#DEECFF] border-[#BFDBFE] dark:bg-[#1E3A8A]/35 dark:border-blue-700/40',
    text: 'text-[#1E40AF] dark:text-[#93C5FD]',
    checkBorder: 'border-[#3B82F6]',
    checkBg: 'bg-[#3B82F6] text-white',
    timeBadge: 'bg-white/90 text-[#1E40AF] dark:bg-black/30 dark:text-[#93C5FD]',
  },
  // 2. Rose (റോസ്)
  {
    name: 'rose',
    container: 'bg-[#FDF2F8] hover:bg-[#FCE7F3] border-[#FBCFE8] dark:bg-[#831843]/35 dark:border-pink-700/40',
    text: 'text-[#9D174D] dark:text-[#F9A8D4]',
    checkBorder: 'border-[#EC4899]',
    checkBg: 'bg-[#EC4899] text-white',
    timeBadge: 'bg-white/90 text-[#9D174D] dark:bg-black/30 dark:text-[#F9A8D4]',
  },
  // 3. White (വൈറ്റ്)
  {
    name: 'white',
    container: 'bg-white hover:bg-gray-50 border-[#E2E8F0] dark:bg-[#1C2237] dark:border-white/10 shadow-2xs',
    text: 'text-gray-900 dark:text-gray-100',
    checkBorder: 'border-gray-400 dark:border-gray-500',
    checkBg: 'bg-taskati-navy dark:bg-white text-white dark:text-taskati-navy',
    timeBadge: 'bg-gray-100 text-gray-700 dark:bg-black/30 dark:text-gray-300',
  },
  // 4. Violet (വയലറ്റ്)
  {
    name: 'violet',
    container: 'bg-[#F5F3FF] hover:bg-[#EDE9FE] border-[#DDD6FE] dark:bg-[#4C1D95]/35 dark:border-purple-700/40',
    text: 'text-[#6D28D9] dark:text-[#C4B5FD]',
    checkBorder: 'border-[#8B5CF6]',
    checkBg: 'bg-[#8B5CF6] text-white',
    timeBadge: 'bg-white/90 text-[#6D28D9] dark:bg-black/30 dark:text-[#C4B5FD]',
  },
  // 5. Dark Blue (ഡാർക്ക് ബ്ലൂ)
  {
    name: 'darkblue',
    container: 'bg-[#1E293B] hover:bg-[#1A2434] border-[#0F172A] text-white dark:bg-[#0B132B] dark:border-blue-900/60 shadow-xs',
    text: 'text-white dark:text-white',
    checkBorder: 'border-blue-400',
    checkBg: 'bg-[#3B82F6] text-white',
    timeBadge: 'bg-white/20 text-white dark:bg-white/10 dark:text-blue-200',
  },
];

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

  const handleCheck = (taskId: string, completed: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([40]);
    if (!completed) {
      playChimeSound();
      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch (err) {}
    }
    onToggle(taskId);
  };

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col justify-between space-y-3.5 transition-colors">
      {/* Box Header */}
      <div className="flex items-center justify-between pb-2 border-b border-taskati-border/60 dark:border-white/5">
        <h4 className="text-xs font-bold text-taskati-navy dark:text-white uppercase tracking-wider">{title}</h4>
        <span className="px-2.5 py-0.5 rounded-full bg-taskati-blue text-white text-[10px] font-bold">
          {t.details}
        </span>
      </div>

      {/* Colorful Task Pill Rows: Blue, Rose, White, Violet, Dark Blue */}
      <div className="space-y-2.5 flex-1 min-h-[140px]">
        {tasks.map((task, idx) => {
          const style = VIBRANT_ROW_STYLES[idx % VIBRANT_ROW_STYLES.length];
          const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

          return (
            <div
              key={task.id}
              onClick={() => {
                if (task.type === 'counter' && onOpenCounter) {
                  onOpenCounter(task);
                } else if (task.type === 'reading' && onOpenReading) {
                  onOpenReading(task);
                }
              }}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 ${
                style.container
              } ${task.completed ? 'opacity-65' : 'shadow-2xs hover:scale-[1.01]'}`}
            >
              {/* Left: Circle Check + Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Circle Checkbox */}
                <button
                  type="button"
                  onClick={(e) => handleCheck(task.id, task.completed, e)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    task.completed
                      ? `${style.checkBg} shadow-xs`
                      : `border-2 ${style.checkBorder} bg-white dark:bg-[#1E293B] hover:scale-105`
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Title */}
                <span
                  className={`text-xs font-bold truncate transition-colors ${style.text} ${
                    task.completed ? 'opacity-85' : ''
                  }`}
                >
                  {displayTitle}
                </span>

                {/* Interactive Pills */}
                {task.type === 'counter' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCounter && onOpenCounter(task);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white/90 text-taskati-blue text-[10px] font-bold shadow-2xs hover:scale-105 transition-transform flex items-center gap-0.5"
                  >
                    <Hash className="w-2.5 h-2.5" />
                    <span>{task.counterCurrent || 0}/100</span>
                  </span>
                )}
                {task.type === 'reading' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReading && onOpenReading(task);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-white/90 text-taskati-purple text-[10px] font-bold shadow-2xs hover:scale-105 transition-transform flex items-center gap-0.5"
                  >
                    <BookOpen className="w-2.5 h-2.5" />
                    <span>{language === 'ml' ? 'ഓപ്ഷനുകൾ' : 'Options'}</span>
                  </span>
                )}
              </div>

              {/* Right: Scheduled Time Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0 shadow-2xs ${style.timeBadge}`}>
                <Clock className="w-2.5 h-2.5 opacity-70" />
                <span>{task.time}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer: + Add new task */}
      <button
        type="button"
        onClick={onAddNew}
        className="pt-2 text-left text-xs font-bold text-taskati-blue hover:underline flex items-center justify-between border-t border-taskati-border/60 dark:border-white/5 transition-colors"
      >
        <span>{t.addNewTask}</span>
        <span className="text-sm">+</span>
      </button>
    </div>
  );
}
