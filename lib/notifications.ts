// Notification and audio helper for Daily Task Tracker PWA

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

export function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio context may require user gesture on some browsers
  }
}

export function triggerHaptic(pattern = [60, 40, 60]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

export async function sendLocalNotification(title: string, body: string, tag = 'daily-task') {
  if (typeof window === 'undefined') return;

  // Sound & Haptic
  playChimeSound();
  triggerHaptic([100, 50, 100]);

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Try service worker registration first
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
    } catch (err) {
      console.warn('SW notification fallback to web notification', err);
    }
  }

  // Fallback to standard web notification
  try {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag
    });
  } catch (err) {
    console.error('Failed to show notification', err);
  }
}
