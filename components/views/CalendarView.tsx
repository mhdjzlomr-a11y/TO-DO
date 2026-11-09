'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, Clock, Flame, Sparkles } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  language: Language;
  streak: number;
}

export default function CalendarView({
  tasks,
  language,
  streak,
}: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const t = TRANSLATIONS[language];

  const now = new Date();
  const currentMonthName = now.toLocaleString(language === 'ml' ? 'ml-IN' : 'en-US', { month: 'long', year: 'numeric' });
  const todayDate = now.getDate();

  // Days of week
  const dayNames = language === 'ml'
    ? ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in November (30 days)
  const totalDays = 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 animate-pop">
      {/* Header */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-taskati-navy dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-taskati-blue" />
            <span>{language === 'ml' ? 'സമയക്രമവും കലണ്ടറും (Calendar)' : 'Schedule & Calendar'}</span>
          </h2>
          <p className="text-xs text-taskati-muted dark:text-gray-400 pt-1">
            {language === 'ml'
              ? 'ദിനേനയുള്ള സമയക്രമവും തുടർച്ചയായ ദിവസങ്ങളുടെ രേഖയും'
              : 'Interactive schedule tracker & habit streak calendar'}
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{streak} {language === 'ml' ? 'ദിവസത്തെ തുടർച്ച' : 'Days Streak'}</span>
        </div>
      </div>

      {/* Grid: Calendar on Left, Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-5">
          {/* Month Bar */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-taskati-navy dark:text-white capitalize">
              {currentMonthName}
            </h3>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-taskati-blue/10 text-taskati-blue">
                {language === 'ml' ? 'ഇന്ന്' : 'Today'}: {todayDate}
              </span>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-taskati-muted dark:text-gray-400 pb-2 border-b border-taskati-border/60 dark:border-white/5">
            {dayNames.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day) => {
              const isToday = day === todayDate;
              const isSelected = day === selectedDay;
              const hasActivity = day <= todayDate;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-12 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                    isSelected
                      ? 'bg-taskati-blue text-white shadow-taskati font-black scale-105'
                      : isToday
                      ? 'bg-taskati-blue/10 text-taskati-blue font-bold border border-taskati-blue/30'
                      : 'hover:bg-taskati-bg dark:hover:bg-white/5 text-taskati-navy dark:text-white'
                  }`}
                >
                  <span className="text-xs font-mono">{day}</span>
                  {hasActivity && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between pt-3 border-t border-taskati-border/60 dark:border-white/5 text-xs text-taskati-muted dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{language === 'ml' ? 'പൂർത്തിയായ ദിവസങ്ങൾ' : 'Completed Active Days'}</span>
            </span>
            <span className="font-bold text-taskati-blue">
              {language === 'ml' ? '100% ലൈഫ് ടൈം ഫ്രീ' : '100% Lifetime Free'}
            </span>
          </div>
        </div>

        {/* Selected Day Timeline Card (1 Col) */}
        <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-taskati-border/60 dark:border-white/5">
            <h4 className="text-xs font-bold text-taskati-navy dark:text-white uppercase tracking-wider">
              {language === 'ml' ? `തീയതി ${selectedDay} - സമയക്രമം` : `Day ${selectedDay} Schedule`}
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              {completedCount} Done
            </span>
          </div>

          {/* Timeline List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-taskati-bg dark:bg-white/5 border border-taskati-border/50 dark:border-white/5 text-xs"
              >
                <div className="pt-0.5">
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-taskati-muted flex-shrink-0" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-bold truncate ${task.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-taskati-navy dark:text-white'}`}>
                    {language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title}
                  </p>
                  <p className="text-[10px] text-taskati-muted font-mono">{task.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
