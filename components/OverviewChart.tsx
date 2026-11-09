'use client';

import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '@/lib/translations';

interface OverviewChartProps {
  language: Language;
}

export default function OverviewChart({ language }: OverviewChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const t = TRANSLATIONS[language];

  // Data for the 6 bar clusters matching Taskati screenshot
  const chartData = [
    { label: 'Jan', finished: 65, newTasks: 35, completed: 48 },
    { label: 'Feb', finished: 45, newTasks: 85, completed: 60 },
    { label: 'Mar', finished: 78, newTasks: 42, completed: 68 },
    { label: 'Apr', finished: 90, newTasks: 30, completed: 72 },
    { label: 'May', finished: 55, newTasks: 80, completed: 62 },
    { label: 'Jun', finished: 85, newTasks: 65, completed: 78 },
  ];

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-taskati-navy dark:text-white">{t.overview}</h3>
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-taskati-muted dark:text-gray-400">
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
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-taskati-blue rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Multi-Bar Chart */}
      <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 px-2">
        {chartData.map((col, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
            {/* Bars cluster */}
            <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36">
              {/* Bar 1: Blue / Navy */}
              <div
                className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-blue-700 to-indigo-600 transition-all duration-500 group-hover:opacity-90"
                style={{ height: `${col.finished}%` }}
                title={`Finished: ${col.finished}%`}
              />
              {/* Bar 2: Pink / Rose */}
              <div
                className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-pink-600 to-rose-400 transition-all duration-500 group-hover:opacity-90"
                style={{ height: `${col.newTasks}%` }}
                title={`Dhikr: ${col.newTasks}%`}
              />
              {/* Bar 3: Purple / Violet */}
              <div
                className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-purple-600 to-violet-400 transition-all duration-500 group-hover:opacity-90"
                style={{ height: `${col.completed}%` }}
                title={`Completed: ${col.completed}%`}
              />
            </div>
            {/* Label */}
            <span className="text-[10px] font-bold text-taskati-muted dark:text-gray-400">
              {col.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend matching Taskati screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-taskati-muted dark:text-gray-400 pt-1 border-t border-taskati-border dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>{t.tasksFinished}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500" />
          <span>{t.newTasks}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>{t.completedLegend}</span>
        </div>
      </div>
    </div>
  );
}
