'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { Check, Clock, Hash, BookOpen, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StillTaskCardProps {
  task: Task;
  language: Language;
  onToggle: (taskId: string) => void;
  onOpenCounter?: (task: Task) => void;
  onOpenReading?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export default function StillTaskCard({
  task,
  language,
  onToggle,
  onOpenCounter,
  onOpenReading,
  onDelete,
}: StillTaskCardProps) {
  const t = TRANSLATIONS[language];

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([45]);
    if (!task.completed) {
      playChimeSound();
      try {
        confetti({ particleCount: 45, spread: 55, origin: { y: 0.7 } });
      } catch (err) {}
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

  return (
    <div
      onClick={handleCheck}
      className={`group relative w-full rounded-3xl p-4 transition-all duration-300 cursor-pointer select-none border ${
        task.completed
          ? 'bg-white/5 border-white/5 opacity-75'
          : 'still-glass hover:bg-white/10 hover:border-purple-400/30 shadow-still-card'
      }`}
    >
      <div className="flex items-center justify-between gap-3.5">
        {/* Left Circle Check */}
        <button
          type="button"
          onClick={handleCheck}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 shadow-sm ${
            task.completed
              ? 'bg-[#8F73DF] text-white ring-2 ring-white/20'
              : 'bg-white/10 text-white/40 border border-white/20 group-hover:border-[#A58BF8] group-hover:text-white'
          }`}
        >
          {task.completed ? (
            <Check className="w-5 h-5 stroke-[3] text-white" />
          ) : task.type === 'counter' ? (
            <Hash className="w-4 h-4 text-[#A58BF8]" />
          ) : task.type === 'reading' ? (
            <BookOpen className="w-4 h-4 text-[#A58BF8]" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-[#A58BF8] transition-colors" />
          )}
        </button>

        {/* Center Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm sm:text-base font-bold truncate transition-colors ${
                task.completed ? 'line-through text-white/50' : 'text-white'
              }`}
            >
              {displayTitle}
            </h4>

            {task.completed && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                Done
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 truncate text-xs">
            {task.arabicTitle && (
              <span
                className={`font-serif tracking-wide dir-rtl flex-shrink-0 ${
                  task.completed ? 'text-white/40 line-through' : 'text-[#B69DF8]'
                }`}
              >
                {task.arabicTitle}
              </span>
            )}
            {displaySubtitle && (
              <span className="text-white/50 truncate text-[11px]">{displaySubtitle}</span>
            )}
          </div>
        </div>

        {/* Right Action & Time */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Dhikr Counter Pill */}
          {task.type === 'counter' && onOpenCounter && !task.completed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCounter(task);
              }}
              className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/30 text-[#C4B5FD] hover:bg-[#8F73DF] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              <Hash className="w-3 h-3" />
              <span>{task.counterCurrent || 0}/{task.counterTarget || 100}</span>
            </button>
          )}

          {/* Reading Options Pill */}
          {task.type === 'reading' && onOpenReading && !task.completed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReading(task);
              }}
              className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/30 text-[#C4B5FD] hover:bg-[#8F73DF] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              <BookOpen className="w-3 h-3" />
              <span>Options</span>
            </button>
          )}

          {/* Time Badge */}
          <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#A58BF8]" />
            <span>{formatTime(task.time)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
