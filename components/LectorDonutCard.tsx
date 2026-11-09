'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language } from '@/lib/translations';

interface LectorDonutCardProps {
  tasks: Task[];
  language: Language;
}

export default function LectorDonutCard({ tasks, language }: LectorDonutCardProps) {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length || 13;
  const pct = Math.round((completed / total) * 100);

  // Segments matching image: Pink 55%, Purple 33%, Yellow 12%
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  const pinkLen = (55 / 100) * circumference;
  const purpleLen = (33 / 100) * circumference;
  const yellowLen = (12 / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#151932] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {language === 'ml' ? 'ദിനചര്യ വിതരണം' : 'Routine Ratio'}
        </h3>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
          {pct}% Done
        </span>
      </div>

      {/* Tri-color Donut Ring matching the image */}
      <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-1">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Segment 1: Pink (55%) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#EC4899"
            strokeWidth="11"
            strokeDasharray={`${pinkLen} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* Segment 2: Purple (33%) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#8B5CF6"
            strokeWidth="11"
            strokeDasharray={`${purpleLen} ${circumference}`}
            strokeDashoffset={`-${pinkLen}`}
            strokeLinecap="round"
          />

          {/* Segment 3: Yellow/Amber (12%) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#F59E0B"
            strokeWidth="11"
            strokeDasharray={`${yellowLen} ${circumference}`}
            strokeDashoffset={`-${pinkLen + purpleLen}`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900 dark:text-white font-mono">
            {pct}%
          </span>
          <span className="text-[10px] font-bold text-gray-400">
            {language === 'ml' ? 'സജീവം' : 'Active'}
          </span>
        </div>
      </div>

      {/* Bottom 3 Stats matching image: 55%, 33%, 12% */}
      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-100 dark:border-white/5">
        <div>
          <span className="text-sm font-black text-pink-500 font-mono block">55%</span>
          <span className="text-[10px] font-semibold text-gray-400 truncate block">
            {language === 'ml' ? 'ആത്മീയവ' : 'Spiritual'}
          </span>
        </div>
        <div>
          <span className="text-sm font-black text-purple-500 font-mono block">33%</span>
          <span className="text-[10px] font-semibold text-gray-400 truncate block">
            {language === 'ml' ? 'ദിക്റുകൾ' : 'Dhikr'}
          </span>
        </div>
        <div>
          <span className="text-sm font-black text-amber-500 font-mono block">12%</span>
          <span className="text-[10px] font-semibold text-gray-400 truncate block">
            {language === 'ml' ? 'പഠനം' : 'Learning'}
          </span>
        </div>
      </div>
    </div>
  );
}
