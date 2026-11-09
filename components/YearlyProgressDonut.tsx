'use client';

import React from 'react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface YearlyProgressDonutProps {
  completed: number;
  total: number;
  language: Language;
}

export default function YearlyProgressDonut({ completed, total, language }: YearlyProgressDonutProps) {
  const t = TRANSLATIONS[language];
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col items-center justify-between text-center space-y-3">
      {/* Header */}
      <h3 className="text-sm font-bold text-taskati-navy dark:text-white self-start">
        {t.yearlyProgress}
      </h3>

      {/* Donut Chart matching Taskati image */}
      <div className="relative w-36 h-36 my-1 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Base track */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#F1F3F9"
            strokeWidth="7"
            fill="transparent"
            className="dark:stroke-white/10"
          />
          {/* Multi-color gradient stroke */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="url(#taskatiDonutGradient)"
            strokeWidth="7"
            strokeDasharray={238.76}
            strokeDashoffset={238.76 - (238.76 * percentage) / 100}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="taskatiDonutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5051F9" />
              <stop offset="50%" stopColor="#744BE4" />
              <stop offset="100%" stopColor="#E84E89" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-taskati-navy dark:text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-taskati-muted dark:text-gray-400 mt-0.5">
            {t.mainGoals}
          </span>
        </div>
      </div>

      {/* Legend below matching image */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full text-[10px] font-semibold text-taskati-muted dark:text-gray-400 pt-1 border-t border-taskati-border/50 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#5051F9]" />
          <span className="truncate">{t.workProjects}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E84E89]" />
          <span className="truncate">{t.readingLegend}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00B171]" />
          <span className="truncate">{t.learningLegend}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#744BE4]" />
          <span className="truncate">{t.designUi}</span>
        </div>
      </div>
    </div>
  );
}
