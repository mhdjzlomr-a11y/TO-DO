'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { CheckCircle2, Flame, Sparkles, TrendingUp, Clock } from 'lucide-react';

interface DailyProgressCardProps {
  tasks: Task[];
  language: Language;
  streak: number;
}

export default function DailyProgressCard({
  tasks,
  language,
  streak,
}: DailyProgressCardProps) {
  const t = TRANSLATIONS[language];
  const total = tasks.length || 13;
  const completed = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((completed / total) * 100);
  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const spiritualDone = spiritualTasks.filter((t) => t.completed).length;
  const learningTasks = tasks.filter((t) => t.category === 'learning');
  const learningDone = learningTasks.filter((t) => t.completed).length;

  // Status message based on percentage
  const getStatusText = () => {
    if (percentage === 100) {
      return language === 'ml' ? 'മാശാ അല്ലാഹ്! എല്ലാം പൂർത്തിയായി 🎉' : 'All Complete! MashaAllah 🎉';
    }
    if (percentage >= 70) {
      return language === 'ml' ? 'മികച്ച മുന്നേറ്റം! തുടരുക ⚡' : 'Great momentum! Keep it up ⚡';
    }
    if (percentage >= 40) {
      return language === 'ml' ? 'പകുതി പൂർത്തിയായി 🎯' : 'Halfway there! 🎯';
    }
    return language === 'ml' ? 'ഇന്നത്തെ ദിനചര്യകൾ തുടങ്ങാം ✨' : 'Let\'s start today\'s routines ✨';
  };

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-taskati-border/60 dark:border-white/5">
        <div>
          <h3 className="text-sm font-bold text-taskati-navy dark:text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-taskati-blue" />
            <span>{language === 'ml' ? 'ഇന്നത്തെ പുരോഗതി (Daily Progress)' : 'Daily Progress'}</span>
          </h3>
          <p className="text-[11px] text-taskati-muted dark:text-gray-400">
            {language === 'ml' ? 'തത്സമയ പൂർത്തീകരണ ഗ്രാഫ്' : 'Real-time daily evaluation'}
          </p>
        </div>

        {/* Streak Pill */}
        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 text-[10px] font-bold flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{streak} {language === 'ml' ? 'ദിവസം' : 'Days'}</span>
        </span>
      </div>

      {/* Main Gauge / Circular Ring */}
      <div className="flex items-center justify-between gap-4 py-1">
        {/* SVG Ring Gauge */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#EEF2F9"
              strokeWidth="9"
              fill="transparent"
              className="dark:stroke-white/10"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#dailyProgressGradient)"
              strokeWidth="9"
              strokeDasharray={251.32}
              strokeDashoffset={251.32 - (251.32 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="dailyProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-taskati-navy dark:text-white font-mono tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] font-bold text-taskati-muted dark:text-gray-400">
              {completed}/{total}
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 space-y-2.5">
          {/* Status Message */}
          <p className="text-xs font-bold text-taskati-blue dark:text-blue-400 leading-snug">
            {getStatusText()}
          </p>

          {/* Spiritual Category bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-taskati-muted dark:text-gray-400">
              <span>{language === 'ml' ? 'ആത്മീയവ' : 'Spiritual'}</span>
              <span className="font-bold text-taskati-navy dark:text-white">
                {spiritualDone}/{spiritualTasks.length}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-purple-100 dark:bg-purple-950/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                style={{
                  width: `${spiritualTasks.length ? Math.round((spiritualDone / spiritualTasks.length) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Learning Category bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-taskati-muted dark:text-gray-400">
              <span>{language === 'ml' ? 'പഠനം & വായന' : 'Learning'}</span>
              <span className="font-bold text-taskati-navy dark:text-white">
                {learningDone}/{learningTasks.length}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-blue-100 dark:bg-blue-950/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-500"
                style={{
                  width: `${learningTasks.length ? Math.round((learningDone / learningTasks.length) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pill */}
      <div className="pt-2 border-t border-taskati-border/60 dark:border-white/5 flex items-center justify-between text-[11px] text-taskati-muted dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{language === 'ml' ? 'ഇന്ന് ബാക്കിയുള്ളവ' : 'Remaining Today'}:</span>
        </span>
        <span className="font-bold text-taskati-navy dark:text-white">
          {total - completed} {language === 'ml' ? 'ടാസ്കുകൾ' : 'Tasks'}
        </span>
      </div>
    </div>
  );
}
