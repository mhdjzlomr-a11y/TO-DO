'use client';

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, sendLocalNotification, playChimeSound, triggerHaptic } from '@/lib/notifications';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { BellRing, CheckCircle2, AlertTriangle, Sparkles, Volume2, Info, X } from 'lucide-react';

interface NotificationBannerProps {
  language?: Language;
}

export default function NotificationBanner({ language = 'en' }: NotificationBannerProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setPermission(Notification.permission);
      } else {
        setPermission('unsupported');
      }
    }
  }, []);

  const handleEnable = async () => {
    triggerHaptic([40]);
    playChimeSound(); // Immediately play sound to unlock audio and confirm working

    const res = await requestNotificationPermission();
    setPermission(res.status);

    // Send immediate confirmation alert (both sound and visual)
    sendLocalNotification(
      language === 'ml' ? 'അറിയിപ്പുകൾ സജീവം! 🔔' : 'Routine Alerts Enabled! 🔔',
      language === 'ml'
        ? 'നിശ്ചിത സമയങ്ങളിൽ നിങ്ങളുടെ ദിനചര്യകൾ ഓർമ്മിപ്പിക്കുന്നതാണ്.'
        : 'You will receive audio chimes and reminders for your scheduled daily routines.'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const handleTestAlert = () => {
    triggerHaptic([50]);
    playChimeSound();
    sendLocalNotification(
      language === 'ml' ? '⏰ ഓർമ്മപ്പെടുത്തൽ: സമയമായി' : '⏰ Routine Reminder: YASEEN',
      language === 'ml'
        ? 'സൂറത്തു യാസീൻ ഓതാനുള്ള സമയമായി! (ടെസ്റ്റ് അലർട്ട് വിജയകരം)'
        : "It is time for your scheduled routine! (Sound & alert test successful)"
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  // If granted
  if (permission === 'granted') {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-3xl text-xs transition-all shadow-sm">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{t.alertsActive}</span>
        </div>
        <button
          onClick={handleTestAlert}
          className="px-3.5 py-1.5 bg-white dark:bg-[#181C33] text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 transition-all text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{testSent ? (language === 'ml' ? 'ശബ്ദം മുഴങ്ങി! ✨' : 'Playing! ✨') : t.testAlert}</span>
        </button>
      </div>
    );
  }

  // If denied or unsupported (HTTP over LAN)
  if (permission === 'denied' || permission === 'unsupported') {
    return (
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-3xl text-xs space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              {language === 'ml'
                ? 'ഇൻ-ആപ്പ് ശബ്ദ അറിയിപ്പുകൾ സജീവം'
                : 'In-App Sound & Visual Alerts are ACTIVE!'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestAlert}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testSent ? (language === 'ml' ? 'ശബ്ദം മുഴങ്ങി! ✨' : 'Playing! ✨') : t.testAlert}</span>
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-1 rounded-full text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              title="Help"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="pt-2 border-t border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <p>
              {language === 'ml'
                ? '💡 ബ്രൗസർ സെറ്റിംഗ്സിൽ നോട്ടിഫിക്കേഷൻ ബ്ലോക്ക് ആണെങ്കിലും, ആപ്പ് തുറന്നിരിക്കുമ്പോൾ കൃത്യസമയത്ത് ശബ്ദ അലർട്ടുകളും ബാനറുകളും മുഴങ്ങും.'
                : '💡 Even if browser system push is blocked, in-app bell chimes and banners will sound automatically whenever a task time arrives.'}
            </p>
            <p className="opacity-80">
              {language === 'ml'
                ? 'സിസ്റ്റം നോട്ടിഫിക്കേഷൻ ഓൺ ചെയ്യാൻ: ബ്രൗസർ അഡ്രസ് ബാറിലെ 🔒 ലോക്ക് ഐക്കണിൽ തൊട്ട് "Notifications" Allow ചെയ്യുക.'
                : 'To enable full system push: Click the 🔒 lock icon in the browser address bar and change Notifications to "Allow".'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default: Prompt to Enable
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-taskati-blue-light via-white to-taskati-pink-light dark:from-[#1E2345] dark:via-[#181C33] dark:to-[#2B1B36] border border-taskati-border dark:border-white/10 rounded-3xl shadow-taskati-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-taskati-blue text-white flex items-center justify-center flex-shrink-0 shadow-taskati">
          <BellRing className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-taskati-navy dark:text-white">
            {t.enableReminders}
          </h4>
          <p className="text-[11px] text-taskati-muted dark:text-gray-400">
            {t.enableRemindersDesc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={handleTestAlert}
          className="px-3 py-2 rounded-2xl bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 text-taskati-navy dark:text-gray-200 text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5"
          title="Test Alert Sound"
        >
          <Volume2 className="w-3.5 h-3.5 text-taskati-blue" />
          <span>{testSent ? '🔔 Rung!' : t.testAlert}</span>
        </button>

        <button
          onClick={handleEnable}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-taskati-blue to-taskati-blue-hover text-white text-xs font-bold shadow-taskati hover:shadow-taskati-float transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.enableAlerts}</span>
        </button>
      </div>
    </div>
  );
}
