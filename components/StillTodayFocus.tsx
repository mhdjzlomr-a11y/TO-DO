'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language } from '@/lib/translations';
import { Play, Hash, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import confetti from 'canvas-confetti';

interface StillTodayFocusProps {
  tasks: Task[];
  language: Language;
  onOpenCounter: (task: Task) => void;
  onToggle: (taskId: string) => void;
}

export default function StillTodayFocus({
  tasks,
  language,
  onOpenCounter,
  onToggle,
}: StillTodayFocusProps) {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  // Find featured routine (Yaseen or Auradu Shaduliyy or first uncompleted)
  const mainTask = tasks.find((t) => t.id === 'yaseen') || tasks[0];
  const isthigfar = tasks.find((t) => t.id === '100-isthigfar');
  const thasbeeh = tasks.find((t) => t.id === '100-thasbeeh');

  if (!mainTask) {
    return null;
  }

  const handleMainAction = () => {
    if (!mainTask) return;
    triggerHaptic([45]);
    if (!mainTask.completed) {
      playChimeSound();
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch (e) {}
    }
    onToggle(mainTask.id);
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <h3 className="text-base font-bold text-white tracking-wide">
        {language === 'ml' ? 'ഇന്നത്തെ പ്രധാന ശ്രദ്ധ' : language === 'ar' ? 'تركيز اليوم' : "Today's Focus"}
      </h3>

      {/* Grid matching the screenshot (1 big left card + 2 right cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
        {/* Main Left White Card (3 cols on sm) */}
        <div className="sm:col-span-3 bg-white text-[#1A1836] rounded-4xl p-5 shadow-still-white flex flex-col justify-between relative overflow-hidden group">
          {/* Top row: Illustration & Duration */}
          <div className="flex items-center justify-between mb-4">
            {/* Serene Night Moon graphic */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4A327E] to-[#1E163B] text-white flex items-center justify-center shadow-md relative overflow-hidden">
              <span className="text-2xl">🌙</span>
              {/* Subtle mountain graphic overlay */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-400/20 rounded-full blur-xs pointer-events-none" />
            </div>

            <span className="text-xs font-bold text-[#7A5CC7] bg-[#F1EBFF] px-3 py-1 rounded-full">
              {mainTask?.time ? `${mainTask.time}` : '15 min'}
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1 mb-5">
            <h4 className="text-lg font-black text-[#1A1836] leading-tight">
              {language === 'ml' && mainTask.malayalamTitle
                ? mainTask.malayalamTitle
                : mainTask.title}
            </h4>
            <p className="text-xs text-[#6F6B91] line-clamp-1">
              {mainTask.arabicTitle
                ? `${mainTask.arabicTitle} • ${mainTask.subtitle || 'Unwind & Find Peace'}`
                : mainTask.subtitle || 'Unwind & Find Peace'}
            </p>
          </div>

          {/* Purple Button matching screenshot "▶ 15 MIN GUIDED" */}
          <button
            onClick={handleMainAction}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
              mainTask.completed
                ? 'bg-emerald-600 text-white'
                : 'bg-[#EDE6FF] text-[#6E4ABF] hover:bg-[#E3D9FF]'
            }`}
          >
            {mainTask.completed ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{language === 'ml' ? 'പൂർത്തിയായി' : 'COMPLETED'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ml' ? 'പൂർത്തിയാക്കുക (START)' : '15 MIN GUIDED'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right 2 Stacked White Cards (2 cols on sm) */}
        <div className="sm:col-span-2 flex flex-col gap-3.5 justify-between">
          {/* Card 1: 100 ISTHIGFAR / Stress Relief */}
          {isthigfar && (
            <div
              onClick={() => onOpenCounter(isthigfar)}
              className="bg-white text-[#1A1836] rounded-3xl p-4 shadow-still-white flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="space-y-1">
                <h5 className="text-xs font-black text-[#1A1836]">
                  {language === 'ml' ? 'ഇസ്തിഗ്ഫാർ (പാപമോചനം)' : '100 Isthigfar'}
                </h5>
                <p className="text-[11px] font-semibold text-[#7A5CC7]">
                  {isthigfar.counterCurrent || 0}/{isthigfar.counterTarget || 100}
                </p>
                <span className="text-[10px] text-[#6F6B91]">
                  {isthigfar.completed ? '✔️ Done' : 'Tap to count'}
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EDE6FF] text-[#6E4ABF] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
                🌊
              </div>
            </div>
          )}

          {/* Card 2: 100 THASBEEH / Mindful Breaths */}
          {thasbeeh && (
            <div
              onClick={() => onOpenCounter(thasbeeh)}
              className="bg-white text-[#1A1836] rounded-3xl p-4 shadow-still-white flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="space-y-1">
                <h5 className="text-xs font-black text-[#1A1836]">
                  {language === 'ml' ? 'തസ്ബീഹ് (ധ്യാൻ)' : '100 Thasbeeh'}
                </h5>
                <p className="text-[11px] font-semibold text-[#7A5CC7]">
                  {thasbeeh.counterCurrent || 0}/{thasbeeh.counterTarget || 100}
                </p>
                <span className="text-[10px] text-[#6F6B91]">
                  {thasbeeh.completed ? '✔️ Done' : 'Tap to count'}
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EDE6FF] text-[#6E4ABF] flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
                🫁
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
