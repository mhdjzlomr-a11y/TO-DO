// Enhanced Notification, Sound & In-App Toast Helper for Taskati PWA

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Note 2: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.35, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);

    // Note 3: C#6 (1108.73 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1108.73, now + 0.24);
    gain3.gain.setValueAtTime(0.001, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.4, now + 0.29);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.24);
    osc3.stop(now + 0.85);
  } catch (e) {
    console.warn('Audio chime error:', e);
  }
}

export function triggerHaptic(pattern = [60, 40, 60]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

export async function requestNotificationPermission(): Promise<{
  status: NotificationPermission | 'unsupported';
  message?: string;
}> {
  if (typeof window === 'undefined') {
    return { status: 'unsupported', message: 'Window is not defined' };
  }

  // Pre-unlock audio context on this user click
  getAudioContext();

  if (!('Notification' in window)) {
    return {
      status: 'unsupported',
      message: 'Web notifications are not supported in this browser or over insecure HTTP.'
    };
  }

  try {
    const permission = await Notification.requestPermission();
    return { status: permission };
  } catch (error) {
    console.error('Notification permission request error:', error);
    // Safari callback style fallback
    return new Promise((resolve) => {
      try {
        Notification.requestPermission((p) => {
          resolve({ status: p });
        });
      } catch (err) {
        resolve({ status: 'denied', message: String(err) });
      }
    });
  }
}

// Dispatches both browser notification AND in-app floating banner
export async function sendLocalNotification(title: string, body: string, tag = 'daily-task') {
  if (typeof window === 'undefined') return;

  // 1. Play sound chime
  playChimeSound();

  // 2. Trigger phone vibration
  triggerHaptic([100, 60, 100, 60, 150]);

  // 3. Dispatch in-app visual toast event so it always shows on screen!
  try {
    const event = new CustomEvent('taskati-alert', {
      detail: { title, body, tag, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  } catch (e) {}

  // 4. If browser system notification is permitted, show it
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          const options: NotificationOptions & { vibrate?: number[] } = {
            body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag,
            vibrate: [200, 100, 200],
            data: { url: '/' }
          };
          reg.showNotification(title, options as NotificationOptions);
          return;
        }
      } catch (swErr) {
        console.warn('SW notification fallback to web notification', swErr);
      }
    }

    try {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        tag
      });
    } catch (err) {
      console.warn('Web notification error:', err);
    }
  }
}
