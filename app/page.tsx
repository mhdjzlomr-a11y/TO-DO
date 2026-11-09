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

// Taskati Components
import OverviewChart from '@/components/OverviewChart';
import TaskListBox from '@/components/TaskListBox';
import InProgressCard from '@/components/InProgressCard';
import YearlyProgressDonut from '@/components/YearlyProgressDonut';
import MainHabitsRow from '@/components/MainHabitsRow';
import TaskCard from '@/components/TaskCard';

// Modals
import DhikrModal from '@/components/DhikrModal';
import ReadingOptionsModal from '@/components/ReadingOptionsModal';
import AddTaskModal from '@/components/AddTaskModal';
import PhoneNotificationModal from '@/components/PhoneNotificationModal';
import AutoNotificationSettingsModal from '@/components/AutoNotificationSettingsModal';
import InstallPwaPrompt from '@/components/InstallPwaPrompt';

// Lucide Icons
import {
  Search,
  Bell,
  BellRing,
  Sun,
  Moon,
  Globe,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Clock,
  BookOpen,
  Hash,
  Menu,
  ChevronDown
} from 'lucide-react';

const STORAGE_KEY = 'oneday_daily_tasks_v2';
const STREAK_KEY = 'oneday_daily_streak_v2';
const LAST_DATE_KEY = 'oneday_last_active_date_v2';
const LANG_KEY = 'oneday_lang_v2';
const THEME_KEY = 'oneday_theme_v2';
const PHONE_KEY = 'oneday_saved_phone_number_v2';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<number>(18);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'spiritual' | 'learning'>('all');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'projects' | 'tasks' | 'calendar' | 'report' | 'messages' | 'settings'>('dashboard');

  // Language & Theme
  const [language, setLanguage] = useState<Language>('ml');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [selectedCounterTask, setSelectedCounterTask] = useState<Task | null>(null);
  const [selectedReadingTask, setSelectedReadingTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{ title: string; body: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // Listen to in-app custom event alerts
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

  // Initialize theme, language & tasks from localStorage
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
      const savedTasks = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('taskati_daily_tasks_v1');
      const savedStreak = localStorage.getItem(STREAK_KEY);

      if (savedStreak) {
        setStreak(parseInt(savedStreak, 10) || 18);
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
          const newStreak = (parseInt(savedStreak || '18', 10) || 18) + 1;
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

  // Toggle Dark / Normal Theme
  const toggleTheme = () => {
    triggerHaptic([25]);
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Change Language
  const handleSelectLanguage = (lang: Language) => {
    triggerHaptic([30]);
    setLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
    setIsLangDropdownOpen(false);
  };

  // Save Tasks
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

  // Save Reading
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

  // Reset Day Rollover
  const handleResetDay = () => {
    if (confirm(language === 'ml' ? 'ഇന്നത്തെ എല്ലാ ടാസ്കുകളും റീസെറ്റ് ചെയ്യണോ?' : 'Reset all routines for today?')) {
      const reset = tasks.map((t) => ({
        ...t,
        completed: false,
        counterCurrent: t.type === 'counter' ? 0 : t.counterCurrent,
        readingDetails: t.readingDetails ? { ...t.readingDetails, minutesSpent: 0 } : undefined
      }));
      saveTasks(reset);
      triggerHaptic([50, 50]);
    }
  };

  // Quick WhatsApp Dispatch
  const handleQuickSendCompleted = () => {
    const phone = localStorage.getItem(PHONE_KEY) || localStorage.getItem('taskati_saved_phone_number_v1') || '';
    if (!phone) {
      setIsPhoneModalOpen(true);
    } else {
      triggerHaptic([40]);
      openWhatsApp(phone, generateCompletedReport(tasks, language, streak));
    }
  };

  const handleQuickSendPending = () => {
    const phone = localStorage.getItem(PHONE_KEY) || localStorage.getItem('taskati_saved_phone_number_v1') || '';
    if (!phone) {
      setIsPhoneModalOpen(true);
    } else {
      triggerHaptic([40]);
      openWhatsApp(phone, generatePendingReport(tasks, language));
    }
  };

  // Derived Task Collections
  const spiritualTasks = useMemo(() => tasks.filter((t) => t.category === 'spiritual'), [tasks]);
  const learningTasks = useMemo(() => tasks.filter((t) => t.category === 'learning'), [tasks]);

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

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-taskati-bg dark:bg-[#0D1021] text-taskati-navy dark:text-white flex transition-colors duration-300 select-none"
    >
      {/* Floating In-App Alert Toast Banner */}
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-pop">
          <div className="bg-[#181C33] text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 border border-taskati-blue/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-taskati-blue/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                <BellRing className="w-5 h-5 text-taskati-blue" />
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
      {/* 1. LEFT SIDEBAR (Matching Exact Taskati Layout)          */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#121528] border-r border-taskati-border dark:border-white/5 flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          {/* Logo: ONE DAY. */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-taskati-blue text-white flex items-center justify-center font-black text-lg shadow-sm">
              1
            </span>
            <span className="text-2xl font-black tracking-tight text-taskati-navy dark:text-white font-sans">
              ONE DAY<span className="text-taskati-blue">.</span>
            </span>
          </div>

          {/* Navigation Items matching Taskati image */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'projects', label: t.projects, icon: FolderKanban },
              { id: 'tasks', label: t.myTasks, icon: CheckSquare },
              { id: 'calendar', label: t.calendar, icon: CalendarDays },
              { id: 'report', label: t.report, icon: BarChart3 },
              { id: 'messages', label: t.messages, icon: MessageSquare, onClick: () => setIsPhoneModalOpen(true) },
              { id: 'settings', label: t.settings, icon: Settings, onClick: () => setIsAutoModalOpen(true) },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic([20]);
                    setActiveNav(item.id as any);
                    if (item.onClick) item.onClick();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-taskati-blue text-white shadow-taskati'
                      : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Reset / Day Rollover Button */}
            <button
              onClick={handleResetDay}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all pt-3 border-t border-taskati-border/60 dark:border-white/5"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Card: ONE DAY Pro (matching Taskati screenshot) */}
        <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#5051F9] via-[#6355F6] to-[#7B4EE4] text-white shadow-taskati space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
            T.
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">{t.proTitle}</h4>
            <p className="text-[11px] text-white/80 leading-snug pt-0.5">{t.proDesc}</p>
          </div>
          <button
            onClick={() => setIsAutoModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-white text-taskati-blue font-bold text-xs shadow-sm hover:bg-white/95 active:scale-95 transition-all text-center block"
          >
            {t.getPro}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA                                    */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#121528]/80 backdrop-blur-md border-b border-taskati-border dark:border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-taskati-bg dark:bg-white/5 text-taskati-navy dark:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-lg font-black tracking-tight text-taskati-navy dark:text-white">
              ONE DAY<span className="text-taskati-blue">.</span>
            </span>
          </div>

          {/* Search Box matching screenshot */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md bg-taskati-bg dark:bg-[#181C33] px-3.5 py-2 rounded-2xl border border-taskati-border/60 dark:border-white/5 focus-within:border-taskati-blue">
            <Search className="w-4 h-4 text-taskati-muted dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-transparent text-xs font-semibold outline-none w-full text-taskati-navy dark:text-white placeholder:text-taskati-muted dark:placeholder:text-gray-500"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-taskati-bg dark:bg-[#181C33] border border-taskati-border/60 dark:border-white/5 text-xs font-bold text-taskati-navy dark:text-white hover:border-taskati-blue transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-taskati-blue" />
                <span>
                  {language === 'en' ? 'Eng (US)' : language === 'ml' ? 'മലയാളം' : 'العربية'}
                </span>
                <ChevronDown className="w-3 h-3 text-taskati-muted" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#181C33] rounded-2xl shadow-xl border border-taskati-border dark:border-white/10 p-1.5 z-40 animate-pop">
                  {[
                    { id: 'ml', label: 'മലയാളം' },
                    { id: 'en', label: 'Eng (US)' },
                    { id: 'ar', label: 'العربية' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleSelectLanguage(l.id as Language)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        language === l.id
                          ? 'bg-taskati-blue text-white'
                          : 'text-taskati-navy dark:text-gray-300 hover:bg-taskati-bg dark:hover:bg-white/5'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-taskati-bg dark:bg-[#181C33] border border-taskati-border/60 dark:border-white/5 text-xs font-bold text-taskati-navy dark:text-white hover:border-taskati-blue transition-all flex items-center gap-1.5"
              title={theme === 'dark' ? t.themeLight : t.themeDark}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">{t.themeLight}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">{t.themeDark}</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-2xl bg-taskati-bg dark:bg-[#181C33] border border-taskati-border/60 dark:border-white/5 text-taskati-navy dark:text-white hover:border-taskati-blue relative transition-all"
              title={t.alertsActive}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping" />
              <Bell className="w-4 h-4" />
            </button>

            {/* User Avatar */}
            <div
              onClick={() => setIsPhoneModalOpen(true)}
              className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#5051F9] to-[#7B4EE4] text-white flex items-center justify-center font-black text-xs relative cursor-pointer hover:scale-105 transition-transform shadow-xs"
            >
              <span>1</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#121528] absolute -top-0.5 -right-0.5" />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#121528] border-b border-taskati-border dark:border-white/10 p-4 space-y-2 animate-pop">
            <div className="flex items-center gap-2 pb-2 border-b border-taskati-border/60 dark:border-white/5">
              <span className="text-sm font-bold text-taskati-navy dark:text-white">
                {t.greeting}
              </span>
            </div>
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'projects', label: t.projects, icon: FolderKanban },
              { id: 'tasks', label: t.myTasks, icon: CheckSquare },
              { id: 'messages', label: t.quickWhatsApp, icon: MessageSquare, onClick: () => setIsPhoneModalOpen(true) },
              { id: 'settings', label: t.settings, icon: Settings, onClick: () => setIsAutoModalOpen(true) },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-taskati-navy dark:text-white hover:bg-taskati-bg dark:hover:bg-white/5"
              >
                <item.icon className="w-4 h-4 text-taskati-blue" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* PWA Install Prompt */}
        <div className="px-4 sm:px-8 pt-4">
          <InstallPwaPrompt />
        </div>

        {/* ======================================================== */}
        {/* 3. TASKATI DASHBOARD GRID (Matching Screenshot)          */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-8 py-6 space-y-6">
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ---------------------------------------------------- */}
            {/* LEFT 2 COLUMNS (Overview + Task Boxes + Habits)     */}
            {/* ---------------------------------------------------- */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Overview Chart */}
              <OverviewChart tasks={tasks} language={language} />

              {/* 2. Middle Row: 2 Task Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Daily Task Box (Spiritual Routines) */}
                <TaskListBox
                  title={t.dailyTaskTitle}
                  tasks={spiritualTasks.slice(0, 5)}
                  language={language}
                  onToggle={handleToggleTask}
                  onAddNew={() => setIsAddModalOpen(true)}
                  onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                />

                {/* Weekly Task Box (Learning & Reading) */}
                <TaskListBox
                  title={t.weeklyTaskTitle}
                  tasks={learningTasks}
                  language={language}
                  onToggle={handleToggleTask}
                  onAddNew={() => setIsAddModalOpen(true)}
                  onOpenReading={(tk) => setSelectedReadingTask(tk)}
                />
              </div>

              {/* 3. Main Habits (Yearly) Squircle Row */}
              <MainHabitsRow
                tasks={tasks}
                language={language}
                onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                onOpenReading={(tk) => setSelectedReadingTask(tk)}
              />
            </div>

            {/* ---------------------------------------------------- */}
            {/* RIGHT 1 COLUMN (In Progress + Donut + WhatsApp)      */}
            {/* ---------------------------------------------------- */}
            <div className="space-y-6">
              {/* 1. In Progress Card */}
              <InProgressCard
                tasks={tasks}
                language={language}
                onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                onOpenReading={(tk) => setSelectedReadingTask(tk)}
                onAddNew={() => setIsAddModalOpen(true)}
              />

              {/* 2. Yearly Progress Donut */}
              <YearlyProgressDonut
                completed={completedCount}
                total={totalCount}
                language={language}
              />

              {/* 3. WhatsApp & SMS Reports Quick Dispatch Card */}
              <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-taskati-navy dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.quickWhatsApp}</span>
                  </h4>
                  <button
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="text-[10px] font-bold text-taskati-blue hover:underline"
                  >
                    {t.managePhone}
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {/* Button 1: Send Completed */}
                  <button
                    onClick={handleQuickSendCompleted}
                    className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {language === 'ml'
                        ? `പൂർത്തിയായവ (${completedCount}) WhatsApp`
                        : `${t.sendCompleted} (${completedCount})`}
                    </span>
                  </button>

                  {/* Button 2: Send Pending */}
                  <button
                    onClick={handleQuickSendPending}
                    className="w-full py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      {language === 'ml'
                        ? `ബാക്കിയുള്ളവ (${pendingCount}) WhatsApp`
                        : `${t.sendPending} (${pendingCount})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. LOWER SECTION: ALL 13 ROUTINES IN COLORFUL CAPSULES  */}
          {/* ======================================================== */}
          <section className="bg-white dark:bg-[#181C33] rounded-3xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card space-y-5">
            {/* Header & Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-taskati-border/60 dark:border-white/5">
              <div>
                <h3 className="text-base font-bold text-taskati-navy dark:text-white flex items-center gap-2">
                  <span>{t.routinesCapsules}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-taskati-blue/10 text-taskati-blue">
                    {completedCount}/{totalCount}
                  </span>
                </h3>
                <p className="text-[11px] text-taskati-muted dark:text-gray-400">
                  {language === 'ml'
                    ? '13 ദിനചര്യകളുടെയും വർണ്ണാഭമായ പുരോഗതി ബാറുകൾ'
                    : '13 Daily Routines with colorful progress capsule bars'}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-taskati-bg dark:bg-[#121528] p-1 rounded-2xl border border-taskati-border/60 dark:border-white/5 text-[11px] font-bold">
                {(['all', 'pending', 'completed', 'spiritual', 'learning'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-xl transition-all ${
                      activeFilter === f
                        ? 'bg-taskati-blue text-white shadow-xs'
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
                      ? t.spiritual
                      : t.learning}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Colorful Capsule Bars matching image */}
            <div className="space-y-3.5">
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
      </div>

      {/* ======================================================== */}
      {/* 5. MODALS & POPUPS                                       */}
      {/* ======================================================== */}
      {/* 100x Dhikr Counter Modal */}
      {selectedCounterTask && (
        <DhikrModal
          task={selectedCounterTask}
          language={language}
          onClose={() => setSelectedCounterTask(null)}
          onUpdateCount={(count, markCompleted) =>
            handleUpdateCounter(selectedCounterTask.id, count, markCompleted)
          }
        />
      )}

      {/* Daily Reading Options Hub Modal */}
      {selectedReadingTask && (
        <ReadingOptionsModal
          task={selectedReadingTask}
          language={language}
          onClose={() => setSelectedReadingTask(null)}
          onSave={(details, markCompleted) =>
            handleSaveReading(selectedReadingTask.id, details, markCompleted)
          }
        />
      )}

      {/* Add Custom Routine Modal */}
      {isAddModalOpen && (
        <AddTaskModal
          language={language}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTask}
        />
      )}

      {/* Phone Notification & WhatsApp Settings Modal */}
      {isPhoneModalOpen && (
        <PhoneNotificationModal
          tasks={tasks}
          language={language}
          streak={streak}
          onClose={() => setIsPhoneModalOpen(false)}
        />
      )}

      {/* Auto-Notification Engine Status Modal */}
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
