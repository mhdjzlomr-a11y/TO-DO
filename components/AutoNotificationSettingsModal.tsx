'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { Language } from '@/lib/translations';
import { playChimeSound, triggerHaptic, sendLocalNotification } from '@/lib/notifications';
import {
  X,
  BellRing,
  Volume2,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Moon
} from 'lucide-react';

interface AutoNotificationSettingsModalProps {
  tasks: Task[];
  language: Language;
  onClose: () => void;
}

export default function AutoNotificationSettingsModal({
  tasks,
  language,
  onClose,
}: AutoNotificationSettingsModalProps) {
  const [autoSound, setAutoSound] = useState(true);
  const [autoVibrate, setAutoVibrate] = useState(true);
  const [autoWhatsApp, setAutoWhatsApp] = useState(true);
  const [testSent, setTestSent] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(language === 'ml' ? 'ml-IN' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  const handleTestNow = () => {
    triggerHaptic([60, 40, 60]);
    playChimeSound();
    sendLocalNotification(
      language === 'ml' ? '⚡ ഓട്ടോമാറ്റിക് അലർട്ട് സിസ്റ്റം സജീവം!' : '⚡ Automatic System ACTIVE!',
      language === 'ml'
        ? 'ഓരോ ദിനചര്യയുടെയും സമയമാകുമ്പോൾ ശബ്ദവും അറിയിപ്പും തനിയെ വരുന്നതാണ്.'
        : 'Sound and notifications will trigger automatically at each scheduled task time.'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const nextPendingTask = tasks.find((t) => !t.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taskati-navy/60 backdrop-blur-sm animate-pop overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-[#181C33] rounded-4xl p-6 shadow-taskati-float border border-taskati-border dark:border-white/10 relative my-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-taskati-blue-light dark:bg-taskati-blue/20 text-taskati-blue">
              <Zap className="w-5 h-5 text-taskati-blue fill-taskati-blue" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-taskati-navy dark:text-white">
                {language === 'ml' ? 'ഓട്ടോമാറ്റിക് അലർട്ട് സിസ്റ്റം' : 'Auto-Notification System'}
              </h3>
              <p className="text-xs text-taskati-muted dark:text-gray-400">
                {language === 'ml'
                  ? 'കൃത്യസമയത്ത് തനിയെ ശബ്ദവും അറിയിപ്പും വരുന്നു'
                  : 'Automated sound & push alarms at scheduled times'}
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

        {/* Live Active Status Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-taskati space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              {language === 'ml' ? 'സിസ്റ്റം സജീവം (ACTIVE)' : 'System ACTIVE'}
            </span>
            <span className="text-xs font-mono font-bold opacity-90">{currentTime}</span>
          </div>

          <div className="pt-1">
            <h4 className="text-base font-bold">
              {language === 'ml' ? 'ഓട്ടോമാറ്റിക് സിസ്റ്റം പ്രവർത്തിക്കുന്നു' : 'Auto Engine Running in Background'}
            </h4>
            <p className="text-xs opacity-90 mt-0.5">
              {language === 'ml'
                ? 'നിങ്ങൾ ആപ്പ് തുറക്കാതെ തന്നെ നിശ്ചിത സമയത്ത് അലർട്ട് ശബ്ദവും നോട്ടിഫിക്കേഷനും തനിയെ പ്രവർത്തിക്കും.'
                : 'Alerts and sound chimes will fire automatically when task time arrives.'}
            </p>
          </div>

          {nextPendingTask && (
            <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold">
              <span className="opacity-80">{language === 'ml' ? 'അടുത്ത ദിനചര്യ:' : 'Next up:'}</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-xl truncate max-w-[200px]">
                {language === 'ml' && nextPendingTask.malayalamTitle
                  ? nextPendingTask.malayalamTitle
                  : nextPendingTask.title}{' '}
                ({nextPendingTask.time})
              </span>
            </div>
          )}
        </div>

        {/* Automated System Features */}
        <div className="space-y-2.5">
          {/* Feature 1 */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-taskati-bg dark:bg-[#14182E] border border-taskati-border dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-taskati-blue" />
              <div>
                <h5 className="text-xs font-bold text-taskati-navy dark:text-white">
                  {language === 'ml' ? 'ഓട്ടോമാറ്റിക് ബെൽ ശബ്ദം (Chime Sound)' : 'Automatic Chime Sound'}
                </h5>
                <p className="text-[10px] text-taskati-muted dark:text-gray-400">
                  {language === 'ml' ? 'സമയമാകുമ്പോൾ തനിയെ മണിനാദം മുഴങ്ങുന്നു' : 'Rings pleasant bell tone on time'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
              {language === 'ml' ? 'ഓൺ ✅' : 'ON ✅'}
            </span>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-taskati-bg dark:bg-[#14182E] border border-taskati-border dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-taskati-pink" />
              <div>
                <h5 className="text-xs font-bold text-taskati-navy dark:text-white">
                  {language === 'ml' ? 'ഫോൺ വൈബ്രേഷൻ (Vibration)' : 'Phone Vibration Alert'}
                </h5>
                <p className="text-[10px] text-taskati-muted dark:text-gray-400">
                  {language === 'ml' ? 'ഫോൺ വൈബ്രേറ്റ് ചെയ്ത് ശ്രദ്ധ ക്ഷണിക്കുന്നു' : 'Tactile haptic buzz on mobile'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
              {language === 'ml' ? 'ഓൺ ✅' : 'ON ✅'}
            </span>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-taskati-bg dark:bg-[#14182E] border border-taskati-border dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-taskati-purple" />
              <div>
                <h5 className="text-xs font-bold text-taskati-navy dark:text-white">
                  {language === 'ml' ? 'രാത്രിയിലെ WhatsApp റിവ്യൂ (21:30 PM)' : 'Nightly WhatsApp Review (21:30)'}
                </h5>
                <p className="text-[10px] text-taskati-muted dark:text-gray-400">
                  {language === 'ml' ? 'ബാക്കിയുള്ള ദിനചര്യകൾ ഓർമ്മിപ്പിക്കുന്നു' : 'Nightly pending tasks check'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
              {language === 'ml' ? 'സജീവം' : 'Active'}
            </span>
          </div>
        </div>

        {/* Immediate Test Button */}
        <button
          onClick={handleTestNow}
          className="w-full py-3.5 px-4 rounded-3xl bg-gradient-to-r from-taskati-blue to-taskati-purple text-white font-bold text-xs shadow-taskati hover:shadow-taskati-float transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {testSent
              ? (language === 'ml' ? 'ഓട്ടോമാറ്റിക് അലർട്ട് വിജയകരം! 🔔' : 'Alert Triggered! 🔔')
              : (language === 'ml' ? 'സിസ്റ്റം ഇപ്പോൾ തന്നെ ടെസ്റ്റ് ചെയ്യുക 🔔' : 'Test Auto Alert Now 🔔')}
          </span>
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 text-taskati-muted hover:text-taskati-navy dark:hover:text-white text-xs font-bold transition-colors"
        >
          {language === 'ml' ? 'അടയ്ക്കുക' : 'Close'}
        </button>
      </div>
    </div>
  );
}
