'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Hash, Sparkles, BookOpen, Headphones } from 'lucide-react';

interface MainHabitsRowProps {
  tasks: Task[];
  language: Language;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
}

export default function MainHabitsRow({
  tasks,
  language,
  onOpenCounter,
  onOpenReading,
}: MainHabitsRowProps) {
  const t = TRANSLATIONS[language];

  const counterTask = tasks.find((item) => item.type === 'counter');
  const readingTask = tasks.find((item) => item.type === 'reading');

  const habits = [
    {
      id: 'dhikr',
      bg: 'bg-[#2A2C63] hover:bg-[#232555]',
      icon: <Hash className="w-3.5 h-3.5 text-white" />,
      number: '300',
      label: t.dhikrDaily,
      sub: language === 'ml' ? 'ഇസ്തിഗ്ഫാർ, തസ്ബീഹ്' : language === 'ar' ? 'أذكار يومية' : 'Daily Tasbeeh',
      onClick: () => counterTask && onOpenCounter(counterTask)
    },
    {
      id: 'quran',
      bg: 'bg-[#5051F9] hover:bg-[#4344E0]',
      icon: <Sparkles className="w-3.5 h-3.5 text-white" />,
      number: '4',
      label: t.quranTilawat,
      sub: language === 'ml' ? 'യാസീൻ, മുൽക്' : language === 'ar' ? 'يس، الملك، الفاتحة' : 'Yaseen, Mulk, Fathiha',
      onClick: undefined
    },
    {
      id: 'reading',
      bg: 'bg-[#744BE4] hover:bg-[#6338D6]',
      icon: <BookOpen className="w-3.5 h-3.5 text-white" />,
      number: '25 m',
      label: t.dailyReading,
      sub: language === 'ml' ? 'തഫ്സീർ & പുസ്തകം' : language === 'ar' ? 'تفسير وقراءة' : 'Focus Stopwatch',
      onClick: () => readingTask && onOpenReading(readingTask)
    },
    {
      id: 'english',
      bg: 'bg-[#E84E89] hover:bg-[#D83A75]',
      icon: <Headphones className="w-3.5 h-3.5 text-white" />,
      number: '2',
      label: t.englishHabits,
      sub: language === 'ml' ? 'ലിസണിംഗ് & സ്പീക്കിംഗ്' : language === 'ar' ? 'استماع وتحدث' : 'Listening & Speaking',
      onClick: undefined
    }
  ];

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-taskati-navy dark:text-white">
          {t.mainHabits} <span className="text-taskati-muted text-xs font-normal">({t.yearly})</span>
        </h3>
        <button className="text-xs font-bold text-taskati-blue hover:underline">
          {t.viewAll}
        </button>
      </div>

      {/* 4 Cards matching Taskati image */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {habits.map((h) => (
          <div
            key={h.id}
            onClick={h.onClick}
            className={`p-4 rounded-3xl text-white shadow-taskati-card cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-95 ${h.bg} flex flex-col justify-between`}
          >
            {/* Top icon */}
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mb-3">
              {h.icon}
            </div>

            {/* Middle Number */}
            <div className="text-2xl font-black tracking-tight">{h.number}</div>

            {/* Bottom Labels */}
            <div className="text-xs font-bold opacity-95 truncate mt-0.5">{h.label}</div>
            <div className="text-[10px] opacity-75 truncate">{h.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
