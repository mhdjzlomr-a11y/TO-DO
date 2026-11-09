'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language } from '@/lib/translations';
import { BarChart2, TrendingUp, Activity, Flame } from 'lucide-react';

interface LectorGradientCardsProps {
  tasks: Task[];
  language: Language;
  streak: number;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
}

export default function LectorGradientCards({
  tasks,
  language,
  streak,
  onOpenCounter,
  onOpenReading,
}: LectorGradientCardsProps) {
  const counterTask = tasks.find((t) => t.type === 'counter');
  const readingTask = tasks.find((t) => t.type === 'reading');
  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const spiritualDone = spiritualTasks.filter((t) => t.completed).length;

  const todayStr = new Date().toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Pink / Magenta Gradient Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-[#FF4B8B] to-[#D92A72] text-white shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
        <div className="space-y-1">
          {/* Mini vertical sparkline bars from image */}
          <div className="flex items-end gap-1 h-8 opacity-80 pb-1">
            <span className="w-1.5 h-4 bg-white rounded-full" />
            <span className="w-1.5 h-6 bg-white rounded-full" />
            <span className="w-1.5 h-3 bg-white rounded-full" />
            <span className="w-1.5 h-7 bg-white rounded-full" />
            <span className="w-1.5 h-5 bg-white rounded-full" />
          </div>
          <span className="text-[10px] font-semibold text-white/80 block">
            {language === 'ml' ? 'ആത്മീയവ' : 'Spiritual'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tight block">
            {spiritualDone} / {spiritualTasks.length}
          </span>
          <span className="text-[10px] text-white/80 font-medium block">
            {todayStr}
          </span>
        </div>
      </div>

      {/* 2. Purple / Indigo Gradient Card */}
      <div
        onClick={() => counterTask && onOpenCounter(counterTask)}
        className="rounded-3xl p-5 bg-gradient-to-r from-[#7A5AF8] to-[#5925DC] text-white shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <div className="space-y-1">
          {/* Wave sparkline graphic */}
          <div className="opacity-80 pb-1">
            <svg viewBox="0 0 40 20" className="w-10 h-7 fill-none stroke-white" strokeWidth="2.5">
              <path d="M 0 15 Q 10 0, 20 12 T 40 5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-white/80 block">
            {language === 'ml' ? 'ദിക്റ് കൗണ്ടർ' : 'Dhikr 100x'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tight block">
            300
          </span>
          <span className="text-[10px] text-white/80 font-medium block">
            {language === 'ml' ? 'ഇസ്തിഗ്ഫാർ, തസ്ബീഹ്' : 'Daily Tasbeeh'}
          </span>
        </div>
      </div>

      {/* 3. Blue / Cyan Gradient Card */}
      <div
        onClick={() => readingTask && onOpenReading(readingTask)}
        className="rounded-3xl p-5 bg-gradient-to-r from-[#2E90FA] to-[#155EEF] text-white shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
      >
        <div className="space-y-1">
          {/* Dotted curve graphic from image */}
          <div className="opacity-80 pb-1">
            <svg viewBox="0 0 40 20" className="w-10 h-7 fill-none stroke-white" strokeWidth="2.5">
              <path d="M 0 10 Q 10 18, 20 5 T 40 12" strokeLinecap="round" strokeDasharray="2 3" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold text-white/80 block">
            {language === 'ml' ? 'വായനാ കേന്ദ്രം' : 'Reading Focus'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tight block">
            25 m
          </span>
          <span className="text-[10px] text-white/80 font-medium block">
            {language === 'ml' ? 'തഫ്സീർ & ബുക്കുകൾ' : 'Stopwatch Active'}
          </span>
        </div>
      </div>

      {/* 4. Orange / Amber Gradient Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-[#F79009] to-[#DC6803] text-white shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.02] transition-transform">
        <div className="space-y-1">
          <div className="flex items-end gap-1 h-8 opacity-80 pb-1">
            <span className="w-1.5 h-6 bg-white rounded-full" />
            <span className="w-1.5 h-3 bg-white rounded-full" />
            <span className="w-1.5 h-7 bg-white rounded-full" />
            <span className="w-1.5 h-5 bg-white rounded-full" />
          </div>
          <span className="text-[10px] font-semibold text-white/80 block">
            {language === 'ml' ? 'തുടർച്ച (Streak)' : 'Daily Streak'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tight block flex items-center justify-end gap-1">
            <Flame className="w-5 h-5 fill-white text-white inline" />
            <span>{streak}</span>
          </span>
          <span className="text-[10px] text-white/80 font-medium block">
            {language === 'ml' ? 'ദിവസങ്ങൾ' : 'Days Streak'}
          </span>
        </div>
      </div>
    </div>
  );
}
