'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Crown, Heart, Zap, Sparkles, ArrowUpRight } from 'lucide-react';

interface LectorHeroWaveChartProps {
  tasks: Task[];
  language: Language;
  streak: number;
}

export default function LectorHeroWaveChart({
  tasks,
  language,
  streak,
}: LectorHeroWaveChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const t = TRANSLATIONS[language];

  const total = tasks.length || 13;
  const completed = tasks.filter((t) => t.completed).length;
  const pct = Math.round((completed / total) * 100);

  // Dynamic datasets for the dual waves
  const DATA = {
    daily: {
      labels: ['05:00', '08:00', '10:30', '13:45', '16:30', '18:45', '21:30'],
      waveAmber: [30, 65, 50, 85, 60, 90, 70],
      wavePurple: [40, 80, 60, 70, 85, 95, 80],
    },
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      waveAmber: [45, 60, 55, 75, 90, 70, 85],
      wavePurple: [55, 75, 65, 85, 100, 80, pct || 85],
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      waveAmber: [35, 58, 48, 78, 62, 50],
      wavePurple: [45, 70, 60, 88, 75, 95],
    },
    yearly: {
      labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 H1', '2024 H2'],
      waveAmber: [50, 65, 70, 80, 75, 85],
      wavePurple: [60, 75, 80, 92, 88, 98],
    },
  };

  const current = DATA[period];
  const svgW = 540;
  const svgH = 150;
  const padX = 25;
  const padY = 20;

  // Generate smooth SVG Catmull-Rom Bezier path
  const generatePath = (vals: number[]) => {
    const coords = vals.map((v, i) => ({
      x: padX + (i / (vals.length - 1)) * (svgW - padX * 2),
      y: svgH - padY - (v / 100) * (svgH - padY * 2),
    }));

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return { line: d, coords };
  };

  const amber = generatePath(current.waveAmber);
  const purple = generatePath(current.wavePurple);

  const amberArea = `${amber.line} L ${amber.coords[amber.coords.length - 1].x} ${svgH - padY} L ${amber.coords[0].x} ${svgH - padY} Z`;
  const purpleArea = `${purple.line} L ${purple.coords[purple.coords.length - 1].x} ${svgH - padY} L ${purple.coords[0].x} ${svgH - padY} Z`;

  return (
    <div className="bg-white dark:bg-[#151932] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-colors">
      {/* Top Header of the Card */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {language === 'ml' ? 'ഡാഷ്‌ബോർഡ് അവലോകനം' : 'Dashboard'}
          </h3>
          <p className="text-xs text-gray-400">
            {language === 'ml' ? 'ദിനചര്യകളുടെ തത്സമയ ഗ്രാഫ്' : 'Overview of Latest Routines'}
          </p>
        </div>

        {/* Period Selector matching image tabs */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs font-bold text-gray-400">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`uppercase tracking-wider transition-all relative pb-1 ${
                period === p
                  ? 'text-purple-600 dark:text-purple-400 font-black'
                  : 'hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span>{p}</span>
              {period === p && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row & Dual Wave Graph */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Left KPI Numbers matching image */}
        <div className="space-y-2">
          <div>
            <span className="text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
              {pct}%
            </span>
            <p className="text-[11px] text-gray-400 font-medium">
              {language === 'ml' ? 'ഇന്നത്തെ പൂർത്തീകരണം' : 'Today\'s Completion'}
            </p>
          </div>

          <div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200 font-mono">
              {completed} <span className="text-xs font-normal text-gray-400">/ {total}</span>
            </span>
            <p className="text-[11px] text-gray-400 font-medium">
              {language === 'ml' ? 'ദിനചര്യകൾ പൂർത്തിയായി' : 'Routines Checked'}
            </p>
          </div>

          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF4B8B] to-[#D92A72] text-white text-[11px] font-bold shadow-xs hover:opacity-95 transition-all"
          >
            {language === 'ml' ? 'തത്സമയ സംഗ്രഹം' : 'Today\'s Summary'}
          </button>
        </div>

        {/* Right 3 Cols: The Dual Smooth Spline Wave Graph from the image */}
        <div className="md:col-span-3 w-full">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-40 overflow-visible">
            <defs>
              {/* Amber Area Gradient */}
              <linearGradient id="amberWaveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>

              {/* Purple Area Gradient */}
              <linearGradient id="purpleWaveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333EA" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[20, 50, 80].map((v) => {
              const y = svgH - padY - (v / 100) * (svgH - padY * 2);
              return (
                <line
                  key={v}
                  x1={padX}
                  y1={y}
                  x2={svgW - padX}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-100 dark:text-white/5"
                  strokeDasharray="2 3"
                />
              );
            })}

            {/* Amber Wave Area & Line */}
            <path d={amberArea} fill="url(#amberWaveGradient)" />
            <path d={amber.line} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

            {/* Purple/Magenta Wave Area & Line */}
            <path d={purpleArea} fill="url(#purpleWaveGradient)" />
            <path d={purple.line} fill="none" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />

            {/* Amber Dots */}
            {amber.coords.map((c, idx) => (
              <circle key={idx} cx={c.x} cy={c.y} r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
            ))}

            {/* Purple Dots */}
            {purple.coords.map((c, idx) => (
              <circle key={idx} cx={c.x} cy={c.y} r="3.5" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2" />
            ))}
          </svg>

          {/* X Axis Labels */}
          <div className="flex items-center justify-between px-3 text-[10px] font-bold text-gray-400 pt-1">
            {current.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row under graph matching image's 4 icon pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center flex-shrink-0">
            <Crown className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-medium">{language === 'ml' ? 'ആത്മീയവ' : 'Spiritual'}</p>
            <p className="text-xs font-black text-gray-800 dark:text-gray-100 font-mono">10 / 10</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-medium">{language === 'ml' ? 'ദിക്റുകൾ' : 'Dhikr Target'}</p>
            <p className="text-xs font-black text-gray-800 dark:text-gray-100 font-mono">300 Done</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-medium">{language === 'ml' ? 'വായന' : 'Reading'}</p>
            <p className="text-xs font-black text-gray-800 dark:text-gray-100 font-mono">25 Mins</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="text-[10px] text-gray-400 font-medium">{language === 'ml' ? 'തുടർച്ച' : 'Streak'}</p>
            <p className="text-xs font-black text-gray-800 dark:text-gray-100 font-mono">{streak} Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
