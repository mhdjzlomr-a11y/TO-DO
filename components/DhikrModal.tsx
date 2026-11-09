'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { X, RotateCcw, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DhikrModalProps {
  task: Task;
  onClose: () => void;
  onUpdateCounter: (taskId: string, count: number, markCompleted?: boolean) => void;
}

export default function DhikrModal({ task, onClose, onUpdateCounter }: DhikrModalProps) {
  const target = task.counterTarget || 100;
  const [count, setCount] = useState<number>(task.counterCurrent || 0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const percentage = Math.min(100, Math.round((count / target) * 100));

  const handleIncrement = (incrementBy = 1) => {
    const nextCount = Math.min(target, count + incrementBy);
    setCount(nextCount);
    triggerHaptic([35]);
    
    if (soundEnabled && nextCount % 10 === 0) {
      playChimeSound();
    }

    if (nextCount >= target) {
      triggerHaptic([100, 50, 100, 50, 200]);
      playChimeSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      onUpdateCounter(task.id, nextCount, true);
    } else {
      onUpdateCounter(task.id, nextCount, false);
    }
  };

  const handleReset = () => {
    setCount(0);
    triggerHaptic([60, 40]);
    onUpdateCounter(task.id, 0, false);
  };

  const handleCompleteNow = () => {
    setCount(target);
    triggerHaptic([100, 50, 100]);
    playChimeSound();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    onUpdateCounter(task.id, target, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taskati-navy/60 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white rounded-4xl p-6 shadow-taskati-float border border-taskati-border flex flex-col items-center relative overflow-hidden">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full bg-taskati-bg text-taskati-muted hover:text-taskati-blue transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-taskati-blue" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 bg-taskati-blue-light text-taskati-blue rounded-full">
            Dhikr Counter
          </span>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-taskati-bg text-taskati-muted hover:text-taskati-navy transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Title & Arabic */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-taskati-navy mb-1">{task.title}</h3>
          {task.arabicTitle && (
            <p className="text-2xl font-serif text-taskati-blue font-semibold tracking-wide dir-rtl py-1">
              {task.arabicTitle}
            </p>
          )}
          <p className="text-xs text-taskati-muted">{task.subtitle || `Target: ${target} times`}</p>
        </div>

        {/* Big Circular Tally Button */}
        <div className="relative my-2">
          {/* Outer ring */}
          <svg className="w-64 h-64 -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#E8ECF5"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#bluePinkGradient)"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-200 ease-out"
            />
            <defs>
              <linearGradient id="bluePinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5051F9" />
                <stop offset="100%" stopColor="#E84E89" />
              </linearGradient>
            </defs>
          </svg>

          {/* Interactive Tap Button */}
          <button
            onClick={() => handleIncrement(1)}
            disabled={count >= target}
            className={`absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-inner ${
              count >= target
                ? 'bg-taskati-pink text-white shadow-taskati-pink'
                : 'bg-gradient-to-br from-taskati-blue to-taskati-blue-hover text-white shadow-taskati-float'
            }`}
          >
            <span className="text-5xl font-black tracking-tight">{count}</span>
            <span className="text-xs font-semibold text-white/80 mt-1 uppercase tracking-widest">
              {count >= target ? 'Completed!' : `Tap of ${target}`}
            </span>
            <span className="text-[10px] text-white/60 mt-0.5">({percentage}%)</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="w-full grid grid-cols-3 gap-2 mt-6">
          <button
            onClick={() => handleIncrement(5)}
            disabled={count >= target}
            className="py-2.5 px-3 rounded-2xl bg-taskati-bg text-taskati-navy font-bold text-xs hover:bg-taskati-blue-light hover:text-taskati-blue transition-all disabled:opacity-40"
          >
            +5 Fast
          </button>

          <button
            onClick={handleReset}
            className="py-2.5 px-3 rounded-2xl bg-taskati-bg text-taskati-muted font-bold text-xs hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleCompleteNow}
            className="py-2.5 px-3 rounded-2xl bg-taskati-pink-light text-taskati-pink font-bold text-xs hover:bg-taskati-pink hover:text-white transition-all flex items-center justify-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </button>
        </div>

        {/* Motivational Banner */}
        {count >= target && (
          <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            MashaAllah! Routine completed for today.
          </div>
        )}
      </div>
    </div>
  );
}
