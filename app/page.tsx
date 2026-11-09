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

// Components matching Taskati model
import TaskCard from '@/components/TaskCard';
import OverviewChart from '@/components/OverviewChart';
import InProgressCard from '@/components/InProgressCard';
import TaskListBox from '@/components/TaskListBox';
import YearlyProgressDonut from '@/components/YearlyProgressDonut';
import MainHabitsRow from '@/components/MainHabitsRow';
import DhikrModal from '@/components/DhikrModal';
import ReadingOptionsModal from '@/components/ReadingOptionsModal';
import AddTaskModal from '@/components/AddTaskModal';
import PhoneNotificationModal from '@/components/PhoneNotificationModal';
import AutoNotificationSettingsModal from '@/components/AutoNotificationSettingsModal';
import InstallPwaPrompt from '@/components/InstallPwaPrompt';

import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Hash,
  Flame,
  LayoutDashboard,
  CheckSquare,
  RefreshCw,
  Headphones,
  Moon,
  Sun,
  Globe,
  Phone,
  Smartphone,
  MessageSquare,
  BellRing,
  X,
  Send,
  AlertTriangle,
  Zap,
  FolderGit2,
  Calendar,
  FileBarChart,
  LogOut,
  Bell,
  Settings
} from 'lucide-react';

const STORAGE_KEY = 'taskati_daily_tasks_v1';
const STREAK_KEY = 'taskati_daily_streak_v1';
const LAST_DATE_KEY = 'taskati_last_active_date_v1';
const THEME_KEY = 'taskati_theme_v1';
const LANG_KEY = 'taskati_lang_v1';
const PHONE_KEY = 'taskati_saved_phone_number_v1';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'spiritual' | 'learning'>('all');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'projects' | 'tasks' | 'calendar' | 'report'>('dashboard');

  // Theme & Language
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

  // Initialize theme & language & tasks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Theme
    const savedTheme = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

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
        setStreak(parseInt(savedStreak, 10) || 1);
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
          const newStreak = (parseInt(savedStreak || '1', 10) || 1) + 1;
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

  // Toggle Theme
  const toggleTheme = () => {
    triggerHaptic([30]);
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle Language between ml, en, ar
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

  // Reset Today's Tasks
  const handleResetDay = () => {
    const confirmMsg = language === 'ml'
      ? 'ഇന്നത്തെ ദിനചര്യകൾ പുനഃക്രമീകരിക്കണോ? പഴയ ശീലങ്ങളും സ്ട്രീക്കും നിലനിൽക്കും.'
      : language === 'ar'
      ? 'هل ترغب في إعادة ضبط مهام اليوم؟ ستبقى العادات وأيام الإنجاز محفوظة.'
      : 'Reset all tasks for today? Your routines and streaks will be maintained.';
    if (confirm(confirmMsg)) {
      const reset = tasks.map((item) => ({
        ...item,
        completed: false,
        counterCurrent: item.type === 'counter' ? 0 : item.counterCurrent,
        readingDetails: item.readingDetails ? { ...item.readingDetails, minutesSpent: 0 } : undefined
      }));
      saveTasks(reset);
      triggerHaptic([50, 50]);
    }
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

  // Split tasks into Spiritual Box vs Learning Box
  const spiritualTasks = useMemo(() => {
    return tasks.filter((t) => t.category === 'spiritual').slice(0, 4);
  }, [tasks]);

  const learningTasks = useMemo(() => {
    return tasks.filter((t) => t.category === 'learning' || t.type === 'reading').slice(0, 4);
  }, [tasks]);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-taskati-bg dark:bg-[#0D1021] text-taskati-text dark:text-gray-100 flex flex-col lg:flex-row pb-24 lg:pb-8 transition-colors duration-200"
    >
      {/* Floating In-App Alert Toast Banner */}
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-pop">
          <div className="bg-taskati-navy dark:bg-taskati-blue text-white rounded-3xl p-4 shadow-taskati-float flex items-center justify-between gap-3 border border-white/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                <BellRing className="w-5 h-5 text-amber-300" />
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

      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (Exact Taskati Model from Screenshot)    */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-[#14182E] border-r dark:border-white/10 border-taskati-border p-6 justify-between flex-shrink-0">
        <div>
          {/* Logo matching Taskati. / تاسكاتي. */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <h1 className="text-2xl font-black text-taskati-navy dark:text-white tracking-tight flex items-center">
              {language === 'ar' ? 'تاسكاتي.' : 'Taskati.'}
            </h1>
          </div>

          {/* Nav List exactly like screenshot */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveNav('dashboard'); setActiveFilter('all'); }}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-taskati-blue text-white shadow-taskati'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => { setActiveNav('projects'); setActiveFilter('spiritual'); }}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeNav === 'projects'
                  ? 'bg-taskati-blue text-white shadow-taskati'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>{t.projects}</span>
            </button>

            <button
              onClick={() => { setActiveNav('tasks'); setActiveFilter('all'); }}
              className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeNav === 'tasks'
                  ? 'bg-taskati-blue text-white shadow-taskati'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{t.dailyTasks}</span>
            </button>

            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.messages}</span>
            </button>

            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5 transition-all"
            >
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>{language === 'ml' ? 'ഓട്ടോ അലർട്ട്' : language === 'ar' ? 'التنبيه التلقائي' : 'Auto Alert'}</span>
            </button>

            <button
              onClick={handleResetDay}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </button>
          </nav>
        </div>

        {/* Taskati Pro Card matching Screenshot */}
        <div className="bg-gradient-to-br from-taskati-blue to-taskati-blue-hover text-white rounded-3xl p-5 shadow-taskati-float relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-3">
            T.
          </div>
          <h4 className="text-sm font-bold">{t.proTitle}</h4>
          <p className="text-[10px] text-white/80 mt-1 mb-3">
            {t.proDesc}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2 bg-white text-taskati-blue font-bold rounded-2xl text-xs shadow-sm hover:bg-white/95 transition-all"
          >
            {t.getPro}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN BODY AREA (Taskati Model)                           */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header Row matching Screenshot */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar matching screenshot */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className={`w-4 h-4 text-taskati-muted absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full py-2.5 rounded-2xl bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 text-xs text-taskati-navy dark:text-white placeholder-taskati-muted focus:outline-none focus:border-taskati-blue shadow-taskati-card font-medium ${
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Language Selector matching screenshot pill */}
            <div className="flex items-center bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 rounded-2xl shadow-taskati-card p-1 text-xs font-bold">
              <button
                onClick={() => cycleLanguage('en')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  language === 'en' ? 'bg-taskati-blue text-white shadow-xs' : 'text-taskati-muted'
                }`}
              >
                Eng (US)
              </button>
              <button
                onClick={() => cycleLanguage('ml')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  language === 'ml' ? 'bg-taskati-blue text-white shadow-xs' : 'text-taskati-muted'
                }`}
              >
                മലയാളം
              </button>
              <button
                onClick={() => cycleLanguage('ar')}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  language === 'ar' ? 'bg-taskati-blue text-white shadow-xs' : 'text-taskati-muted'
                }`}
              >
                العربية
              </button>
            </div>

            {/* Auto Alert indicator button */}
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 rounded-2xl shadow-taskati-card relative hover:bg-emerald-100 transition-all"
              title="Automatic Notification System Status"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-1.5 right-1.5" />
              <Zap className="w-4 h-4 fill-current" />
            </button>

            {/* Notification Bell matching screenshot */}
            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className="p-2.5 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 text-taskati-navy dark:text-gray-200 rounded-2xl shadow-taskati-card relative hover:border-taskati-blue transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-taskati-pink absolute top-2 right-2" />
              <Bell className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 text-taskati-navy dark:text-amber-400 rounded-2xl shadow-taskati-card hover:border-taskati-blue transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar matching screenshot */}
            <div
              onClick={() => setIsPhoneModalOpen(true)}
              className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-taskati-blue to-taskati-purple text-white flex items-center justify-center font-black text-xs shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
              👤
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* TASKATI 3-COLUMN MAIN DASHBOARD (Exact Image Layout)     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS (Charts, Task Boxes, Habits) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Overview Activity Chart */}
            <OverviewChart language={language} />

            {/* 2. Middle Task Boxes: Daily Task & Weekly Task */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TaskListBox
                title={t.dailyTaskTitle}
                tasks={spiritualTasks}
                language={language}
                onToggle={handleToggleTask}
                onAddNew={() => setIsAddModalOpen(true)}
                onOpenCounter={(tk) => setSelectedCounterTask(tk)}
              />

              <TaskListBox
                title={t.weeklyTaskTitle}
                tasks={learningTasks}
                language={language}
                onToggle={handleToggleTask}
                onAddNew={() => setIsAddModalOpen(true)}
                onOpenReading={(tk) => setSelectedReadingTask(tk)}
              />
            </div>

            {/* 3. Main Habits 4-Card Squircle Row */}
            <MainHabitsRow
              tasks={tasks}
              language={language}
              onOpenCounter={(tk) => setSelectedCounterTask(tk)}
              onOpenReading={(tk) => setSelectedReadingTask(tk)}
            />
          </div>

          {/* RIGHT 1 COLUMN (In Progress Cards & Yearly Progress) */}
          <div className="space-y-6">
            {/* In Progress Card with Project Pills */}
            <InProgressCard
              tasks={tasks}
              language={language}
              onOpenCounter={(tk) => setSelectedCounterTask(tk)}
              onOpenReading={(tk) => setSelectedReadingTask(tk)}
              onAddNew={() => setIsAddModalOpen(true)}
            />

            {/* Yearly / Daily Progress Gauge Donut Chart */}
            <YearlyProgressDonut
              completed={completedCount}
              total={totalCount}
              language={language}
            />

            {/* Quick Phone & WhatsApp Dispatch Card */}
            <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-taskati-navy dark:text-white">
                  {language === 'ml' ? 'WhatsApp റിപ്പോർട്ടുകൾ' : language === 'ar' ? 'تقارير واتساب' : 'WhatsApp Reports'}
                </h4>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleQuickSendCompleted}
                  className="w-full py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-between active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'ml' ? 'പൂർത്തിയായവ അയക്കുക' : language === 'ar' ? 'إرسال المنجزة' : 'Send Completed'}</span>
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{completedCount}</span>
                </button>

                <button
                  onClick={handleQuickSendPending}
                  className="w-full py-2 px-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-between active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{language === 'ml' ? 'ബാക്കിയുള്ളവ ഓർമ്മിപ്പിക്കുക' : language === 'ar' ? 'تذكير بالباقي' : 'Send Pending'}</span>
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ALL ROUTINES IN COLORFUL CAPSULE BARS (Image 2 style)   */}
        {/* ======================================================== */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-taskati-navy dark:text-white">
                {t.todayRoutines}
              </h3>
              <p className="text-xs text-taskati-muted dark:text-gray-400">
                {t.routinesDesc}
              </p>
            </div>

            {/* Filter Pills matching Taskati */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 rounded-2xl shadow-taskati-card">
              {(['all', 'pending', 'completed', 'spiritual', 'learning'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeFilter === f
                      ? 'bg-taskati-blue text-white shadow-sm'
                      : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
                  }`}
                >
                  {f === 'all'
                    ? `${t.all} (${totalCount})`
                    : f === 'pending'
                    ? `${t.pending} (${pendingCount})`
                    : f === 'completed'
                    ? `${t.completed} (${completedCount})`
                    : f === 'spiritual'
                    ? t.dhikrAndQuran
                    : t.englishAndReading}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Colorful Capsule Progress Bars */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
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
      </main>

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR                             */}
      {/* ======================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14182E]/95 backdrop-blur-md border-t border-taskati-border dark:border-white/10 px-6 py-2.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => { setActiveNav('dashboard'); setActiveFilter('all'); }}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            activeNav === 'dashboard' ? 'text-taskati-blue' : 'text-taskati-muted dark:text-gray-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t.home}</span>
        </button>

        <button
          onClick={() => setIsPhoneModalOpen(true)}
          className="flex flex-col items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
        >
          <Smartphone className="w-5 h-5" />
          <span>{language === 'ml' ? 'ഫോൺ' : 'Phone'}</span>
        </button>

        {/* Center Floating Plus */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-taskati-blue to-taskati-blue-hover text-white flex items-center justify-center shadow-taskati-float active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            const counterTask = tasks.find((tk) => tk.type === 'counter');
            if (counterTask) setSelectedCounterTask(counterTask);
          }}
          className="flex flex-col items-center gap-1 text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-pink"
        >
          <Hash className="w-5 h-5 text-taskati-pink" />
          <span>{t.counter}</span>
        </button>

        <button
          onClick={() => { setActiveNav('tasks'); setActiveFilter('pending'); }}
          className={`flex flex-col items-center gap-1 text-xs font-bold ${
            activeNav === 'tasks' ? 'text-taskati-blue' : 'text-taskati-muted dark:text-gray-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>{t.pending}</span>
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
