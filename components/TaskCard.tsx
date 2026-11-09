'use client';

import React from 'react';
import { Task } from '@/types/task';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Check, Clock, BookOpen, Hash, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  language: Language;
  onToggle: (taskId: string) => void;
  onOpenCounter?: (task: Task) => void;
  onOpenReading?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

// Color theme definitions matching the user's uploaded image:
// 1: Blue, 2: Purple, 3: Pink, 4: Amber/Gold, 5: Teal/Emerald
type PillColorTheme = {
  fill: string;
  track: string;
  darkTrack: string;
  badge: string;
  textAccent: string;
};

const COLOR_THEMES: Record<string, PillColorTheme> = {
  blue: {
    fill: 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6]',
    track: 'bg-[#DBEAFE]',
    darkTrack: 'bg-[#1E293B]',
    badge: 'bg-white text-[#2563EB]',
    textAccent: 'text-[#1D4ED8] dark:text-[#93C5FD]'
  },
  purple: {
    fill: 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6]',
    track: 'bg-[#EDE9FE]',
    darkTrack: 'bg-[#2A2346]',
    badge: 'bg-white text-[#7C3AED]',
    textAccent: 'text-[#6D28D9] dark:text-[#C4B5FD]'
  },
  pink: {
    fill: 'bg-gradient-to-r from-[#DB2777] to-[#EC4899]',
    track: 'bg-[#FCE7F3]',
    darkTrack: 'bg-[#381E2E]',
    badge: 'bg-white text-[#DB2777]',
    textAccent: 'text-[#BE185D] dark:text-[#F9A8D4]'
  },
  amber: {
    fill: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]',
    track: 'bg-[#FEF3C7]',
    darkTrack: 'bg-[#372A18]',
    badge: 'bg-white text-[#D97706]',
    textAccent: 'text-[#B45309] dark:text-[#FDE68A]'
  },
  teal: {
    fill: 'bg-gradient-to-r from-[#0D9488] to-[#14B8A6]',
    track: 'bg-[#CCFBF1]',
    darkTrack: 'bg-[#16302B]',
    badge: 'bg-white text-[#0D9488]',
    textAccent: 'text-[#0F766E] dark:text-[#5EEAD4]'
  }
};

// Deterministically assign one of the 5 vibrant colors based on task ID
function getThemeForTask(taskId: string): PillColorTheme {
  const map: Record<string, string> = {
    'auradu-shaduliyy': 'purple',
    'yaseen': 'blue',
    '100-isthigfar': 'pink',
    '100-thasbeeh': 'amber',
    '100-swalath': 'purple',
    'english-listening': 'blue',
    'english-speaking': 'amber',
    'qiraath': 'teal',
    'daily-reading': 'purple',
    'haddad': 'teal',
    'asmaul-husna': 'pink',
    'mulk': 'blue',
    'fathiha': 'amber'
  };

  const key = map[taskId] || 'blue';
  return COLOR_THEMES[key];
}

export default function TaskCard({
  task,
  language,
  onToggle,
  onOpenCounter,
  onOpenReading,
  onDelete,
}: TaskCardProps) {
  const t = TRANSLATIONS[language];
  const theme = getThemeForTask(task.id);

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([45]);

    if (!task.completed) {
      playChimeSound();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    onToggle(task.id);
  };

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

  const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;
  const displaySubtitle = language === 'ml' && task.malayalamSubtitle ? task.malayalamSubtitle : task.subtitle;

  // Calculate progress percentage
  let progressPct = 0;
  if (task.completed) {
    progressPct = 100;
  } else if (task.type === 'counter' && task.counterTarget) {
    progressPct = Math.min(95, Math.round(((task.counterCurrent || 0) / task.counterTarget) * 100));
  } else if (task.type === 'reading' && task.readingDetails) {
    progressPct = Math.min(95, Math.round(((task.readingDetails.minutesSpent || 0) / (task.readingDetails.targetMinutes || 25)) * 100));
  } else {
    progressPct = 0;
  }

  // Minimum visible filled width for pending tasks so the left badge sits inside the color
  const fillWidth = task.completed ? 100 : Math.max(progressPct, 0);

  return (
    <div
      onClick={handleCheckClick}
      className={`group relative w-full rounded-full transition-all duration-300 shadow-sm hover:shadow-taskati-float cursor-pointer select-none overflow-hidden border border-black/5 dark:border-white/10 ${
        theme.track
      } dark:${theme.darkTrack}`}
      style={{ minHeight: '74px' }}
    >
      {/* Dynamic Animated Color Fill (matching user image) */}
      <div
        className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ease-out ${theme.fill} shadow-inner flex items-center justify-end pr-4`}
        style={{
          width: task.completed ? '100%' : `${fillWidth}%`,
          opacity: task.completed ? 1 : 0.95
        }}
      >
        {/* If partially filled in counter/reading mode, show percent marker inside fill */}
        {!task.completed && fillWidth > 35 && (
          <span className="text-white text-xs font-black tracking-wider drop-shadow-sm mr-2 hidden sm:inline">
            {fillWidth}%
          </span>
        )}
      </div>

      {/* Main Content Layer (Above the Fill) */}
      <div className="relative z-10 w-full h-full min-h-[74px] px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left Section: Circle Avatar & Titles */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Circular Indicator / Toggle Icon */}
          <button
            type="button"
            onClick={handleCheckClick}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 shadow-md ${
              task.completed
                ? 'bg-white text-emerald-600 ring-2 ring-white/80'
                : 'bg-white dark:bg-[#1E293B] text-taskati-navy dark:text-white hover:scale-105'
            }`}
          >
            {task.completed ? (
              <Check className="w-6 h-6 stroke-[3] text-emerald-600 animate-pop" />
            ) : task.type === 'counter' ? (
              <Hash className="w-5 h-5 text-taskati-pink" />
            ) : task.type === 'reading' ? (
              <BookOpen className="w-5 h-5 text-taskati-purple" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-taskati-muted/60 dark:border-white/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-taskati-blue transition-colors" />
              </div>
            )}
          </button>

          {/* Titles & Subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm sm:text-base font-black truncate transition-colors ${
                  task.completed
                    ? 'text-white line-through drop-shadow-sm'
                    : fillWidth > 50
                    ? 'text-white drop-shadow-sm'
                    : 'text-taskati-navy dark:text-white'
                }`}
              >
                {displayTitle}
              </h4>

              {task.priority === 'high' && !task.completed && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/90 text-rose-600 shadow-xs">
                  ★
                </span>
              )}
            </div>

            {/* Arabic Script & Subtitle */}
            <div className="flex items-center gap-2 mt-0.5 truncate">
              {task.arabicTitle && (
                <span
                  className={`text-xs sm:text-sm font-serif font-bold tracking-wide dir-rtl flex-shrink-0 ${
                    task.completed
                      ? 'text-white/90 line-through'
                      : fillWidth > 50
                      ? 'text-white/90'
                      : 'text-taskati-purple dark:text-purple-300'
                  }`}
                >
                  {task.arabicTitle}
                </span>
              )}
              {displaySubtitle && (
                <span
                  className={`text-[11px] truncate ${
                    task.completed
                      ? 'text-white/80'
                      : fillWidth > 50
                      ? 'text-white/80'
                      : 'text-taskati-muted dark:text-gray-400'
                  }`}
                >
                  {displaySubtitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Time Pill, Progress % & Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Dhikr Counter Pill Button */}
          {task.type === 'counter' && onOpenCounter && !task.completed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCounter(task);
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#181C33] text-taskati-pink hover:bg-taskati-pink hover:text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 active:scale-95"
            >
              <Hash className="w-3 h-3" />
              <span>{task.counterCurrent || 0}/{task.counterTarget || 100}</span>
            </button>
          )}

          {/* Reading Options Pill Button */}
          {task.type === 'reading' && onOpenReading && !task.completed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReading(task);
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-[#181C33] text-taskati-purple hover:bg-taskati-purple hover:text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 active:scale-95"
            >
              <BookOpen className="w-3 h-3" />
              <span>{t.options}</span>
            </button>
          )}

          {/* Scheduled Time Pill */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
              task.completed
                ? 'bg-white/20 text-white backdrop-blur-xs'
                : 'bg-white dark:bg-[#181C33] text-taskati-navy dark:text-gray-200'
            }`}
          >
            <Clock className="w-3 h-3 text-taskati-blue" />
            <span>{formatTime(task.time)}</span>
          </span>

          {/* Big Bold Progress Percentage / 100% Badge (Exact user image style) */}
          <div
            className={`min-w-[48px] sm:min-w-[56px] text-right font-black text-sm sm:text-base tracking-tight ${
              task.completed
                ? 'text-white drop-shadow-sm font-mono'
                : fillWidth > 80
                ? 'text-white drop-shadow-sm font-mono'
                : 'text-taskati-navy dark:text-white font-mono'
            }`}
          >
            {task.completed ? (
              <span className="flex items-center justify-end gap-1 text-white">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                100%
              </span>
            ) : task.type === 'counter' && task.counterTarget ? (
              `${Math.round(((task.counterCurrent || 0) / task.counterTarget) * 100)}%`
            ) : (
              <span className="text-xs font-bold opacity-60">⏳</span>
            )}
          </div>

          {/* Delete action on hover */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-taskati-muted hover:text-red-500 transition-all text-xs"
              title="Delete task"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
