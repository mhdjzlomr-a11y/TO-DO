'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface OverviewChartProps {
  tasks: Task[];
  language: Language;
}

export default function OverviewChart({ tasks, language }: OverviewChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const t = TRANSLATIONS[language];

  // Calculate live daily progress stats
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length || 13;
  const currentDailyPct = Math.round((completedCount / totalCount) * 100);

  // Dynamic Data Sets for each period
  const DATA_SETS = {
    // 1. DAILY: Broken down by day time slots
    daily: [
      { label: language === 'ml' ? 'സുബ്ഹി' : language === 'ar' ? 'الفجر' : 'Fajr (05h)', finished: 85, newTasks: 60, completed: 75 },
      { label: language === 'ml' ? 'പ്രഭാതം' : language === 'ar' ? 'الصباح' : 'Mrng (08h)', finished: 70, newTasks: 40, completed: 65 },
      { label: language === 'ml' ? 'ളുഹ്ര്' : language === 'ar' ? 'الظهر' : 'Dhuhr (13h)', finished: 60, newTasks: 50, completed: 55 },
      { label: language === 'ml' ? 'അസ്വർ' : language === 'ar' ? 'العصر' : 'Asr (16h)', finished: 50, newTasks: 80, completed: 45 },
      { label: language === 'ml' ? 'മഗ്‌രിബ്' : language === 'ar' ? 'المغرب' : 'Maghrib (18h)', finished: 90, newTasks: 40, completed: 85 },
      { label: language === 'ml' ? 'ഇശാ' : language === 'ar' ? 'العشاء' : 'Isha (21h)', finished: Math.max(currentDailyPct, 40), newTasks: 65, completed: Math.max(currentDailyPct - 10, 35) },
    ],

    // 2. WEEKLY: 7 Days of the Week
    weekly: [
      { label: language === 'ml' ? 'തിങ്കൾ' : language === 'ar' ? 'الإثنين' : 'Mon', finished: 85, newTasks: 40, completed: 70 },
      { label: language === 'ml' ? 'ചൊവ്വ' : language === 'ar' ? 'الثلاثاء' : 'Tue', finished: 92, newTasks: 35, completed: 85 },
      { label: language === 'ml' ? 'ബുധൻ' : language === 'ar' ? 'الأربعاء' : 'Wed', finished: 75, newTasks: 60, completed: 65 },
      { label: language === 'ml' ? 'വ്യാഴം' : language === 'ar' ? 'الخميس' : 'Thu', finished: 88, newTasks: 50, completed: 80 },
      { label: language === 'ml' ? 'വെള്ളി' : language === 'ar' ? 'الجمعة' : 'Fri', finished: 100, newTasks: 30, completed: 95 },
      { label: language === 'ml' ? 'ശനി' : language === 'ar' ? 'السبت' : 'Sat', finished: 80, newTasks: 55, completed: 75 },
      { label: language === 'ml' ? 'ഞായർ' : language === 'ar' ? 'الأحد' : 'Sun', finished: currentDailyPct || 68, newTasks: 45, completed: currentDailyPct || 65 },
    ],

    // 3. MONTHLY: 6 Months matching Taskati screenshot exactly (Jan, Feb, Mar, Apr, May, Jun)
    monthly: [
      { label: 'Jan', finished: 65, newTasks: 35, completed: 48 },
      { label: 'Feb', finished: 45, newTasks: 85, completed: 60 },
      { label: 'Mar', finished: 78, newTasks: 42, completed: 68 },
      { label: 'Apr', finished: 90, newTasks: 30, completed: 72 },
      { label: 'May', finished: 55, newTasks: 80, completed: 62 },
      { label: 'Jun', finished: 85, newTasks: 65, completed: 78 },
    ],

    // 4. YEARLY: Quarters / Multi-Year View
    yearly: [
      { label: '2023 Q1', finished: 60, newTasks: 40, completed: 50 },
      { label: '2023 Q2', finished: 75, newTasks: 50, completed: 70 },
      { label: '2023 Q3', finished: 82, newTasks: 35, completed: 78 },
      { label: '2023 Q4', finished: 90, newTasks: 45, completed: 85 },
      { label: '2024 H1', finished: 88, newTasks: 30, completed: 82 },
      { label: '2024 H2', finished: 95, newTasks: 40, completed: 92 },
    ]
  };

  const currentData = DATA_SETS[period];

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4 transition-all">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-bold text-taskati-navy dark:text-white">
            {t.overview}
          </h3>
          <p className="text-[11px] text-taskati-muted dark:text-gray-400">
            {period === 'daily'
              ? (language === 'ml' ? 'ഇന്നത്തെ സമയ ക്രമത്തിലുള്ള വിലയിരുത്തൽ' : 'Hourly breakdown of today\'s routines')
              : period === 'weekly'
              ? (language === 'ml' ? 'ഈ ആഴ്ചയിലെ ദിനംപ്രതിയുള്ള അവലോകനം' : '7-Day weekly evaluation')
              : period === 'monthly'
              ? (language === 'ml' ? 'പ്രതിമാസ പുരോഗതി വിലയിരുത്തൽ' : 'Monthly progress overview')
              : (language === 'ml' ? 'വാർഷിക ലക്ഷ്യങ്ങളുടെ പുരോഗതി' : 'Yearly goals overview')}
          </p>
        </div>

        {/* Period Selector matching screenshot */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold text-taskati-muted dark:text-gray-400 bg-taskati-bg dark:bg-[#121528] px-3 py-1.5 rounded-2xl border border-taskati-border/60 dark:border-white/5">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`transition-all relative pb-0.5 ${
                period === p
                  ? 'text-taskati-navy dark:text-white font-bold'
                  : 'hover:text-taskati-navy dark:hover:text-white'
              }`}
            >
              <span>{t[p]}</span>
              {period === p && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-taskati-blue rounded-full shadow-xs" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Bar Graph matching exact screenshot aesthetic */}
      <div className="h-44 w-full flex items-end justify-between gap-1.5 sm:gap-2.5 pt-6 px-1">
        {currentData.map((col, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            {/* Cluster of 3 rounded vertical bars */}
            <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36">
              {/* Bar 1: Tasks Finished (Blue) */}
              <div
                className="w-1.5 sm:w-2.5 rounded-full bg-gradient-to-t from-blue-700 to-[#5051F9] transition-all duration-500 group-hover:scale-y-105"
                style={{ height: `${col.finished}%` }}
                title={`${t.tasksFinished}: ${col.finished}%`}
              />
              {/* Bar 2: Dhikr / New Tasks (Pink) */}
              <div
                className="w-1.5 sm:w-2.5 rounded-full bg-gradient-to-t from-pink-600 to-[#E84E89] transition-all duration-500 group-hover:scale-y-105"
                style={{ height: `${col.newTasks}%` }}
                title={`${t.newTasks}: ${col.newTasks}%`}
              />
              {/* Bar 3: Completed / Learning (Purple) */}
              <div
                className="w-1.5 sm:w-2.5 rounded-full bg-gradient-to-t from-purple-700 to-[#744BE4] transition-all duration-500 group-hover:scale-y-105"
                style={{ height: `${col.completed}%` }}
                title={`${t.completedLegend}: ${col.completed}%`}
              />
            </div>

            {/* X-axis Label */}
            <span className="text-[10px] font-bold text-taskati-muted dark:text-gray-400 truncate max-w-[48px] text-center">
              {col.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend matching screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-taskati-muted dark:text-gray-400 pt-2 border-t border-taskati-border dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5051F9]" />
          <span>{t.tasksFinished}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E84E89]" />
          <span>{t.newTasks}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#744BE4]" />
          <span>{t.completedLegend}</span>
        </div>
      </div>
    </div>
  );
}
