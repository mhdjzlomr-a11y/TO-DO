'use client';

import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { FolderKanban, Plus, Clock, Hash, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import TaskCard from '@/components/TaskCard';

interface ProjectsViewProps {
  tasks: Task[];
  language: Language;
  onToggle: (taskId: string) => void;
  onOpenCounter: (task: Task) => void;
  onOpenReading: (task: Task) => void;
  onAddNew: () => void;
}

export default function ProjectsView({
  tasks,
  language,
  onToggle,
  onOpenCounter,
  onOpenReading,
  onAddNew,
}: ProjectsViewProps) {
  const [filter, setFilter] = useState<'all' | 'spiritual' | 'learning'>('all');
  const t = TRANSLATIONS[language];

  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const learningTasks = tasks.filter((t) => t.category === 'learning');

  const filtered = filter === 'spiritual'
    ? spiritualTasks
    : filter === 'learning'
    ? learningTasks
    : tasks;

  return (
    <div className="space-y-6 animate-pop">
      {/* Header */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-taskati-navy dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-taskati-blue" />
            <span>{language === 'ml' ? 'പ്രൊജക്ടുകളും ദിനചര്യകളും' : 'Projects & Routines'}</span>
          </h2>
          <p className="text-xs text-taskati-muted dark:text-gray-400 pt-1">
            {language === 'ml'
              ? 'ആത്മീയ, പഠന, വായനാ പ്രൊജക്ടുകളുടെ സമ്പൂർണ്ണ ക്രമീകരണം'
              : 'Complete overview of all spiritual, learning and reading projects'}
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 rounded-2xl bg-taskati-blue text-white text-xs font-bold shadow-taskati hover:bg-taskati-blue-hover active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewProject}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 bg-white dark:bg-[#181C33] p-2 rounded-2xl border border-taskati-border dark:border-white/10 w-fit">
        {[
          { id: 'all', label: `${t.all} (${tasks.length})` },
          { id: 'spiritual', label: `${language === 'ml' ? 'ആത്മീയവ' : 'Spiritual'} (${spiritualTasks.length})` },
          { id: 'learning', label: `${language === 'ml' ? 'പഠനം & വായന' : 'Learning'} (${learningTasks.length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f.id
                ? 'bg-taskati-blue text-white shadow-xs'
                : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Routines Grid in Light Pastel Capsules */}
      <div className="space-y-3.5">
        {filtered.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            language={language}
            onToggle={onToggle}
            onOpenCounter={onOpenCounter}
            onOpenReading={onOpenReading}
          />
        ))}
      </div>
    </div>
  );
}
