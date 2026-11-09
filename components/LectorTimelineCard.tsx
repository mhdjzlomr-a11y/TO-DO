'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language } from '@/lib/translations';
import { CheckCircle2, Clock, Sparkles, BookOpen, Hash, ArrowRight } from 'lucide-react';

interface LectorTimelineCardProps {
  tasks: Task[];
  language: Language;
  onToggle: (taskId: string) => void;
  onOpenCounter: (task: Task) => void;
}

export default function LectorTimelineCard({
  tasks,
  language,
  onToggle,
  onOpenCounter,
}: LectorTimelineCardProps) {
  // Highlight top 5 key routines for timeline
  const timelineTasks = tasks.slice(0, 5);

  const colors = [
    { bg: 'bg-[#FF4B8B]', text: 'text-[#FF4B8B]', border: 'border-[#FF4B8B]' },
    { bg: 'bg-[#7A5AF8]', text: 'text-[#7A5AF8]', border: 'border-[#7A5AF8]' },
    { bg: 'bg-[#2E90FA]', text: 'text-[#2E90FA]', border: 'border-[#2E90FA]' },
    { bg: 'bg-[#F79009]', text: 'text-[#F79009]', border: 'border-[#F79009]' },
    { bg: 'bg-[#12B76A]', text: 'text-[#12B76A]', border: 'border-[#12B76A]' },
  ];

  return (
    <div className="bg-white dark:bg-[#151932] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {language === 'ml' ? 'സമയക്രമ ടൈംലൈൻ (Timeline)' : 'Recent Activities'}
        </h3>
        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
          Live Schedule
        </span>
      </div>

      {/* Timeline items matching image */}
      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-white/5">
        {timelineTasks.map((task, idx) => {
          const col = colors[idx % colors.length];
          const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

          return (
            <div
              key={task.id}
              onClick={() => onToggle(task.id)}
              className="flex items-start gap-3 relative cursor-pointer group"
            >
              {/* Circular Dot Badge */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-transform group-hover:scale-110 shadow-xs ${
                  task.completed ? 'bg-emerald-500 text-white' : `${col.bg} text-white`
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Title & Details */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold truncate transition-colors ${
                      task.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-800 dark:text-gray-200 group-hover:text-purple-600'
                    }`}
                  >
                    {displayTitle}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5 flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {task.time}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">
                  {task.arabicTitle || task.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
