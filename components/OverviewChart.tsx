'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Sparkles, TrendingUp, Calendar, Zap, ArrowUpRight } from 'lucide-react';

interface OverviewChartProps {
  tasks: Task[];
  language: Language;
}

interface DataPoint {
  label: string;
  value: number; // 0 - 100
  target: number; // 0 - 100
  tag?: string;
}

export default function OverviewChart({ tasks, language }: OverviewChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const t = TRANSLATIONS[language];

  // Calculate live daily progress
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length || 13;
  const currentDailyPct = Math.round((completedCount / totalCount) * 100);

  // Dynamic Data for each period
  const DATA_SETS: Record<'daily' | 'weekly' | 'monthly' | 'yearly', DataPoint[]> = {
    // 1. Daily: 6 Key Time Slots of the Routine Schedule
    daily: [
      { label: language === 'ml' ? 'സുബ്ഹി (05h)' : 'Fajr (05h)', value: 85, target: 80, tag: '05:45 AM' },
      { label: language === 'ml' ? 'പ്രഭാതം (08h)' : 'Mrng (08h)', value: 92, target: 85, tag: '07:45 AM' },
      { label: language === 'ml' ? 'പഠനം (10h)' : 'Study (10h)', value: 70, target: 75, tag: '10:30 AM' },
      { label: language === 'ml' ? 'ളുഹ്ര് (13h)' : 'Dhuhr (13h)', value: 65, target: 70, tag: '01:45 PM' },
      { label: language === 'ml' ? 'വായന (16h)' : 'Read (16h)', value: 80, target: 75, tag: '04:30 PM' },
      { label: language === 'ml' ? 'മഗ്‌രിബ് (18h)' : 'Maghrib (18h)', value: 95, target: 90, tag: '06:45 PM' },
      { label: language === 'ml' ? 'ഇശാ (21h)' : 'Isha (21h)', value: Math.max(currentDailyPct, 60), target: 85, tag: '09:30 PM' },
    ],

    // 2. Weekly: 7 Days
    weekly: [
      { label: language === 'ml' ? 'തിങ്കൾ' : 'Mon', value: 82, target: 80 },
      { label: language === 'ml' ? 'ചൊവ്വ' : 'Tue', value: 90, target: 85 },
      { label: language === 'ml' ? 'ബുധൻ' : 'Wed', value: 75, target: 80 },
      { label: language === 'ml' ? 'വ്യാഴം' : 'Thu', value: 88, target: 85 },
      { label: language === 'ml' ? 'വെള്ളി' : 'Fri', value: 100, target: 95 },
      { label: language === 'ml' ? 'ശനി' : 'Sat', value: 78, target: 80 },
      { label: language === 'ml' ? 'ഞായർ' : 'Sun', value: currentDailyPct || 72, target: 85 },
    ],

    // 3. Monthly: 6 Months
    monthly: [
      { label: 'Jan', value: 68, target: 75 },
      { label: 'Feb', value: 74, target: 75 },
      { label: 'Mar', value: 85, target: 80 },
      { label: 'Apr', value: 92, target: 85 },
      { label: 'May', value: 80, target: 85 },
      { label: 'Jun', value: 88, target: 90 },
    ],

    // 4. Yearly: Quarters
    yearly: [
      { label: '2023 Q1', value: 65, target: 70 },
      { label: '2023 Q2', value: 78, target: 75 },
      { label: '2023 Q3', value: 84, target: 80 },
      { label: '2023 Q4', value: 90, target: 85 },
      { label: '2024 H1', value: 88, target: 85 },
      { label: '2024 H2', value: 95, target: 90 },
    ]
  };

  const points = DATA_SETS[period];

  // SVG Dimension constants
  const svgWidth = 560;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingY = 20;

  // Convert points to SVG coordinates
  const coords = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * (svgWidth - paddingX * 2);
    // Invert y because SVG y goes downwards (0 is top, 100 is bottom)
    const y = svgHeight - paddingY - (p.value / 100) * (svgHeight - paddingY * 2);
    const targetY = svgHeight - paddingY - (p.target / 100) * (svgHeight - paddingY * 2);
    return { x, y, targetY, ...p };
  });

  // Build Smooth Bezier Curve Path
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      // Control points using Catmull-Rom to Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;

  // Secondary dashed target line
  const targetLinePath = buildSmoothPath(coords.map((c) => ({ x: c.x, y: c.targetY })));

  // Average completion for active period
  const avgValue = Math.round(points.reduce((acc, p) => acc + p.value, 0) / points.length);

  return (
    <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4 transition-colors">
      {/* Header with Title and Modern Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-taskati-border/60 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-taskati-navy dark:text-white">
              {t.overview}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{avgValue}%</span>
            </span>
          </div>
          <p className="text-[11px] text-taskati-muted dark:text-gray-400">
            {period === 'daily'
              ? (language === 'ml' ? 'ഇന്നത്തെ സമയ ക്രമത്തിലുള്ള തരംഗ ഗ്രാഫ് (Hourly Curve)' : 'Hourly spline progress wave')
              : period === 'weekly'
              ? (language === 'ml' ? 'ഈ ആഴ്ചയിലെ പുരോഗതി തരംഗം' : 'Weekly evaluation spline')
              : period === 'monthly'
              ? (language === 'ml' ? 'പ്രതിമാസ അവലോകനം' : 'Monthly growth trend')
              : (language === 'ml' ? 'വാർഷിക ലക്ഷ്യങ്ങൾ' : 'Yearly goals')}
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-1 bg-taskati-bg dark:bg-[#121528] p-1 rounded-2xl border border-taskati-border/60 dark:border-white/5 text-xs font-bold">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-xl transition-all ${
                period === p
                  ? 'bg-taskati-blue text-white shadow-xs'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
              }`}
            >
              {t[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Wave Area Curve SVG Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            {/* Glowing Gradient Fill beneath the wave */}
            <linearGradient id="curveWaveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5051F9" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#744BE4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#5051F9" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Stroke Gradient */}
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* Horizontal Light Guide Gridlines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = svgHeight - paddingY - (val / 100) * (svgHeight - paddingY * 2);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-200 dark:text-white/5 stroke-dasharray-[3_3]"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-gray-400 dark:fill-gray-600 font-mono"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Target Dashed Curve */}
          <path
            d={targetLinePath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-40"
          />

          {/* Gradient Wave Area Fill */}
          <path
            d={areaPath}
            fill="url(#curveWaveGradient)"
            className="transition-all duration-700 ease-out"
          />

          {/* Main Curved Wave Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out drop-shadow-xs"
          />

          {/* Interactive Data Point Dots along the Wave */}
          {coords.map((c, idx) => {
            const isHovered = activePointIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setActivePointIndex(idx)}
                onMouseLeave={() => setActivePointIndex(null)}
                className="cursor-pointer"
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="10"
                    fill="#5051F9"
                    className="opacity-25 animate-ping"
                  />
                )}
                {/* Outer white ring */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#FFFFFF"
                  stroke="#5051F9"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Pill if a point is hovered */}
        {activePointIndex !== null && coords[activePointIndex] && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-taskati-navy dark:bg-white text-white dark:text-taskati-navy text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-pop"
            style={{
              left: `${(coords[activePointIndex].x / svgWidth) * 100}%`,
            }}
          >
            <span>{coords[activePointIndex].label}:</span>
            <span className="font-black text-amber-300 dark:text-taskati-blue">
              {coords[activePointIndex].value}%
            </span>
          </div>
        )}
      </div>

      {/* X-Axis Labels row */}
      <div className="flex items-center justify-between px-2 pt-1">
        {points.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setActivePointIndex(activePointIndex === idx ? null : idx)}
            className={`text-[10px] sm:text-[11px] font-bold transition-colors truncate max-w-[70px] text-center ${
              activePointIndex === idx
                ? 'text-taskati-blue dark:text-blue-400 font-black'
                : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Legend & Stats Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-taskati-border/60 dark:border-white/5 text-xs text-taskati-muted dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]" />
            <span className="font-semibold">{language === 'ml' ? 'പൂർത്തിയായ ശതമാനം' : 'Completed Wave'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-gray-400 border-dashed" />
            <span className="font-semibold">{language === 'ml' ? 'ലക്ഷ്യം' : 'Target Goal'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-semibold text-[11px]">
          <span>
            {language === 'ml' ? 'ശരാശരി' : 'Average'}: <strong className="text-taskati-navy dark:text-white font-mono">{avgValue}%</strong>
          </span>
          <span>•</span>
          <span>
            {language === 'ml' ? 'ഏറ്റവും മികച്ചത്' : 'Peak'}: <strong className="text-emerald-500 font-mono">100%</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
