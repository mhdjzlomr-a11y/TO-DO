'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { Language, TRANSLATIONS } from '@/lib/translations';
import {
  generateCompletedReport,
  generatePendingReport,
  openWhatsApp,
  openSMS,
  formatPhoneNumber
} from '@/lib/whatsappHelper';
import { triggerHaptic, playChimeSound } from '@/lib/notifications';
import {
  X,
  Phone,
  Send,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Smartphone,
  Save,
  Clock
} from 'lucide-react';

interface PhoneNotificationModalProps {
  tasks: Task[];
  language: Language;
  streak: number;
  onClose: () => void;
}

const PHONE_STORAGE_KEY = 'taskati_saved_phone_number_v1';
const AUTO_REMINDER_KEY = 'taskati_auto_reminder_time_v1';

export default function PhoneNotificationModal({
  tasks,
  language,
  streak,
  onClose,
}: PhoneNotificationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reminderTime, setReminderTime] = useState('21:00');
  const [activeTab, setActiveTab] = useState<'both' | 'completed' | 'pending'>('both');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem(PHONE_STORAGE_KEY) || '';
      const savedTime = localStorage.getItem(AUTO_REMINDER_KEY) || '21:00';
      setPhoneNumber(savedPhone);
      setReminderTime(savedTime);
    }
  }, []);

  const handleSavePhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem(PHONE_STORAGE_KEY, phoneNumber);
      localStorage.setItem(AUTO_REMINDER_KEY, reminderTime);
      setIsSaved(true);
      triggerHaptic([40]);
      playChimeSound();
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const completedReportText = generateCompletedReport(tasks, language, streak);
  const pendingReportText = generatePendingReport(tasks, language);

  const handleSendCompletedWhatsApp = () => {
    if (!phoneNumber.trim()) {
      alert(language === 'ml' ? 'ദയവായി ആദ്യം ഫോൺ നമ്പർ നൽകുക!' : 'Please enter your phone number first!');
      return;
    }
    handleSavePhone();
    triggerHaptic([50]);
    openWhatsApp(phoneNumber, completedReportText);
  };

  const handleSendPendingWhatsApp = () => {
    if (!phoneNumber.trim()) {
      alert(language === 'ml' ? 'ദയവായി ആദ്യം ഫോൺ നമ്പർ നൽകുക!' : 'Please enter your phone number first!');
      return;
    }
    handleSavePhone();
    triggerHaptic([50]);
    openWhatsApp(phoneNumber, pendingReportText);
  };

  const handleSendCompletedSMS = () => {
    if (!phoneNumber.trim()) {
      alert(language === 'ml' ? 'ദയവായി ആദ്യം ഫോൺ നമ്പർ നൽകുക!' : 'Please enter your phone number first!');
      return;
    }
    handleSavePhone();
    triggerHaptic([50]);
    openSMS(phoneNumber, completedReportText);
  };

  const handleSendPendingSMS = () => {
    if (!phoneNumber.trim()) {
      alert(language === 'ml' ? 'ദയവായി ആദ്യം ഫോൺ നമ്പർ നൽകുക!' : 'Please enter your phone number first!');
      return;
    }
    handleSavePhone();
    triggerHaptic([50]);
    openSMS(phoneNumber, pendingReportText);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taskati-navy/60 backdrop-blur-sm animate-pop overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#181C33] rounded-4xl p-6 shadow-taskati-float border border-taskati-border dark:border-white/10 relative my-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Phone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-taskati-navy dark:text-white">
                {language === 'ml' ? 'ഫോൺ നമ്പർ നോട്ടിഫിക്കേഷൻ' : 'Phone & WhatsApp Alerts'}
              </h3>
              <p className="text-xs text-taskati-muted dark:text-gray-400">
                {language === 'ml'
                  ? 'പൂർത്തിയായവയ്ക്കും ബാക്കിയുള്ളവയ്ക്കും പ്രത്യേക നോട്ടിഫിക്കേഷൻ'
                  : 'Separate notifications for completed & pending tasks'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-taskati-bg dark:bg-white/5 text-taskati-muted hover:text-taskati-navy dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone Number Input Form */}
        <form onSubmit={handleSavePhone} className="p-4 rounded-3xl bg-taskati-bg dark:bg-[#14182E] border border-taskati-border dark:border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-taskati-navy dark:text-gray-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ml' ? 'നിങ്ങളുടെ മൊബൈൽ / WhatsApp നമ്പർ' : 'Your WhatsApp / Mobile Number'}</span>
            </label>
            {isSaved && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'ml' ? 'സേവ് ചെയ്തു!' : 'Saved!'}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 9876543210"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 text-sm font-bold text-taskati-navy dark:text-white placeholder-taskati-muted focus:outline-none focus:border-taskati-blue"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-taskati-navy dark:bg-taskati-blue text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm flex-shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'സേവ്' : 'Save'}</span>
            </button>
          </div>
          <p className="text-[11px] text-taskati-muted dark:text-gray-400">
            {language === 'ml'
              ? '💡 ഉദാഹരണത്തിന്: 9876543210 അല്ലെങ്കിൽ +919876543210'
              : '💡 e.g., 9876543210 or with country code +919876543210'}
          </p>
        </form>

        {/* Two Separate Notification Dispatch Cards */}
        <div className="space-y-3">
          {/* 1. COMPLETED TASKS NOTIFICATION */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    {language === 'ml' ? '1. പൂർത്തിയായവയുടെ നോട്ടിഫിക്കേഷൻ' : '1. Completed Tasks Report'}
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {completedCount} / {tasks.length} {language === 'ml' ? 'ദിനചര്യകൾ പൂർത്തിയായി' : 'routines completed today'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendCompletedWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'ml' ? 'WhatsApp-ലേക്ക് അയക്കുക' : 'Send via WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendCompletedSMS}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#181C33] border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-1"
                title="Send via SMS"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
            </div>
          </div>

          {/* 2. PENDING TASKS NOTIFICATION */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    {language === 'ml' ? '2. പൂർത്തിയാവാത്തവയുടെ പ്രത്യേക ഓർമ്മപ്പെടുത്തൽ' : '2. Pending Tasks Reminder'}
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    {pendingCount} {language === 'ml' ? 'ദിനചര്യകൾ ഇനിയും ബാക്കിയുണ്ട്' : 'routines remaining to complete'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendPendingWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'ml' ? 'ബാക്കിയുള്ളവ WhatsApp-ൽ ഓർമ്മിപ്പിക്കുക' : 'Send Pending Reminder (WhatsApp)'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendPendingSMS}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-[#181C33] border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold text-xs hover:bg-amber-50 transition-all flex items-center gap-1"
                title="Send via SMS"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Previews Accordion */}
        <div className="p-3.5 bg-taskati-bg dark:bg-[#14182E] rounded-3xl border border-taskati-border dark:border-white/10 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-taskati-navy dark:text-white">
              {language === 'ml' ? 'സന്ദേശത്തിന്റെ മാതൃക (Preview)' : 'Message Preview Format'}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                  activeTab === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'text-taskati-muted hover:text-taskati-navy'
                }`}
              >
                {language === 'ml' ? 'പൂർത്തിയായവ' : 'Completed'}
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                  activeTab === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'text-taskati-muted hover:text-taskati-navy'
                }`}
              >
                {language === 'ml' ? 'ബാക്കിയുള്ളവ' : 'Pending'}
              </button>
            </div>
          </div>

          <pre className="p-3 bg-white dark:bg-[#181C33] rounded-2xl border border-taskati-border dark:border-white/10 font-mono text-[11px] text-taskati-navy dark:text-gray-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
            {activeTab === 'completed' ? completedReportText : pendingReportText}
          </pre>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-taskati-bg dark:bg-white/10 text-taskati-navy dark:text-white font-bold rounded-2xl text-xs hover:bg-taskati-border transition-all"
        >
          {language === 'ml' ? 'ശരി / അടയ്ക്കുക' : 'Close'}
        </button>
      </div>
    </div>
  );
}
