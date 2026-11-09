'use client';

import React from 'react';
import { Language } from '@/lib/translations';

interface StillJourneyCardProps {
  streak: number;
  completedCount: number;
  totalCount: number;
  language: Language;
}

export default function StillJourneyCard({
  streak,
  completedCount,
  totalCount,
  language,
}: StillJourneyCardProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Weekday abbreviations
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayDayIndex = new Date().getDay();

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <h3 className="text-base font-bold text-white tracking-wide">
        {language === 'ml' ? 'നിങ്ങളുടെ ആത്മീയ യാത്ര' : language === 'ar' ? 'رحلتك اليومية' : 'Your Journey'}
      </h3>

      {/* Dark Glowing Card matching screenshot */}
      <div className="still-glass rounded-4xl p-5 shadow-still-card space-y-4 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Streak Header: Big 28 + Days Streak + Fire */}
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black text-white tracking-tight drop-shadow-md">
            {streak}
          </span>
          <span className="text-sm font-bold text-white/90">
            {language === 'ml' ? 'ദിവസത്തെ തുടർച്ച' : language === 'ar' ? 'أيام متواصلة' : 'Days Streak'}
          </span>
          <span className="text-2xl animate-pulse ml-auto">🔥</span>
        </div>

        {/* Glowing Lavender Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B6EDD] to-[#A58BF8] shadow-still-glow transition-all duration-700"
              style={{ width: `${Math.max(percentage, 8)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-white/60">
            <span>{completedCount} / {totalCount} {language === 'ml' ? 'പൂർത്തിയായി' : 'Completed'}</span>
            <span>{percentage}%</span>
          </div>
        </div>

        {/* Bottom row: Keep it glowing! & Weekday Pills */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-white/70 font-medium">
            {language === 'ml' ? 'തുടർച്ച നിലനിർത്തുക!' : language === 'ar' ? 'حافظ على استمرارك!' : 'Keep it glowing!'}
          </span>

          {/* Weekday indicators */}
          <div className="flex items-center gap-1">
            {days.map((day, idx) => {
              const isToday = idx === todayDayIndex;
              return (
                <span
                  key={idx}
                  className={`w-6 h-7 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                    isToday
                      ? 'bg-[#8F73DF] text-white shadow-still-glow'
                      : 'text-white/40'
                  }`}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
