import { Task } from '@/types/task';
import { Language } from './translations';
import { sendLocalNotification } from './notifications';
import { generatePendingReport, openWhatsApp } from './whatsappHelper';

export interface NextTaskInfo {
  task: Task | null;
  minutesRemaining: number;
  timeFormatted: string;
}

export class AutoNotificationEngine {
  private static instance: AutoNotificationEngine | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private tasks: Task[] = [];
  private language: Language = 'ml';
  private onAlertTriggered?: (task: Task) => void;

  public static getInstance(): AutoNotificationEngine {
    if (!AutoNotificationEngine.instance) {
      AutoNotificationEngine.instance = new AutoNotificationEngine();
    }
    return AutoNotificationEngine.instance;
  }

  public init(
    tasks: Task[],
    language: Language,
    onAlertTriggered?: (task: Task) => void
  ) {
    this.tasks = tasks;
    this.language = language;
    this.onAlertTriggered = onAlertTriggered;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Run immediate check
    this.checkSchedules();

    // Run continuous background check every 10 seconds
    this.intervalId = setInterval(() => {
      this.checkSchedules();
    }, 10000);

    // Also check immediately when phone screen wakes up / tab becomes visible
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibility);
      document.addEventListener('visibilitychange', this.handleVisibility);
    }
  }

  public updateTasks(tasks: Task[], language: Language) {
    this.tasks = tasks;
    this.language = language;
  }

  private handleVisibility = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.checkSchedules();
    }
  };

  public checkSchedules() {
    if (typeof window === 'undefined' || this.tasks.length === 0) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;
    const todayDateStr = now.toISOString().split('T')[0];

    // Check each uncompleted task against current time
    this.tasks.forEach((task) => {
      if (!task.completed && task.time === currentTimeStr) {
        const alertLockKey = `auto_fired_${task.id}_${todayDateStr}_${currentTimeStr}`;
        if (!sessionStorage.getItem(alertLockKey)) {
          sessionStorage.setItem(alertLockKey, 'true');

          const title =
            this.language === 'ml' && task.malayalamTitle
              ? task.malayalamTitle
              : task.title;

          const subtitle =
            task.arabicTitle ||
            (this.language === 'ml' && task.malayalamSubtitle
              ? task.malayalamSubtitle
              : task.subtitle) ||
            '';

          // Automatic Sound Bell + Phone Vibration + In-App Banner + Push Notification
          sendLocalNotification(
            this.language === 'ml' ? `⏰ സമയമായി: ${title}` : `⏰ Routine Reminder: ${title}`,
            subtitle
              ? `${subtitle} • ${task.time}`
              : this.language === 'ml'
              ? `${task.time} - ഈ ദിനചര്യ പൂർത്തിയാക്കാനുള്ള സമയമായി!`
              : `It is ${task.time}. Time to complete your scheduled routine!`
          );

          if (this.onAlertTriggered) {
            this.onAlertTriggered(task);
          }
        }
      }
    });

    // Check for Automatic Evening WhatsApp Review (Default at 21:30 if phone is configured)
    const eveningReviewLockKey = `auto_whatsapp_evening_${todayDateStr}`;
    const savedPhone = localStorage.getItem('taskati_saved_phone_number_v1');
    const autoWhatsAppEnabled = localStorage.getItem('taskati_auto_whatsapp_enabled_v1') !== 'false';

    if (currentTimeStr === '21:30' && savedPhone && autoWhatsAppEnabled && !sessionStorage.getItem(eveningReviewLockKey)) {
      sessionStorage.setItem(eveningReviewLockKey, 'true');
      const pendingTasks = this.tasks.filter((t) => !t.completed);
      if (pendingTasks.length > 0) {
        sendLocalNotification(
          this.language === 'ml' ? '🌙 ഇന്നത്തെ ബാക്കിയുള്ള ദിനചര്യകൾ' : '🌙 Evening Daily Routine Review',
          this.language === 'ml'
            ? `${pendingTasks.length} ദിനചര്യകൾ പൂർത്തിയാക്കാനുണ്ട്. WhatsApp-ലേക്ക് ഓർമ്മപ്പെടുത്തൽ അയക്കാം.`
            : `You have ${pendingTasks.length} pending routines. Ready to review.`
        );
      }
    }
  }

  public getNextTaskInfo(): NextTaskInfo {
    if (this.tasks.length === 0) {
      return { task: null, minutesRemaining: 0, timeFormatted: '' };
    }

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let upcomingTask: Task | null = null;
    let minDiff = Infinity;

    this.tasks.forEach((t) => {
      if (!t.completed && t.time) {
        const [h, m] = t.time.split(':').map((num) => parseInt(num, 10));
        if (!isNaN(h) && !isNaN(m)) {
          const taskTotalMinutes = h * 60 + m;
          let diff = taskTotalMinutes - currentTotalMinutes;
          // If task is later today
          if (diff >= 0 && diff < minDiff) {
            minDiff = diff;
            upcomingTask = t;
          }
        }
      }
    });

    // If none found later today, grab the first pending task
    if (!upcomingTask) {
      upcomingTask = this.tasks.find((t) => !t.completed) || null;
      if (upcomingTask) {
        const [h, m] = upcomingTask.time.split(':').map((num) => parseInt(num, 10));
        minDiff = 24 * 60 - currentTotalMinutes + (h * 60 + m);
      }
    }

    return {
      task: upcomingTask,
      minutesRemaining: minDiff === Infinity ? 0 : minDiff,
      timeFormatted: upcomingTask ? upcomingTask.time : ''
    };
  }

  public destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibility);
    }
  }
}
