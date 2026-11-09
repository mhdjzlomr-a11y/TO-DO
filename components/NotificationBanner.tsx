'use client';

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, sendLocalNotification, triggerHaptic } from '@/lib/notifications';
import { Bell, BellRing, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    triggerHaptic([40]);
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      sendLocalNotification(
        'Daily Routine Alerts Enabled! 🔔',
        'You will now receive reminders for your daily spiritual and learning routines.'
      );
      setTestSent(true);
      setTimeout(() => setTestSent(false), 5000);
    }
  };

  const handleTestNotification = () => {
    triggerHaptic([50]);
    sendLocalNotification(
      '⏰ Test Reminder: Time for Routine',
      'This is how you will be reminded for Yaseen, 100 Isthigfar, Reading, etc.!'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  if (permission === 'granted') {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Push Notifications Active</span>
        </div>
        <button
          onClick={handleTestNotification}
          className="px-3 py-1 bg-white text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all text-[11px]"
        >
          {testSent ? 'Sent! ✨' : 'Test Alert 🔔'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-taskati-blue-light to-taskati-pink-light border border-taskati-border rounded-3xl">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-taskati-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <BellRing className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-taskati-navy">Enable Push Reminders</h4>
          <p className="text-[11px] text-taskati-muted">
            Get sound alerts on your phone at your scheduled task times
          </p>
        </div>
      </div>

      <button
        onClick={handleEnable}
        className="px-4 py-2 rounded-2xl bg-taskati-blue text-white text-xs font-bold shadow-taskati hover:bg-taskati-blue-hover transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Enable Alerts
      </button>
    </div>
  );
}
