'use client';

import React from 'react';
import { Task } from '@/types/task';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Check, Clock, BookOpen, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  language: Language;
  onToggle: (taskId: string) => void;
  onOpenCounter?: (task: Task) => void;
  onOpenReading?: (task: Task) => void;
}

// 4 Exact Colors matching the user's uploaded image (media_1794247297095_a3389575.jpg):
// 1. Blue: #1E6FF5 on #C6DCFE
// 2. Purple: #8644E2 on #E4D8FC
// 3. Pink: #E2389E on #FCD4EC
// 4. Amber/Yellow: #EAA014 on #FDE8C7
const CAPSULE_THEMES = [
  // 1. Blue (55% from image)
  {
    fill: 'bg-[#1E6FF5]',
    track: 'bg-[#C6DCFE] dark:bg-[#152B52]',
    defaultPct: 55,
  },
  // 2. Purple (80% from image)
  {
    fill: 'bg-[#8644E2]',
    track: 'bg-[#E4D8FC] dark:bg-[#2B1B4A]',
    defaultPct: 80,
  },
  // 3. Pink (65% from image)
  {
    fill: 'bg-[#E2389E]',
    track: 'bg-[#FCD4EC] dark:bg-[#3D1830]',
    defaultPct: 65,
  },
  // 4. Amber / Yellow (75% from image)
  {
    fill: 'bg-[#EAA014]',
    track: 'bg-[#FDE8C7] dark:bg-[#3B2C15]',
    defaultPct: 75,
  },
];

// Map task IDs deterministically to one of the 4 themes
function getThemeForTask(taskId: string) {
  const map: Record<string, number> = {
    'auradu-shaduliyy': 0, // Blue
    'yaseen': 1,           // Purple
    '100-isthigfar': 2,    // Pink
    '100-thasbeeh': 3,     // Amber
    '100-swalath': 0,      // Blue
    'english-listening': 1,// Purple
    'english-speaking': 2, // Pink
    'qiraath': 3,          // Amber
    'daily-reading': 0,    // Blue
    'haddad': 1,           // Purple
    'asmaul-husna': 2,     // Pink
    'mulk': 3,             // Amber
    'fathiha': 0           // Blue
  };

  const index = map[taskId] ?? 0;
  return CAPSULE_THEMES[index % CAPSULE_THEMES.length];
}

export default function TaskCard({
  task,
  language,
  onToggle,
  onOpenCounter,
  onOpenReading,
}: TaskCardProps) {
  const t = TRANSLATIONS[language];
  const theme = getThemeForTask(task.id);

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([40]);

    if (!task.completed) {
      playChimeSound();
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.7 }
        });
      } catch (err) {}
    }

    onToggle(task.id);
  };

  const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

  // Percentage calculation matching image styling:
  // When completed: 100%
  // When pending: dynamic if counter/reading, else theme default (55%, 80%, 65%, 75%)
  let pct = theme.defaultPct;
  if (task.completed) {
    pct = 100;
  } else if (task.type === 'counter' && task.counterTarget) {
    pct = Math.max(theme.defaultPct, Math.round(((task.counterCurrent || 0) / task.counterTarget) * 100));
  } else if (task.type === 'reading' && task.readingDetails) {
    pct = Math.max(theme.defaultPct, Math.round(((task.readingDetails.minutesSpent || 0) / (task.readingDetails.targetMinutes || 25)) * 100));
  }

  return (
    <div
      onClick={handleCheckClick}
      className={`relative w-full rounded-full h-12 sm:h-13 transition-all duration-300 cursor-pointer select-none overflow-hidden ${theme.track} shadow-2xs hover:shadow-xs group`}
    >
      {/* Saturated Color Fill Capsule (matching user's uploaded image exactly) */}
      <div
        className={`absolute left-0 top-0 bottom-0 rounded-full ${theme.fill} transition-all duration-500 ease-out flex items-center justify-between px-3 sm:px-4 z-10`}
        style={{ width: task.completed ? '100%' : `${pct}%` }}
      >
        {/* Left: White Pill / Avatar with Toggle Circle */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* White Capsule / Pill matching image */}
          <button
            type="button"
            onClick={handleCheckClick}
            className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-xs hover:scale-105 transition-transform"
          >
            {task.completed ? (
              <Check className="w-3.5 h-3.5 text-taskati-navy stroke-[3]" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-gray-400" />
            )}
          </button>

          {/* Title in White Text */}
          <div className="min-w-0 truncate">
            <span className={`text-xs sm:text-sm font-bold text-white tracking-wide truncate block drop-shadow-2xs ${task.completed ? 'line-through opacity-85' : ''}`}>
              {displayTitle}
            </span>
          </div>
        </div>

        {/* Center / Right of Fill: Bold White Percentage */}
        <span className="text-white text-xs sm:text-sm font-black font-mono tracking-tight drop-shadow-2xs pl-2">
          {pct}%
        </span>
      </div>

      {/* Unfilled Part Layer (Right side of capsule): Scheduled Time */}
      <div className="absolute right-3.5 top-0 bottom-0 flex items-center justify-end z-20 pointer-events-none">
        <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-gray-600 dark:text-gray-300" />
          <span>{task.time}</span>
        </span>
      </div>
    </div>
  );
}
