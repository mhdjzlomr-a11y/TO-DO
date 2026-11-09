'use client';

import React from 'react';
import { Language } from '@/lib/translations';
import { Hash, Sparkles, BookOpen, Headphones, Phone, Zap } from 'lucide-react';

interface StillCategoryPillsProps {
  language: Language;
  onSelectCategory: (category: 'all' | 'spiritual' | 'learning') => void;
  onOpenPhone: () => void;
  onOpenAuto: () => void;
}

export default function StillCategoryPills({
  language,
  onSelectCategory,
  onOpenPhone,
  onOpenAuto,
}: StillCategoryPillsProps) {
  const categories = [
    {
      id: 'dhikr',
      icon: <Hash className="w-5 h-5 text-[#B69DF8]" />,
      label: language === 'ml' ? 'ദിക്റുകൾ' : language === 'ar' ? 'الأذكار' : 'Dhikr',
      onClick: () => onSelectCategory('spiritual')
    },
    {
      id: 'quran',
      icon: <Sparkles className="w-5 h-5 text-[#B69DF8]" />,
      label: language === 'ml' ? 'ഖുർആൻ' : language === 'ar' ? 'القرآن' : 'Quran',
      onClick: () => onSelectCategory('spiritual')
    },
    {
      id: 'sleep',
      icon: <span className="text-xl">🌙</span>,
      label: language === 'ml' ? 'സൂറത്തുൽ മുൽക്' : language === 'ar' ? 'الملك' : 'Sleep',
      onClick: () => onSelectCategory('spiritual')
    },
    {
      id: 'reading',
      icon: <BookOpen className="w-5 h-5 text-[#B69DF8]" />,
      label: language === 'ml' ? 'വായന' : language === 'ar' ? 'القراءة' : 'Reading',
      onClick: () => onSelectCategory('learning')
    },
    {
      id: 'phone',
      icon: <Phone className="w-5 h-5 text-emerald-400" />,
      label: language === 'ml' ? 'WhatsApp' : language === 'ar' ? 'واتساب' : 'WhatsApp',
      onClick: onOpenPhone
    },
    {
      id: 'auto',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      label: language === 'ml' ? 'ഓട്ടോ അലർട്ട്' : language === 'ar' ? 'تلقائي' : 'Auto Alert',
      onClick: onOpenAuto
    }
  ];

  return (
    <div className="space-y-3">
      {/* Title */}
      <h3 className="text-base font-bold text-white tracking-wide">
        {language === 'ml' ? 'വിഭാഗങ്ങൾ' : language === 'ar' ? 'استكشف الفئات' : 'Explore Categories'}
      </h3>

      {/* Grid of Translucent Glass Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={c.onClick}
            className="still-glass rounded-3xl p-3.5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              {c.icon}
            </div>
            <span className="text-xs font-bold text-white/90 truncate w-full">
              {c.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
