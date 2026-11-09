'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { Plus, Search, Check, Clock, Hash, BookOpen, CheckCircle2 } from 'lucide-react';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import confetti from 'canvas-confetti';

interface LectorRoutineTableProps {
  tasks: Task[];
  language: Language;
  onToggle: (taskId: string) => void;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
  onAddNew: () => void;
}

export default function LectorRoutineTable({
  tasks,
  language,
  onToggle,
  onOpenCounter,
  onOpenReading,
  onAddNew,
}: LectorRoutineTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const t = TRANSLATIONS[language];

  const filtered = tasks.filter((t) => {
    const match =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.malayalamTitle && t.malayalamTitle.includes(search)) ||
      (t.arabicTitle && t.arabicTitle.includes(search));
    if (!match) return false;
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCheck = (taskId: string, completed: boolean) => {
    triggerHaptic([40]);
    if (!completed) {
      playChimeSound();
      try {
        confetti({ particleCount: 30, spread: 40 });
      } catch (err) {}
    }
    onToggle(taskId);
  };

  return (
    <div className="bg-white dark:bg-[#151932] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-colors">
      {/* Top Header & Search matching image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {language === 'ml' ? 'ദിനചര്യകളുടെ തത്സമയ സ്റ്റാറ്റസ്' : 'Daily Routines Status'}
          </h3>
          <p className="text-xs text-gray-400">
            {language === 'ml' ? 'ഇന്നത്തെ ടാസ്കുകളുടെ സമ്പൂർണ്ണ ടേബിൾ' : 'Overview of Latest Routines'}
          </p>
        </div>

        {/* Action Controls matching image */}
        <div className="flex items-center gap-2">
          {/* Pink + Add Button */}
          <button
            onClick={onAddNew}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF4B8B] to-[#D92A72] text-white text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          {/* Search Box matching image */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/5 text-xs">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-xs outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400 w-24 sm:w-32"
            />
          </div>
        </div>
      </div>

      {/* Dark Header Table matching image */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#1E2538] text-white font-bold uppercase tracking-wider text-[10px] rounded-xl overflow-hidden">
              <th className="py-2.5 px-3 rounded-l-xl">ROUTINE / TASK</th>
              <th className="py-2.5 px-3">CATEGORY</th>
              <th className="py-2.5 px-3">SCHEDULE TIME</th>
              <th className="py-2.5 px-3">PROGRESS</th>
              <th className="py-2.5 px-3 text-right rounded-r-xl">STATUS / ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {filtered.map((task) => {
              const displayTitle = language === 'ml' && task.malayalamTitle ? task.malayalamTitle : task.title;

              return (
                <tr
                  key={task.id}
                  onClick={() => handleCheck(task.id, task.completed)}
                  className="hover:bg-gray-50/70 dark:hover:bg-white/3 transition-colors cursor-pointer group"
                >
                  {/* Routine Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheck(task.id, task.completed);
                        }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          task.completed
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'border-2 border-gray-300 dark:border-white/20 group-hover:border-purple-500'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <span
                          className={`font-bold block truncate ${
                            task.completed
                              ? 'line-through text-gray-400'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {displayTitle}
                        </span>
                        {task.arabicTitle && (
                          <span dir="rtl" className="text-[10px] text-gray-400 font-serif block">
                            {task.arabicTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="capitalize text-gray-500 dark:text-gray-400 font-medium">
                      {task.category}
                    </span>
                  </td>

                  {/* Schedule Time */}
                  <td className="py-3 px-3 font-mono text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {task.time}
                    </span>
                  </td>

                  {/* Progress Bar Capsule */}
                  <td className="py-3 px-3 min-w-[100px]">
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.completed
                            ? 'bg-emerald-500'
                            : task.type === 'counter'
                            ? 'bg-blue-500'
                            : task.type === 'reading'
                            ? 'bg-purple-500'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${task.completed ? 100 : task.type === 'counter' ? 55 : 30}%` }}
                      />
                    </div>
                  </td>

                  {/* Status / Action Buttons matching image pills */}
                  <td className="py-3 px-3 text-right">
                    {task.completed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-pink-500 text-white text-[10px] font-bold shadow-2xs">
                        Completed
                      </span>
                    ) : task.type === 'counter' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCounter(task);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold shadow-2xs hover:opacity-90 transition-all flex items-center gap-1 ml-auto"
                      >
                        <Hash className="w-2.5 h-2.5" />
                        <span>Counter ({task.counterCurrent || 0}/100)</span>
                      </button>
                    ) : task.type === 'reading' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReading(task);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-bold shadow-2xs hover:opacity-90 transition-all flex items-center gap-1 ml-auto"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>Reading Hub</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-2xs">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer matching image pagination */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-gray-400">
        <span>Showing 1 to {filtered.length} of {tasks.length} entries</span>
        <div className="flex items-center gap-1">
          <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
            1
          </span>
        </div>
      </div>
    </div>
  );
}
