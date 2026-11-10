'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language } from '@/lib/translations';
import {
  CheckCircle2,
  Clock,
  Crown,
  Heart,
  Zap,
  Sparkles,
  BookOpen,
  Bell,
  Quote,
  Check,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';

interface LectorTimelineCardProps {
  tasks: Task[];
  language: Language;
  streak: number;
  onToggle: (taskId: string) => void;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
}

export default function LectorTimelineCard({
  tasks,
  language,
  streak,
  onToggle,
  onOpenCounter,
  onOpenReading,
}: LectorTimelineCardProps) {
  // Period tab for the Habit Report: 'daily' | 'weekly' | 'monthly'
  const [habitPeriod, setHabitPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Highlight top 5 key routines for timeline
  const timelineTasks = tasks.slice(0, 5);

  const colors = [
    { bg: 'bg-[#FF4B8B]', text: 'text-[#FF4B8B]', border: 'border-[#FF4B8B]' },
    { bg: 'bg-[#7A5AF8]', text: 'text-[#7A5AF8]', border: 'border-[#7A5AF8]' },
    { bg: 'bg-[#2E90FA]', text: 'text-[#2E90FA]', border: 'border-[#2E90FA]' },
    { bg: 'bg-[#F79009]', text: 'text-[#F79009]', border: 'border-[#F79009]' },
    { bg: 'bg-[#12B76A]', text: 'text-[#12B76A]', border: 'border-[#12B76A]' },
  ];

  const total = tasks.length || 13;
  const completed = tasks.filter((t) => t.completed).length;
  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const spiritualDone = spiritualTasks.filter((t) => t.completed).length;

  // Next upcoming pending routine
  const nextPending = tasks.find((t) => !t.completed);

  // Quran Tilawat Routines
  const quranSurahs = [
    { id: 'yaseen', name: language === 'ml' ? 'സൂറത്തു യാസീൻ' : 'Surah Yaseen', time: '06:15 AM' },
    { id: 'mulk', name: language === 'ml' ? 'സൂറത്തുൽ മുൽക്' : 'Surah Mulk', time: '09:30 PM' },
    { id: 'fathiha', name: language === 'ml' ? 'സൂറത്തുൽ ഫാത്തിഹ' : 'Surah Fathiha', time: '10:00 PM' },
  ];

  return (
    <div className="bg-white dark:bg-[#151932] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-5 transition-colors">
      {/* 1. Recent Activities / Timeline Header */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {language === 'ml' ? 'സമയക്രമ ടൈംലൈൻ (Timeline)' : 'Recent Activities'}
        </h3>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
          Live Schedule
        </span>
      </div>

      {/* 2. Timeline items (NO LINE-THROUGH!) */}
      <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-white/5">
        {timelineTasks.map((task, idx) => {
          const col = colors[idx % colors.length];
          const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

          return (
            <div
              key={task.id}
              onClick={() => {
                if (task.type === 'counter') {
                  onOpenCounter(task);
                } else if (task.type === 'reading') {
                  onOpenReading(task);
                } else {
                  onToggle(task.id);
                }
              }}
              className="flex items-start gap-3 relative cursor-pointer group active:opacity-75 transition-opacity"
            >
              {/* Circular Dot Badge */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(task.id);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110 shadow-xs ${
                  task.completed ? 'bg-emerald-500 text-white' : `${col.bg} text-white`
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Title & Details (Clean text without strikethrough!) */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold truncate transition-colors ${
                      task.completed
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-gray-800 dark:text-gray-200 group-hover:text-purple-600'
                    }`}
                  >
                    {displayTitle}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5 flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {task.time}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">
                  {task.arabicTitle || task.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 3. KEY HABIT OVERVIEW (WITH DAILY / WEEKLY / MONTHLY TABS) */}
      {/* ======================================================== */}
      <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
        {/* Header with Clickable Period Switcher Tabs */}
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-pink-500" />
            <span>{language === 'ml' ? 'ശീലങ്ങളുടെ റിപ്പോർട്ട്' : 'Habit Report'}</span>
          </h4>

          {/* 3 Clickable Period Pills: Day / Week / Month */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-0.5 rounded-xl text-[10px] font-bold">
            {[
              { id: 'daily', label: language === 'ml' ? 'ദിവസം' : 'Day' },
              { id: 'weekly', label: language === 'ml' ? 'ആഴ്ച' : 'Week' },
              { id: 'monthly', label: language === 'ml' ? 'മാസം' : 'Month' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setHabitPeriod(p.id as any)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  habitPeriod === p.id
                    ? 'bg-gradient-to-r from-[#FF4B8B] to-[#7B4EE4] text-white shadow-2xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Squircle Tiles updating based on clicked period! */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Tile 1: Deep Indigo (#2B2965) */}
          <div className="rounded-2xl p-3 bg-[#2B2965] text-white shadow-xs flex flex-col justify-between h-20 cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
            <div>
              <span className="text-base font-black font-mono leading-none block">
                {habitPeriod === 'daily'
                  ? `${spiritualDone} / ${spiritualTasks.length}`
                  : habitPeriod === 'weekly'
                  ? '68 / 70'
                  : '280 / 300'}
              </span>
              <span className="text-[9px] text-white/80 font-medium truncate block pt-0.5">
                {language === 'ml' ? 'ആത്മീയവ (Spiritual)' : 'Spiritual Tasks'}
              </span>
            </div>
          </div>

          {/* Tile 2: Royal Blue (#5376F8) */}
          <div
            onClick={() => {
              const counterTask = tasks.find((t) => t.type === 'counter');
              if (counterTask) onOpenCounter(counterTask);
            }}
            className="rounded-2xl p-3 bg-[#5376F8] text-white shadow-xs flex flex-col justify-between h-20 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <div>
              <span className="text-base font-black font-mono leading-none block">
                {habitPeriod === 'daily'
                  ? '300'
                  : habitPeriod === 'weekly'
                  ? '2,100'
                  : '9,000'}
              </span>
              <span className="text-[9px] text-white/80 font-medium truncate block pt-0.5">
                {language === 'ml' ? 'ദിക്റ് (Dhikr Count)' : 'Daily Tasbeeh'}
              </span>
            </div>
          </div>

          {/* Tile 3: Medium Purple / Violet (#7F44B8) */}
          <div
            onClick={() => {
              const readingTask = tasks.find((t) => t.type === 'reading');
              if (readingTask) onOpenReading(readingTask);
            }}
            className="rounded-2xl p-3 bg-[#7F44B8] text-white shadow-xs flex flex-col justify-between h-20 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div>
              <span className="text-base font-black font-mono leading-none block">
                {habitPeriod === 'daily'
                  ? '25 m'
                  : habitPeriod === 'weekly'
                  ? '3.5 h'
                  : '14.8 h'}
              </span>
              <span className="text-[9px] text-white/80 font-medium truncate block pt-0.5">
                {language === 'ml' ? 'വായന (Reading)' : 'Reading Focus'}
              </span>
            </div>
          </div>

          {/* Tile 4: Rose Pink (#EB5A8E) */}
          <div className="rounded-2xl p-3 bg-[#EB5A8E] text-white shadow-xs flex flex-col justify-between h-20 cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div>
              <span className="text-base font-black font-mono leading-none block">
                {habitPeriod === 'daily'
                  ? `${streak} ${language === 'ml' ? 'ദിവസം' : 'Days'}`
                  : habitPeriod === 'weekly'
                  ? '94% Score'
                  : '90% Score'}
              </span>
              <span className="text-[9px] text-white/80 font-medium truncate block pt-0.5">
                {habitPeriod === 'daily'
                  ? (language === 'ml' ? 'തുടർച്ച (Streak)' : 'Daily Streak')
                  : (language === 'ml' ? 'വിജയശതമാനം' : 'Success Rate')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. LOWER PRODUCTIVE SECTION FILLING THE WHITE CARD SPACE */}
      {/* ======================================================== */}
      <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
        {/* A. Next Routine Live Countdown Pill */}
        {nextPending && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <div className="truncate">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {language === 'ml' ? 'അടുത്ത ദിനചര്യ' : 'Next Routine'}
                </p>
                <p className="text-xs font-black text-gray-800 dark:text-white truncate">
                  {language === 'ml' && nextPending.malayalamTitle ? nextPending.malayalamTitle : nextPending.title}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1E2538] text-[10px] font-black text-blue-600 dark:text-blue-400 font-mono shadow-2xs flex-shrink-0">
              {nextPending.time}
            </span>
          </div>
        )}

        {/* B. Quran Tilawat Quick Check Bar */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-[#1A1835] border border-purple-100 dark:border-purple-900/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'ഖുർആൻ സൂറത്തുകൾ ഓത്ത്' : 'Daily Quran Recitation'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-600">3 Surahs</span>
          </div>

          <div className="space-y-1.5">
            {quranSurahs.map((s) => {
              const matchedTask = tasks.find((t) => t.id === s.id);
              const isDone = matchedTask?.completed;

              return (
                <div
                  key={s.id}
                  onClick={() => matchedTask && onToggle(matchedTask.id)}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-[#201D3D] border border-purple-50 dark:border-white/5 cursor-pointer hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone ? 'bg-emerald-500 text-white' : 'border border-gray-300 dark:border-white/20'
                      }`}
                    >
                      {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-400">{s.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. Inspirational Daily Hadith Quote Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#F5F2FE] dark:from-[#251528] dark:to-[#1C1835] border border-pink-100 dark:border-pink-900/30 space-y-1.5">
          <div className="flex items-center gap-1 text-[#EB5A8E]">
            <Quote className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {language === 'ml' ? 'ഇന്നത്തെ നബിവചനം (ഹദീസ്)' : 'Daily Prophetic Hadith'}
            </span>
          </div>
          <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-snug italic">
            {language === 'ml'
              ? '«അല്ലാഹുവിങ്കൽ ഏറ്റവും പ്രിയപ്പെട്ട പുണ്യകർമ്മം, അല്പമാണെങ്കിലും നിത്യേന തുടരുന്നതാണ്.»'
              : '«The most beloved deeds to Allah are those done regularly, even if they are few.»'}
          </p>
          <span className="text-[9px] text-gray-400 block text-right font-medium">
            — സ്വഹീഹുൽ ബുഖാരി (Sahih al-Bukhari)
          </span>
        </div>
      </div>
    </div>
  );
}
