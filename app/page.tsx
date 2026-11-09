'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskCategory, ReadingDetails } from '@/types/task';
import { DEFAULT_TASKS } from '@/lib/defaultTasks';
import { sendLocalNotification, triggerHaptic, playChimeSound } from '@/lib/notifications';
import { Language, TRANSLATIONS } from '@/lib/translations';
import { AutoNotificationEngine } from '@/lib/autoNotificationEngine';
import {
  generateCompletedReport,
  generatePendingReport,
  openWhatsApp
} from '@/lib/whatsappHelper';

// Still Theme Components
import StillTodayFocus from '@/components/StillTodayFocus';
import StillJourneyCard from '@/components/StillJourneyCard';
import StillCategoryPills from '@/components/StillCategoryPills';
import StillTaskCard from '@/components/StillTaskCard';

// Modals
import DhikrModal from '@/components/DhikrModal';
import ReadingOptionsModal from '@/components/ReadingOptionsModal';
import AddTaskModal from '@/components/AddTaskModal';
import PhoneNotificationModal from '@/components/PhoneNotificationModal';
import AutoNotificationSettingsModal from '@/components/AutoNotificationSettingsModal';
import InstallPwaPrompt from '@/components/InstallPwaPrompt';

import {
  Plus,
  BellRing,
  X,
  Bell,
  Globe,
  Zap,
  Star,
  Compass,
  BookOpen,
  Hash,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const STORAGE_KEY = 'taskati_daily_tasks_v1';
const STREAK_KEY = 'taskati_daily_streak_v1';
const LAST_DATE_KEY = 'taskati_last_active_date_v1';
const LANG_KEY = 'taskati_lang_v1';
const PHONE_KEY = 'taskati_saved_phone_number_v1';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<number>(28); // Matches the 28 Days Streak from screenshot!
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'spiritual' | 'learning'>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'programs' | 'insights' | 'profile'>('home');

  // Language
  const [language, setLanguage] = useState<Language>('ml');

  // Modals state
  const [selectedCounterTask, setSelectedCounterTask] = useState<Task | null>(null);
  const [selectedReadingTask, setSelectedReadingTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // In-app alert toast listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string }>;
      if (customEvent.detail) {
        setActiveToast(customEvent.detail);
        setTimeout(() => setActiveToast(null), 6000);
      }
    };
    window.addEventListener('taskati-alert', handleToast);
    return () => window.removeEventListener('taskati-alert', handleToast);
  }, []);

  // Initialize tasks & streak
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Language
    const savedLang = (localStorage.getItem(LANG_KEY) as Language) || 'ml';
    setLanguage(savedLang);

    // Load Tasks & Streak
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem(LAST_DATE_KEY);
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      const savedStreak = localStorage.getItem(STREAK_KEY);

      if (savedStreak) {
        setStreak(parseInt(savedStreak, 10) || 28);
      }

      if (savedTasks) {
        const parsed: Task[] = JSON.parse(savedTasks);
        const merged = parsed.map((item) => {
          const matchDefault = DEFAULT_TASKS.find((d) => d.id === item.id);
          if (matchDefault) {
            return {
              ...item,
              malayalamTitle: item.malayalamTitle || matchDefault.malayalamTitle,
              malayalamSubtitle: item.malayalamSubtitle || matchDefault.malayalamSubtitle
            };
          }
          return item;
        });

        if (savedDate && savedDate !== todayStr) {
          const rolledOver = merged.map((tk) => ({
            ...tk,
            completed: false,
            counterCurrent: tk.type === 'counter' ? 0 : tk.counterCurrent,
            readingDetails: tk.readingDetails ? { ...tk.readingDetails, minutesSpent: 0 } : undefined
          }));
          setTasks(rolledOver);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(rolledOver));
          localStorage.setItem(LAST_DATE_KEY, todayStr);
          const newStreak = (parseInt(savedStreak || '28', 10) || 28) + 1;
          setStreak(newStreak);
          localStorage.setItem(STREAK_KEY, newStreak.toString());
        } else {
          setTasks(merged);
        }
      } else {
        setTasks(DEFAULT_TASKS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
        localStorage.setItem(LAST_DATE_KEY, todayStr);
      }
    } catch (e) {
      setTasks(DEFAULT_TASKS);
    }
    setIsLoaded(true);
  }, []);

  // Initialize Automatic Notification Engine
  useEffect(() => {
    if (tasks.length > 0) {
      AutoNotificationEngine.getInstance().init(tasks, language);
    }
  }, [tasks, language]);

  // Cycle Language
  const cycleLanguage = (targetLang?: Language) => {
    triggerHaptic([30]);
    let nextLang: Language = 'en';
    if (targetLang) {
      nextLang = targetLang;
    } else if (language === 'ml') {
      nextLang = 'en';
    } else if (language === 'en') {
      nextLang = 'ar';
    } else {
      nextLang = 'ml';
    }
    setLanguage(nextLang);
    localStorage.setItem(LANG_KEY, nextLang);
  };

  // Save to LocalStorage
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      } catch (e) {}
    }
  };

  // Toggle Completion
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((item) => {
      if (item.id === taskId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
          counterCurrent: nextCompleted && item.type === 'counter' ? (item.counterTarget || 100) : item.counterCurrent
        };
      }
      return item;
    });
    saveTasks(updated);
  };

  // Update Dhikr Counter
  const handleUpdateCounter = (taskId: string, count: number, markCompleted = false) => {
    const updated = tasks.map((item) => {
      if (item.id === taskId) {
        return {
          ...item,
          counterCurrent: count,
          completed: markCompleted ? true : item.completed,
          completedAt: markCompleted ? new Date().toISOString() : item.completedAt
        };
      }
      return item;
    });
    saveTasks(updated);
    if (selectedCounterTask && selectedCounterTask.id === taskId) {
      setSelectedCounterTask({
        ...selectedCounterTask,
        counterCurrent: count,
        completed: markCompleted ? true : selectedCounterTask.completed
      });
    }
  };

  // Save Reading Options
  const handleSaveReading = (taskId: string, details: ReadingDetails, markCompleted: boolean) => {
    const updated = tasks.map((item) => {
      if (item.id === taskId) {
        return {
          ...item,
          readingDetails: details,
          completed: markCompleted ? true : item.completed,
          completedAt: markCompleted ? new Date().toISOString() : item.completedAt
        };
      }
      return item;
    });
    saveTasks(updated);
  };

  // Add Task
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `custom_${Date.now()}`,
      completed: false
    };
    saveTasks([...tasks, newTask]);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    saveTasks(tasks.filter((item) => item.id !== taskId));
    triggerHaptic([30]);
  };

  // Quick WhatsApp helpers
  const handleQuickSendCompleted = () => {
    const phone = localStorage.getItem(PHONE_KEY) || '';
    if (!phone) {
      setIsPhoneModalOpen(true);
    } else {
      triggerHaptic([40]);
      openWhatsApp(phone, generateCompletedReport(tasks, language, streak));
    }
  };

  const handleQuickSendPending = () => {
    const phone = localStorage.getItem(PHONE_KEY) || '';
    if (!phone) {
      setIsPhoneModalOpen(true);
    } else {
      triggerHaptic([40]);
      openWhatsApp(phone, generatePendingReport(tasks, language));
    }
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.subtitle && task.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.malayalamTitle && task.malayalamTitle.includes(searchQuery)) ||
        (task.arabicTitle && task.arabicTitle.includes(searchQuery));

      if (!matchesSearch) return false;

      if (activeFilter === 'pending') return !task.completed;
      if (activeFilter === 'completed') return task.completed;
      if (activeFilter === 'spiritual') return task.category === 'spiritual';
      if (activeFilter === 'learning') return task.category === 'learning';
      return true;
    });
  }, [tasks, searchQuery, activeFilter]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter((item) => item.completed).length;
  const pendingCount = totalCount - completedCount;

  const dateFormatted = new Date().toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-still-gradient text-white flex flex-col pb-28 select-none"
    >
      {/* Floating In-App Alert Toast Banner */}
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-pop">
          <div className="bg-[#1C183B] text-white rounded-3xl p-4 shadow-still-glow flex items-center justify-between gap-3 border border-[#A58BF8]/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-[#A58BF8]/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                <BellRing className="w-5 h-5 text-[#C4B5FD]" />
              </span>
              <div className="truncate">
                <h4 className="text-xs font-bold truncate">{activeToast.title}</h4>
                <p className="text-[11px] text-white/80 truncate">{activeToast.body}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container constrained for mobile elegance */}
      <div className="w-full max-w-lg mx-auto px-5 pt-8 space-y-6">
        {/* ======================================================== */}
        {/* TOP HEADER (Matching the Still Screenshot)               */}
        {/* ======================================================== */}
        <header className="flex items-start justify-between">
          <div className="space-y-1">
            {/* App Name: Still */}
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>{language === 'ar' ? 'سكون.' : 'Still'}</span>
            </h1>

            {/* Greeting: Good evening, Maya 🌙 */}
            <h2 className="text-xl font-bold text-white/95 flex items-center gap-1.5 pt-1">
              <span>
                {language === 'ml'
                  ? 'അസ്സലാമു അലൈക്കും'
                  : language === 'ar'
                  ? 'السلام عليكم ورحمة الله'
                  : 'Good evening, Maya'}
              </span>
              <span>🌙</span>
            </h2>

            {/* Date: Tuesday, October 26 */}
            <p className="text-xs font-medium text-white/60">
              {dateFormatted}
            </p>
          </div>

          {/* Right Action Icons matching Screenshot */}
          <div className="flex items-center gap-2.5 pt-1">
            {/* Language toggle pill */}
            <button
              onClick={() => cycleLanguage()}
              className="px-2.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white/90 border border-white/15 transition-all flex items-center gap-1"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#C4B5FD]" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Notification Bell with red dot */}
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 relative text-white transition-all"
              title="Notification System"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 absolute top-2 right-2 animate-ping" />
              <Bell className="w-4 h-4" />
            </button>

            {/* Avatar Pill matching 'M' in screenshot with status dot */}
            <div
              onClick={() => setIsPhoneModalOpen(true)}
              className="w-10 h-10 rounded-2xl bg-[#8F73DF] text-white flex items-center justify-center font-black text-sm relative shadow-sm cursor-pointer hover:scale-105 transition-transform"
            >
              <span>M</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1E173D] absolute -top-0.5 -right-0.5" />
            </div>
          </div>
        </header>

        {/* PWA Install Banner */}
        <InstallPwaPrompt />

        {/* ======================================================== */}
        {/* SECTION 1: TODAY'S FOCUS (White Cards from Screenshot)  */}
        {/* ======================================================== */}
        <StillTodayFocus
          tasks={tasks}
          language={language}
          onOpenCounter={(tk) => setSelectedCounterTask(tk)}
          onToggle={handleToggleTask}
        />

        {/* ======================================================== */}
        {/* SECTION 2: YOUR JOURNEY (Streak & Glow Bar)              */}
        {/* ======================================================== */}
        <StillJourneyCard
          streak={streak}
          completedCount={completedCount}
          totalCount={totalCount}
          language={language}
        />

        {/* ======================================================== */}
        {/* SECTION 3: EXPLORE CATEGORIES (Translucent Squircles)    */}
        {/* ======================================================== */}
        <StillCategoryPills
          language={language}
          onSelectCategory={(cat) => setActiveFilter(cat)}
          onOpenPhone={() => setIsPhoneModalOpen(true)}
          onOpenAuto={() => setIsAutoModalOpen(true)}
        />

        {/* ======================================================== */}
        {/* SECTION 4: ALL SCHEDULED ROUTINES                        */}
        {/* ======================================================== */}
        <section className="space-y-3.5 pt-2">
          {/* Header & Filter Pills */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-wide">
              {language === 'ml' ? 'ഇന്നത്തെ ദിനചര്യകൾ' : language === 'ar' ? 'أوراد اليوم' : 'Daily Routines'}
            </h3>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-2xl p-1 text-[11px] font-bold">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded-xl transition-all ${
                    activeFilter === f
                      ? 'bg-[#8F73DF] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {f === 'all'
                    ? `${t.all} (${totalCount})`
                    : f === 'pending'
                    ? `${t.pending} (${pendingCount})`
                    : `${t.completed} (${completedCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List in Serene Glass Style */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <StillTaskCard
                key={task.id}
                task={task}
                language={language}
                onToggle={handleToggleTask}
                onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                onOpenReading={(tk) => setSelectedReadingTask(tk)}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </section>

        {/* WhatsApp Quick Dispatch Button Bar */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleQuickSendCompleted}
            className="flex-1 py-3 px-4 rounded-3xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'ml' ? `പൂർത്തിയായവ (${completedCount}) WhatsApp` : 'Send Completed'}</span>
          </button>

          <button
            onClick={handleQuickSendPending}
            className="flex-1 py-3 px-4 rounded-3xl bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{language === 'ml' ? `ബാക്കിയുള്ളവ (${pendingCount}) WhatsApp` : 'Send Pending'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM FLOATING DOCK (Matching Screenshot Navigation)    */}
      {/* ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#12162E]/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-around shadow-2xl">
        {/* Star / Home */}
        <button
          onClick={() => { setActiveTab('home'); setActiveFilter('all'); }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold relative transition-colors ${
            activeTab === 'home' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Star className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#C4B5FD] fill-current' : ''}`} />
          <span>Home</span>
          {activeTab === 'home' && (
            <span className="w-4 h-0.5 bg-[#C4B5FD] rounded-full absolute -bottom-1" />
          )}
        </button>

        {/* Discover / Tasks */}
        <button
          onClick={() => { setActiveTab('discover'); setActiveFilter('pending'); }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold relative transition-colors ${
            activeTab === 'discover' ? 'text-white' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Discover</span>
          {activeTab === 'discover' && (
            <span className="w-4 h-0.5 bg-[#C4B5FD] rounded-full absolute -bottom-1" />
          )}
        </button>

        {/* Center Floating Plus to Add Routine */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-tr from-[#8F73DF] to-[#B69DF8] text-white flex items-center justify-center shadow-still-glow active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Programs / Reading Hub */}
        <button
          onClick={() => {
            const readTask = tasks.find((tk) => tk.type === 'reading');
            if (readTask) setSelectedReadingTask(readTask);
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span>Programs</span>
        </button>

        {/* Profile / WhatsApp */}
        <button
          onClick={() => setIsPhoneModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors"
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Modals */}
      {selectedCounterTask && (
        <DhikrModal
          task={selectedCounterTask}
          onClose={() => setSelectedCounterTask(null)}
          onUpdateCounter={handleUpdateCounter}
        />
      )}

      {selectedReadingTask && (
        <ReadingOptionsModal
          task={selectedReadingTask}
          onClose={() => setSelectedReadingTask(null)}
          onSaveReading={handleSaveReading}
        />
      )}

      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddModalOpen(false)}
          onAddTask={handleAddTask}
        />
      )}

      {isPhoneModalOpen && (
        <PhoneNotificationModal
          tasks={tasks}
          language={language}
          streak={streak}
          onClose={() => setIsPhoneModalOpen(false)}
        />
      )}

      {isAutoModalOpen && (
        <AutoNotificationSettingsModal
          tasks={tasks}
          language={language}
          onClose={() => setIsAutoModalOpen(false)}
        />
      )}
    </div>
  );
}
