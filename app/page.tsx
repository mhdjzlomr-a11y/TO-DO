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

// Components
import OverviewChart from '@/components/OverviewChart';
import TaskListBox from '@/components/TaskListBox';
import InProgressCard from '@/components/InProgressCard';
import YearlyProgressDonut from '@/components/YearlyProgressDonut';
import DailyProgressCard from '@/components/DailyProgressCard';
import MainHabitsRow from '@/components/MainHabitsRow';
import TaskCard from '@/components/TaskCard';

// Sub-Views for Sidebar
import ProjectsView from '@/components/views/ProjectsView';
import MyTasksView from '@/components/views/MyTasksView';
import CalendarView from '@/components/views/CalendarView';
import ReportView from '@/components/views/ReportView';

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
  Menu,
  ChevronDown,
  ShieldCheck,
  Check,
  Layers
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'projects' | 'tasks' | 'calendar' | 'report'>('dashboard');

  // Language & Theme
  const [language, setLanguage] = useState<Language>('ml');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFreeProModal, setShowFreeProModal] = useState(false);

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

  // Initialize theme, language & tasks
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
      {/* 1. LEFT SIDEBAR                                          */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#121528] border-r border-taskati-border dark:border-white/5 flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          {/* Logo: ONE DAY. */}
          <div
            onClick={() => setActiveNav('dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="w-8 h-8 rounded-xl bg-taskati-blue text-white flex items-center justify-center font-black text-lg shadow-sm">
              1
            </span>
            <span className="text-2xl font-black tracking-tight text-taskati-navy dark:text-white font-sans">
              ONE DAY<span className="text-taskati-blue">.</span>
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'projects', label: t.projects, icon: FolderKanban },
              { id: 'tasks', label: t.myTasks, icon: CheckSquare },
              { id: 'calendar', label: t.calendar, icon: CalendarDays },
              { id: 'report', label: t.report, icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic([20]);
                    setActiveNav(item.id as any);
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

            {/* Messages / WhatsApp Button */}
            <button
              onClick={() => {
                triggerHaptic([20]);
                setIsPhoneModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>{t.messages}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                triggerHaptic([20]);
                setIsAutoModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span>{t.settings}</span>
            </button>

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

        {/* Bottom Card: ONE DAY Lifetime Free Pro */}
        <div
          onClick={() => setShowFreeProModal(true)}
          className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#5051F9] via-[#6355F6] to-[#7B4EE4] text-white shadow-taskati space-y-3 cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold tracking-tight">ONE DAY Pro</h4>
              <span className="text-[9px] font-black bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-md">FREE</span>
            </div>
            <p className="text-[11px] text-white/80 leading-snug pt-0.5">
              {language === 'ml' ? '100% ലൈഫ് ടൈം സൗജന്യം' : '100% Lifetime Free Active'}
            </p>
          </div>
          <button
            type="button"
            className="w-full py-2 px-3 rounded-xl bg-white text-taskati-blue font-bold text-xs shadow-sm hover:bg-white/95 text-center block"
          >
            {language === 'ml' ? 'സജീവം (Active)' : 'Full Version Active'}
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
            <span
              onClick={() => setActiveNav('dashboard')}
              className="text-lg font-black tracking-tight text-taskati-navy dark:text-white cursor-pointer"
            >
              ONE DAY<span className="text-taskati-blue">.</span>
            </span>
          </div>

          {/* Search Box */}
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
            {/* Language Selector */}
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
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'projects', label: t.projects, icon: FolderKanban },
              { id: 'tasks', label: t.myTasks, icon: CheckSquare },
              { id: 'calendar', label: t.calendar, icon: CalendarDays },
              { id: 'report', label: t.report, icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeNav === item.id
                    ? 'bg-taskati-blue text-white'
                    : 'text-taskati-navy dark:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* PWA Prompt */}
        <div className="px-4 sm:px-8 pt-4">
          <InstallPwaPrompt />
        </div>

        {/* ======================================================== */}
        {/* 3. DYNAMIC CONTENT: SWITCHES BASED ON ACTIVE TAB         */}
        {/* ======================================================== */}
        <main className="px-4 sm:px-8 py-6 space-y-6">
          {/* TAB 1: PROJECTS & ROUTINES VIEW */}
          {activeNav === 'projects' && (
            <ProjectsView
              tasks={tasks}
              language={language}
              onToggle={handleToggleTask}
              onOpenCounter={(tk) => setSelectedCounterTask(tk)}
              onOpenReading={(tk) => setSelectedReadingTask(tk)}
              onAddNew={() => setIsAddModalOpen(true)}
            />
          )}

          {/* TAB 2: MY TASKS VIEW */}
          {activeNav === 'tasks' && (
            <MyTasksView
              tasks={tasks}
              language={language}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onOpenCounter={(tk) => setSelectedCounterTask(tk)}
              onOpenReading={(tk) => setSelectedReadingTask(tk)}
              onAddNew={() => setIsAddModalOpen(true)}
            />
          )}

          {/* TAB 3: CALENDAR VIEW */}
          {activeNav === 'calendar' && (
            <CalendarView
              tasks={tasks}
              language={language}
              streak={streak}
            />
          )}

          {/* TAB 4: REPORT VIEW */}
          {activeNav === 'report' && (
            <ReportView
              tasks={tasks}
              language={language}
              streak={streak}
              onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
            />
          )}

          {/* TAB 0: PRIMARY DASHBOARD VIEW */}
          {activeNav === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ---------------------------------------------------- */}
              {/* LEFT 2 COLUMNS: Overview Graph + Compact Task Boxes  */}
              {/* ---------------------------------------------------- */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Overview Graph (Modern Curved Wave Area Spline) */}
                <OverviewChart tasks={tasks} language={language} />

                {/* 2. Middle Row: Side-by-Side Boxes matching exact Daily Task size! */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* BOX A: Daily Task (Vibrant Colors: Blue, Rose, White, Violet, Dark Blue) */}
                  <TaskListBox
                    title={t.dailyTaskTitle}
                    tasks={spiritualTasks.slice(0, 5)}
                    language={language}
                    onToggle={handleToggleTask}
                    onAddNew={() => setIsAddModalOpen(true)}
                    onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                  />

                  {/* BOX B: Daily Routine Overview (Compact Box with exact 4-Capsule Themes from uploaded image!) */}
                  <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col justify-between space-y-3.5 transition-colors">
                    {/* Header matching Daily Task box size */}
                    <div className="flex items-center justify-between pb-2 border-b border-taskati-border/60 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-taskati-blue" />
                        <h4 className="text-xs font-bold text-taskati-navy dark:text-white uppercase tracking-wider">
                          {language === 'ml' ? 'ദിനചര്യ അവലോകനം (Overview)' : 'Routine Overview'}
                        </h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-taskati-blue text-white text-[10px] font-bold font-mono">
                        {completedCount}/{totalCount}
                      </span>
                    </div>

                    {/* Compact Scrollable List of the 4 Capsule Bars from the photo */}
                    <div className="space-y-2.5 flex-1 max-h-[300px] overflow-y-auto pr-1">
                      {filteredTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          language={language}
                          onToggle={handleToggleTask}
                          onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                          onOpenReading={(tk) => setSelectedReadingTask(tk)}
                        />
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex items-center justify-between border-t border-taskati-border/60 dark:border-white/5 text-[11px] text-taskati-muted dark:text-gray-400">
                      <span>{language === 'ml' ? 'ക്ലിക്ക് ചെയ്ത് പൂർത്തിയാക്കാം' : 'Tap capsule to complete'}</span>
                      <span className="font-bold text-taskati-blue">{Math.round((completedCount / totalCount) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* 3. Weekly Task Box & Habits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <TaskListBox
                    title={t.weeklyTaskTitle}
                    tasks={learningTasks}
                    language={language}
                    onToggle={handleToggleTask}
                    onAddNew={() => setIsAddModalOpen(true)}
                    onOpenReading={(tk) => setSelectedReadingTask(tk)}
                  />

                  <div className="bg-white dark:bg-[#181C33] rounded-3xl p-5 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2 border-b border-taskati-border/60 dark:border-white/5">
                      <h4 className="text-xs font-bold text-taskati-navy dark:text-white uppercase tracking-wider">
                        {language === 'ml' ? 'തുടർച്ചയായ പുരോഗതി' : 'Consistency Streak'}
                      </h4>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                        🔥 {streak} {language === 'ml' ? 'ദിവസം' : 'Days'}
                      </span>
                    </div>
                    <div className="py-4 text-center space-y-1">
                      <p className="text-2xl font-black text-taskati-navy dark:text-white">
                        {completedCount} / {totalCount}
                      </p>
                      <p className="text-xs text-taskati-muted">
                        {language === 'ml' ? 'ഇന്നത്തെ ദിനചര്യകൾ പൂർത്തിയായി' : 'Routines Completed Today'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-taskati-border/60 dark:border-white/5 text-center">
                      <span className="text-xs font-bold text-taskati-blue hover:underline cursor-pointer" onClick={() => setActiveNav('report')}>
                        {language === 'ml' ? 'കൂടുതൽ റിപ്പോർട്ടുകൾ കാണുക →' : 'View Full Report →'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Main Habits 4 Squircle Cards */}
                <MainHabitsRow
                  tasks={tasks}
                  language={language}
                  onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                  onOpenReading={(tk) => setSelectedReadingTask(tk)}
                />
              </div>

              {/* ---------------------------------------------------- */}
              {/* RIGHT 1 COLUMN: Daily Progress + Yearly Donut + More */}
              {/* ---------------------------------------------------- */}
              <div className="space-y-6">
                {/* 1. DAILY PROGRESS GRAPH (Alongside Yearly Progress) */}
                <DailyProgressCard
                  tasks={tasks}
                  language={language}
                  streak={streak}
                />

                {/* 2. YEARLY PROGRESS DONUT */}
                <YearlyProgressDonut
                  completed={completedCount}
                  total={totalCount}
                  language={language}
                />

                {/* 3. IN PROGRESS CAPSULES */}
                <InProgressCard
                  tasks={tasks}
                  language={language}
                  onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                  onOpenReading={(tk) => setSelectedReadingTask(tk)}
                  onAddNew={() => setIsAddModalOpen(true)}
                />

                {/* 4. WHATSAPP & SMS QUICK DISPATCH */}
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
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 4. MODALS & POPUPS                                       */}
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

      {/* Lifetime Free Version Confirmation Modal */}
      {showFreeProModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-pop">
          <div className="bg-white dark:bg-[#181C33] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-taskati-border dark:border-white/10 shadow-2xl">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-black">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-taskati-navy dark:text-white">
                {language === 'ml' ? '100% സൗജന്യ ഫുൾ വേർഷൻ സജീവം' : 'Lifetime Free Version Active'}
              </h3>
              <p className="text-xs text-taskati-muted dark:text-gray-400 pt-1 leading-relaxed">
                {language === 'ml'
                  ? 'ഈ ആപ്പ് നിങ്ങൾക്ക് ദീർഘകാലത്തേക്ക് യാതൊരു പണമോ സബ്‌സ്‌ക്രിപ്‌ഷനോ ഇല്ലാതെ സൗജന്യമായി ഉപയോഗിക്കാം. ഓഫ്‌ലൈൻ വർക്കിംഗ്, 100x ദിക്റ് കൗണ്ടർ, ഓട്ടോ നോട്ടിഫിക്കേഷൻ, വാട്സാപ്പ് റിപ്പോർട്ടുകൾ എന്നിവയെല്ലാം പൂർണ്ണമായും അൺലോക്ക് ചെയ്തിട്ടുണ്ട്.'
                  : 'This application is permanently free with no subscriptions or trial limits. Offline storage, Dhikr counters, automated alerts, and WhatsApp reports are all fully unlocked forever.'}
              </p>
            </div>

            <button
              onClick={() => setShowFreeProModal(false)}
              className="w-full py-3 rounded-2xl bg-taskati-blue text-white font-bold text-xs shadow-taskati hover:bg-taskati-blue-hover active:scale-95 transition-all"
            >
              {language === 'ml' ? 'ശരി, മനസ്സിലായി' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
