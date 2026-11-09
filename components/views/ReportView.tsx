'use client';

import React from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { BarChart3, CheckCircle2, AlertTriangle, Flame, Send, Sparkles, Clock, Hash, BookOpen } from 'lucide-react';
import { generateCompletedReport, generatePendingReport, openWhatsApp } from '@/lib/whatsappHelper';
import { triggerHaptic } from '@/lib/notifications';

interface ReportViewProps {
  tasks: Task[];
  language: Language;
  streak: number;
  onOpenPhoneModal: () => void;
}

export default function ReportView({
  tasks,
  language,
  streak,
  onOpenPhoneModal,
}: ReportViewProps) {
  const t = TRANSLATIONS[language];
  const total = tasks.length || 13;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const pct = Math.round((completed / total) * 100);

  const handleSendCompleted = () => {
    const phone = localStorage.getItem('oneday_saved_phone_number_v2') || localStorage.getItem('taskati_saved_phone_number_v1') || '';
    if (!phone) {
      onOpenPhoneModal();
    } else {
      triggerHaptic([40]);
      openWhatsApp(phone, generateCompletedReport(tasks, language, streak));
    }
  };

  const handleSendPending = () => {
    const phone = localStorage.getItem('oneday_saved_phone_number_v2') || localStorage.getItem('taskati_saved_phone_number_v1') || '';
    if (!phone) {
      onOpenPhoneModal();
    } else {
      triggerHaptic([40]);
      openWhatsApp(phone, generatePendingReport(tasks, language));
    }
  };

  const categories = [
    { name: language === 'ml' ? 'ആത്മീയ ദിനചര്യകൾ' : 'Spiritual Routines', icon: Sparkles, color: 'from-purple-500 to-indigo-500', pct: 88 },
    { name: language === 'ml' ? '100x ദിക്റ് കൗണ്ടറുകൾ' : '100x Dhikr Counters', icon: Hash, color: 'from-blue-500 to-cyan-500', pct: 100 },
    { name: language === 'ml' ? 'ദിനേനയുള്ള വായന & തഫ്സീർ' : 'Daily Reading & Tafsir', icon: BookOpen, color: 'from-pink-500 to-rose-500', pct: 75 },
    { name: language === 'ml' ? 'ഇംഗ്ലീഷ് പഠനം' : 'English Learning', icon: Clock, color: 'from-amber-500 to-orange-500', pct: 85 },
  ];

  return (
    <div className="space-y-6 animate-pop">
      {/* Header */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-taskati-navy dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-taskati-blue" />
            <span>{language === 'ml' ? 'വിലയിരുത്തലും റിപ്പോർട്ടുകളും (Reports)' : 'Analytics & Reports'}</span>
          </h2>
          <p className="text-xs text-taskati-muted dark:text-gray-400 pt-1">
            {language === 'ml'
              ? 'നിങ്ങളുടെ ദിനചര്യകളുടെ സമ്പൂർണ്ണ പുരോഗതി റിപ്പോർട്ടും വാട്സാപ്പ് ഷെയറിംഗും'
              : 'Detailed performance insights and 1-click WhatsApp progress reports'}
          </p>
        </div>

        {/* 100% Free Lifetime Badge */}
        <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold self-start sm:self-auto">
          {language === 'ml' ? '100% സൗജന്യ ഫുൾ വേർഷൻ (Lifetime Free)' : 'Lifetime Free Version Active'}
        </span>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#181C33] p-5 rounded-3xl border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-1">
          <p className="text-xs font-bold text-taskati-muted">{language === 'ml' ? 'പൂർത്തിയായവ' : 'Completed'}</p>
          <p className="text-2xl font-black text-taskati-navy dark:text-white">{completed} / {total}</p>
          <p className="text-[10px] text-emerald-500 font-bold">{pct}% {language === 'ml' ? 'പൂർത്തിയായി' : 'Done'}</p>
        </div>

        <div className="bg-white dark:bg-[#181C33] p-5 rounded-3xl border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-1">
          <p className="text-xs font-bold text-taskati-muted">{language === 'ml' ? 'തുടർച്ച' : 'Streak'}</p>
          <p className="text-2xl font-black text-amber-500 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span>{streak}</span>
          </p>
          <p className="text-[10px] text-taskati-muted">{language === 'ml' ? 'ദിവസങ്ങൾ' : 'Days'}</p>
        </div>

        <div className="bg-white dark:bg-[#181C33] p-5 rounded-3xl border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-1">
          <p className="text-xs font-bold text-taskati-muted">{language === 'ml' ? 'ബാക്കിയുള്ളവ' : 'Pending'}</p>
          <p className="text-2xl font-black text-rose-500">{pending}</p>
          <p className="text-[10px] text-taskati-muted">{language === 'ml' ? 'ടാസ്കുകൾ' : 'Routines'}</p>
        </div>

        <div className="bg-white dark:bg-[#181C33] p-5 rounded-3xl border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-1">
          <p className="text-xs font-bold text-taskati-muted">{language === 'ml' ? 'ദിക്റുകൾ' : 'Total Dhikr'}</p>
          <p className="text-2xl font-black text-taskati-blue">300</p>
          <p className="text-[10px] text-taskati-blue font-bold">100% {language === 'ml' ? 'ടാർഗെറ്റ്' : 'Target'}</p>
        </div>
      </div>

      {/* Habit Categories Breakdown */}
      <div className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-4">
        <h3 className="text-sm font-bold text-taskati-navy dark:text-white">
          {language === 'ml' ? 'വിഭാഗങ്ങൾ തിരിച്ചുള്ള അവലോകനം' : 'Category Performance Breakdown'}
        </h3>

        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-taskati-navy dark:text-white">
                  <cat.icon className="w-3.5 h-3.5 text-taskati-blue" />
                  <span>{cat.name}</span>
                </span>
                <span className="font-mono text-taskati-blue">{cat.pct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Report Dispatch Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Send className="w-5 h-5" />
            <span>{language === 'ml' ? 'വാട്സാപ്പ് വഴി റിപ്പോർട്ട് അയക്കുക' : 'Dispatch Reports via WhatsApp'}</span>
          </h3>
          <p className="text-xs text-white/80 pt-1">
            {language === 'ml'
              ? 'പൂർത്തിയായ ദിനചര്യകളും ഇനിയും ബാക്കിയുള്ള ഓർമ്മപ്പെടുത്തലുകളും ഒറ്റ ക്ലിക്കിൽ വാട്സാപ്പിൽ അയക്കാം'
              : 'Share formatted completed logs or pending reminders directly to your WhatsApp'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleSendCompleted}
            className="flex-1 py-3 px-4 rounded-2xl bg-white text-emerald-800 text-xs font-bold shadow-md hover:bg-white/95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ml' ? `പൂർത്തിയായവ അയക്കുക (${completed})` : 'Send Completed Report'}</span>
          </button>

          <button
            onClick={handleSendPending}
            className="flex-1 py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-amber-900" />
            <span>{language === 'ml' ? `ബാക്കിയുള്ളവ അയക്കുക (${pending})` : 'Send Pending Reminder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
