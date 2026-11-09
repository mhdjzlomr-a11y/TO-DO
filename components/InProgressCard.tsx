'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Plus, Hash, BookOpen } from 'lucide-react';

interface InProgressCardProps {
  tasks: Task[];
  language: Language;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
  onAddNew: () => void;
}

export default function InProgressCard({
  tasks,
  language,
  onOpenCounter,
  onOpenReading,
  onAddNew,
}: InProgressCardProps) {
  const t = TRANSLATIONS[language];

  // Pick key routines for In Progress display
  const isthigfar = tasks.find((t) => t.id === '100-isthigfar');
  const thasbeeh = tasks.find((t) => t.id === '100-thasbeeh');
  const swalath = tasks.find((t) => t.id === '100-swalath');
  const reading = tasks.find((t) => t.id === 'daily-reading');

  const items = [
    {
      task: isthigfar,
      color: 'from-[#5051F9] to-[#4344E0]',
      track: 'bg-[#EEF0FF] dark:bg-blue-950/40',
      pillColor: 'bg-[#5051F9]',
      label: language === 'ml' ? '100 ഇസ്തിഗ്ഫാർ' : language === 'ar' ? 'استغفار ١٠٠' : '100 Isthigfar',
      subtitle: language === 'ml' ? 'അസ്തഗ്ഫിറുല്ലാഹ് തസ്ബീഹ്' : language === 'ar' ? 'أستغفر الله' : 'Astaghfirullah counter',
      pct: isthigfar?.completed ? 100 : Math.round(((isthigfar?.counterCurrent || 45) / 100) * 100),
      onClick: () => isthigfar && onOpenCounter(isthigfar)
    },
    {
      task: thasbeeh,
      color: 'from-[#E84E89] to-[#D83A75]',
      track: 'bg-[#FEEBF2] dark:bg-pink-950/40',
      pillColor: 'bg-[#E84E89]',
      label: language === 'ml' ? '100 തസ്ബീഹ്' : language === 'ar' ? 'تسبيح ١٠٠' : '100 Thasbeeh',
      subtitle: language === 'ml' ? 'സുബ്ഹാനല്ലാഹി വബിഹംദിഹി' : language === 'ar' ? 'سبحان الله وبحمده' : 'SubhanAllah wa bihamdihi',
      pct: thasbeeh?.completed ? 100 : Math.round(((thasbeeh?.counterCurrent || 33) / 100) * 100),
      onClick: () => thasbeeh && onOpenCounter(thasbeeh)
    },
    {
      task: reading,
      color: 'from-[#744BE4] to-[#6338D6]',
      track: 'bg-[#F4EFFF] dark:bg-purple-950/40',
      pillColor: 'bg-[#744BE4]',
      label: language === 'ml' ? 'ദിനേനയുള്ള വായന' : language === 'ar' ? 'القراءة اليومية' : 'Daily Reading',
      subtitle: language === 'ml' ? 'തഫ്സീർ & പുസ്തകം' : language === 'ar' ? 'تفسير وكتب نافعة' : 'Islamic & Personal Growth',
      pct: reading?.completed ? 100 : 60,
      onClick: () => reading && onOpenReading(reading)
    }
  ];

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-taskati-navy dark:text-white">{t.inProgress}</h3>
        <button
          onClick={onAddNew}
          className="px-2.5 py-1 rounded-full bg-taskati-blue text-white text-[10px] font-bold shadow-xs hover:bg-taskati-blue-hover transition-all"
        >
          {t.viewAll}
        </button>
      </div>

      {/* Progress Bars matching Taskati Image */}
      <div className="space-y-3.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={item.onClick}
            className="group cursor-pointer space-y-1.5"
          >
            {/* Top row: Label pill & % */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-0.5 rounded-full text-white text-[11px] font-bold ${item.pillColor}`}>
                {item.label}
              </span>
              <span className="text-xs font-black text-taskati-navy dark:text-white font-mono">
                {item.pct}%
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-[11px] text-taskati-muted dark:text-gray-400 truncate">
              {item.subtitle}
            </p>

            {/* Progress Capsule Bar */}
            <div className={`w-full h-3 rounded-full ${item.track} overflow-hidden p-0.5`}>
              <div
                className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add New Project / Routine Button */}
      <button
        onClick={onAddNew}
        className="w-full py-2.5 px-4 rounded-2xl bg-taskati-blue text-white text-xs font-bold shadow-taskati hover:bg-taskati-blue-hover transition-all flex items-center justify-center gap-1.5 active:scale-95"
      >
        <span>{t.addNewProject}</span>
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
