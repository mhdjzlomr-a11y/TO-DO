'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);

      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic([40]);
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  if (isStandalone || dismissed) return null;

  return (
    <>
      <div className="bg-taskati-navy text-white rounded-3xl p-4 shadow-taskati-float flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-taskati-blue/30 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-taskati-blue flex items-center justify-center flex-shrink-0 shadow-md">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Install Daily Tasks App</h4>
            <p className="text-[11px] text-white/70">
              Add to your phone Home Screen for instant offline access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-gradient-to-r from-taskati-pink to-taskati-purple text-white text-xs font-bold rounded-2xl shadow-taskati-pink active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-white/50 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taskati-navy/60 backdrop-blur-sm animate-pop">
          <div className="w-full max-w-xs bg-white rounded-4xl p-6 shadow-taskati-float border border-taskati-border text-center">
            <div className="w-12 h-12 rounded-2xl bg-taskati-blue-light text-taskati-blue mx-auto flex items-center justify-center mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-taskati-navy mb-2">Install on iPhone / iPad</h3>
            <ol className="text-xs text-taskati-muted text-left space-y-2 mb-4 bg-taskati-bg p-3.5 rounded-2xl">
              <li>1. Tap the <strong>Share button (⎋)</strong> at the bottom of Safari</li>
              <li>2. Scroll down and tap <strong>"Add to Home Screen" (➕)</strong></li>
              <li>3. Tap <strong>"Add"</strong> in the top right corner</li>
            </ol>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-taskati-navy text-white text-xs font-bold rounded-2xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
