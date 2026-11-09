'use client';

import React, { useState, useEffect } from 'react';
import { Task, ReadingDetails } from '@/types/task';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import { X, BookOpen, Clock, Play, Pause, RotateCcw, Check, Bookmark, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReadingOptionsModalProps {
  task: Task;
  onClose: () => void;
  onSaveReading: (taskId: string, details: ReadingDetails, markCompleted: boolean) => void;
}

const MATERIAL_OPTIONS = [
  { id: 'Book', label: 'General Books', icon: '📚' },
  { id: 'Quran Tafsir', label: 'Quran Tafsir', icon: '🕌' },
  { id: 'Islamic Literature', label: 'Islamic Literature', icon: '📖' },
  { id: 'English Article', label: 'English Articles', icon: '📰' },
  { id: 'Self Development', label: 'Self Development', icon: '💡' },
];

export default function ReadingOptionsModal({ task, onClose, onSaveReading }: ReadingOptionsModalProps) {
  const initialDetails: ReadingDetails = task.readingDetails || {
    materialType: 'Book',
    title: 'Daily Self Development',
    targetMinutes: 25,
    minutesSpent: 0,
    startPage: '1',
    endPage: '15',
    notes: ''
  };

  const [details, setDetails] = useState<ReadingDetails>(initialDetails);
  const [timerSeconds, setTimerSeconds] = useState(initialDetails.minutesSpent * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Focus Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    triggerHaptic([40]);
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(0);
    triggerHaptic([50]);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSave = (markDone: boolean) => {
    const minutesSpent = Math.max(Math.round(timerSeconds / 60), details.minutesSpent);
    const updated: ReadingDetails = {
      ...details,
      minutesSpent
    };

    if (markDone) {
      triggerHaptic([100, 50, 100]);
      playChimeSound();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    onSaveReading(task.id, updated, markDone);
    onClose();
  };

  const pagesRead = () => {
    const start = parseInt(details.startPage || '0', 10);
    const end = parseInt(details.endPage || '0', 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start + 1;
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taskati-navy/60 backdrop-blur-sm animate-pop overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-4xl p-6 shadow-taskati-float border border-taskati-border relative my-auto">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-taskati-blue-light text-taskati-blue">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-taskati-navy">Daily Reading Options</h3>
              <p className="text-xs text-taskati-muted">Customize materials, timer & pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-taskati-bg text-taskati-muted hover:text-taskati-navy transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Material Selection Pills */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-2">
            Choose Reading Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MATERIAL_OPTIONS.map((mat) => (
              <button
                key={mat.id}
                type="button"
                onClick={() => {
                  triggerHaptic([20]);
                  setDetails({ ...details, materialType: mat.id as ReadingDetails['materialType'] });
                }}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                  details.materialType === mat.id
                    ? 'bg-taskati-blue text-white border-taskati-blue shadow-taskati'
                    : 'bg-taskati-bg text-taskati-navy border-taskati-border hover:border-taskati-blue/40'
                }`}
              >
                <span>{mat.icon}</span>
                <span className="truncate">{mat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title / Topic Input */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1">
            Book / Article Title
          </label>
          <input
            type="text"
            value={details.title}
            onChange={(e) => setDetails({ ...details, title: e.target.value })}
            placeholder="e.g. In The Early Hours, Atomic Habits, Surah Al-Kahf Tafsir..."
            className="w-full px-4 py-2.5 rounded-2xl bg-taskati-bg border border-taskati-border text-sm text-taskati-navy placeholder-taskati-muted focus:outline-none focus:border-taskati-blue font-medium"
          />
        </div>

        {/* Reading Focus Timer */}
        <div className="mb-4 p-4 rounded-3xl bg-gradient-to-br from-taskati-bg to-white border border-taskati-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-taskati-navy flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-taskati-blue" />
              Focus Reading Stopwatch
            </span>
            <span className="text-xs font-semibold text-taskati-muted">
              Target: {details.targetMinutes} min
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-taskati-navy font-mono tracking-wider">
              {formatTimer(timerSeconds)}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isRunning
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-taskati-blue text-white shadow-taskati hover:bg-taskati-blue-hover'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Start Timer
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-2 rounded-2xl bg-white border border-taskati-border text-taskati-muted hover:text-red-500 transition-colors"
                title="Reset stopwatch"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Target Minutes & Page Tracker */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-taskati-muted block mb-1">
              Target (Min)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={details.targetMinutes}
              onChange={(e) => setDetails({ ...details, targetMinutes: parseInt(e.target.value, 10) || 15 })}
              className="w-full px-3 py-2 rounded-2xl bg-taskati-bg border border-taskati-border text-xs text-center font-bold text-taskati-navy focus:outline-none focus:border-taskati-blue"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-taskati-muted block mb-1">
              Start Page
            </label>
            <input
              type="text"
              value={details.startPage || ''}
              onChange={(e) => setDetails({ ...details, startPage: e.target.value })}
              placeholder="1"
              className="w-full px-3 py-2 rounded-2xl bg-taskati-bg border border-taskati-border text-xs text-center font-bold text-taskati-navy focus:outline-none focus:border-taskati-blue"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-taskati-muted block mb-1">
              End Page
            </label>
            <input
              type="text"
              value={details.endPage || ''}
              onChange={(e) => setDetails({ ...details, endPage: e.target.value })}
              placeholder="15"
              className="w-full px-3 py-2 rounded-2xl bg-taskati-bg border border-taskati-border text-xs text-center font-bold text-taskati-navy focus:outline-none focus:border-taskati-blue"
            />
          </div>
        </div>

        {pagesRead() > 0 && (
          <div className="mb-3 text-right">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
              📖 {pagesRead()} pages planned / completed
            </span>
          </div>
        )}

        {/* Notes & Insights */}
        <div className="mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-taskati-muted block mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-taskati-blue" />
            Key Insights / Notes
          </label>
          <textarea
            rows={2}
            value={details.notes || ''}
            onChange={(e) => setDetails({ ...details, notes: e.target.value })}
            placeholder="Write down memorable quotes, benefits or reflections..."
            className="w-full px-3.5 py-2 rounded-2xl bg-taskati-bg border border-taskati-border text-xs text-taskati-navy placeholder-taskati-muted focus:outline-none focus:border-taskati-blue resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSave(false)}
            className="py-3 px-4 rounded-2xl bg-taskati-bg text-taskati-navy font-bold text-xs hover:bg-taskati-border transition-all flex items-center justify-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-taskati-blue" />
            Save Options
          </button>

          <button
            onClick={() => handleSave(true)}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-taskati-blue to-taskati-blue-hover text-white font-bold text-xs shadow-taskati hover:shadow-taskati-float transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Mark as Finished
          </button>
        </div>
      </div>
    </div>
  );
}
