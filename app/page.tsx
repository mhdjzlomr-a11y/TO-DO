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

// Lector Dashboard Components (Matching exact image media_1794247789511_8f7a8a65.jpg)
import LectorHeroWaveChart from '@/components/LectorHeroWaveChart';
import LectorDonutCard from '@/components/LectorDonutCard';
import LectorGradientCards from '@/components/LectorGradientCards';
import LectorTimelineCard from '@/components/LectorTimelineCard';
import LectorRoutineTable from '@/components/LectorRoutineTable';

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
  Send,
  RotateCcw
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
  const [activeNav, setActiveNav] = useState<'dashboard' | 'projects' | 'tasks' | 'calendar' | 'report'>('dashboard');

  // Language & Theme
  const [language, setLanguage] = useState<Language>('ml');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFreeProModal, setShowFreeProModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

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
  const handleResetToday = () => {
    const reset = tasks.map((t) => ({
      ...t,
      completed: false,
      counterCurrent: t.type === 'counter' ? 0 : t.counterCurrent,
      readingDetails: t.readingDetails ? { ...t.readingDetails, minutesSpent: 0 } : undefined
    }));
    saveTasks(reset);
    triggerHaptic([50, 50]);
    setShowResetModal(false);
  };

  const handleFullFactoryReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STREAK_KEY);
      localStorage.removeItem(LAST_DATE_KEY);
    }
    setTasks(DEFAULT_TASKS);
    setStreak(18);
    triggerHaptic([80, 80, 80]);
    setShowResetModal(false);
  };

  const handleResetDay = () => {
    setShowResetModal(true);
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

  const totalCount = tasks.length;
  const completedCount = tasks.filter((item) => item.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F8F9FD] dark:bg-[#0B0E1E] text-gray-900 dark:text-white flex transition-colors duration-300 select-none"
    >
      {/* Floating In-App Alert Toast Banner */}
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-pop">
          <div className="bg-[#1E2538] text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 border border-pink-500/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-pink-500/20 flex items-center justify-center flex-shrink-0 animate-bounce">
                <BellRing className="w-5 h-5 text-pink-400" />
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
      {/* 1. LEFT SIDEBAR (Matching Exact Image Structure)        */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-60 bg-white dark:bg-[#121528] border-r border-gray-100 dark:border-white/5 flex-col justify-between flex-shrink-0">
        <div>
          {/* Top Logo Badge matching image (Pink-Purple Gradient Block) */}
          <div
            onClick={() => setActiveNav('dashboard')}
            className="h-16 px-6 bg-gradient-to-r from-[#FF4B8B] via-[#9B51E0] to-[#7B4EE4] text-white flex items-center gap-2.5 cursor-pointer shadow-xs"
          >
            <span className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
              1
            </span>
            <span className="text-xl font-black tracking-tight font-sans">
              ONE DAY<span className="text-pink-300">.</span>
            </span>
          </div>

          {/* Navigation Items matching image */}
          <nav className="p-4 space-y-1">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-l-4 border-pink-500 shadow-2xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span>{t.settings}</span>
            </button>

            {/* Reset / Day Rollover Button */}
            <button
              onClick={() => setShowResetModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all pt-3 border-t border-gray-100 dark:border-white/5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'ml' ? 'മൊത്തം റീസെറ്റ്' : 'Reset All'}</span>
            </button>
          </nav>
        </div>

        {/* Bottom Card: ONE DAY Lifetime Free Pro */}
        <div className="p-4">
          <div
            onClick={() => setShowFreeProModal(true)}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#7A5AF8] to-[#5925DC] text-white shadow-sm space-y-2 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black">oneday Pro</span>
              <span className="text-[9px] font-black bg-emerald-400 text-emerald-950 px-1.5 py-0.5 rounded-md">FREE</span>
            </div>
            <p className="text-[10px] text-white/80 leading-tight">
              {language === 'ml' ? '100% സൗജന്യ ലൈഫ് ടൈം വേർഷൻ' : '100% Lifetime Free Active'}
            </p>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA                                    */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar matching image */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#121528]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Menu & Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span
              onClick={() => setActiveNav('dashboard')}
              className="text-lg font-black tracking-tight text-gray-900 dark:text-white cursor-pointer"
            >
              ONE DAY<span className="text-pink-500">.</span>
            </span>
          </div>

          {/* Left search or breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-xs font-bold text-gray-400">
              ONE DAY / <span className="text-gray-800 dark:text-white capitalize">{activeNav}</span>
            </span>
          </div>

          {/* Right Header Controls matching image icons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-[#181C33] border border-gray-200 dark:border-white/5 text-xs font-bold text-gray-800 dark:text-white hover:border-pink-500 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {language === 'en' ? 'Eng' : language === 'ml' ? 'മലയാളം' : 'العربية'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#181C33] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-1.5 z-40 animate-pop">
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
                          ? 'bg-pink-500 text-white'
                          : 'text-gray-800 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
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
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gray-50 dark:bg-[#181C33] border border-gray-200 dark:border-white/5 text-xs font-bold text-gray-800 dark:text-white hover:border-pink-500 transition-all flex items-center gap-1.5"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Reset All Button */}
            <button
              onClick={() => setShowResetModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gray-50 dark:bg-[#181C33] border border-gray-200 dark:border-white/5 text-xs font-bold text-rose-500 hover:border-rose-400 transition-all flex items-center gap-1.5"
              title={language === 'ml' ? 'റീസെറ്റ് ഓപ്ഷനുകൾ' : 'Reset Options'}
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span className="hidden sm:inline">{language === 'ml' ? 'റീസെറ്റ്' : 'Reset'}</span>
            </button>

            {/* Notification Bell matching image */}
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-[#181C33] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-white hover:border-pink-500 relative transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping" />
              <Bell className="w-4 h-4" />
            </button>

            {/* User Avatar matching image */}
            <div
              onClick={() => setIsPhoneModalOpen(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF4B8B] to-[#7B4EE4] text-white flex items-center justify-center font-black text-xs relative cursor-pointer hover:scale-105 transition-transform shadow-xs"
            >
              <span>1</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#121528] absolute -top-0.5 -right-0.5" />
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#121528] border-b border-gray-100 dark:border-white/10 p-4 space-y-2 animate-pop">
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
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
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
        {/* 3. DYNAMIC CONTENT                                       */}
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

          {/* TAB 0: PRIMARY LECTOR DASHBOARD (Exact layout of media_1794247789511_8f7a8a65.jpg) */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6">
              {/* ====================================================== */}
              {/* ROW 1: DUAL WAVE CHART (HERO) + DONUT RING CARD        */}
              {/* ====================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Large Hero Card (Left & Center, 2 cols) */}
                <div className="lg:col-span-2">
                  <LectorHeroWaveChart
                    tasks={tasks}
                    language={language}
                    streak={streak}
                  />
                </div>

                {/* Donut Ring Card (Right, 1 col) */}
                <div>
                  <LectorDonutCard
                    tasks={tasks}
                    language={language}
                  />
                </div>
              </div>

              {/* ====================================================== */}
              {/* ROW 2: 4 ROUNDED GRADIENT CARDS (Crucial from image!)  */}
              {/* ====================================================== */}
              <LectorGradientCards
                tasks={tasks}
                language={language}
                streak={streak}
                onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                onOpenReading={(tk) => setSelectedReadingTask(tk)}
              />

              {/* ====================================================== */}
              {/* ROW 3: LOWER SECTION (TIMELINE + ROUTINES TABLE)       */}
              {/* ====================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lower Left: Recent Activities / Timeline Card */}
                <div>
                  <LectorTimelineCard
                    tasks={tasks}
                    language={language}
                    streak={streak}
                    onToggle={handleToggleTask}
                    onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                    onOpenReading={(tk) => setSelectedReadingTask(tk)}
                  />
                </div>

                {/* Lower Right: Daily Routines Status Table */}
                <div className="lg:col-span-2">
                  <LectorRoutineTable
                    tasks={tasks}
                    language={language}
                    onToggle={handleToggleTask}
                    onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                    onOpenReading={(tk) => setSelectedReadingTask(tk)}
                    onAddNew={() => setIsAddModalOpen(true)}
                  />
                </div>
              </div>

              {/* ====================================================== */}
              {/* ROW 4: WHATSAPP REPORTS QUICK DISPATCH BAR             */}
              {/* ====================================================== */}
              <div className="bg-white dark:bg-[#151932] rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {language === 'ml' ? 'വാട്സാപ്പ് തത്സമയ റിപ്പോർട്ടുകൾ' : 'WhatsApp Reports Dispatch'}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {language === 'ml'
                        ? 'പൂർത്തിയായവയും ബാക്കിയുള്ളവയും ഒറ്റ ക്ലിക്കിൽ വാട്സാപ്പിൽ അയക്കാം'
                        : 'Quick 1-click completed & pending routine reports'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleQuickSendCompleted}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'ml' ? `പൂർത്തിയായവ (${completedCount})` : 'Send Completed'}</span>
                  </button>

                  <button
                    onClick={handleQuickSendPending}
                    className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{language === 'ml' ? `ബാക്കിയുള്ളവ (${pendingCount})` : 'Send Pending'}</span>
                  </button>
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

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-pop">
          <div className="bg-white dark:bg-[#151932] rounded-3xl max-w-md w-full p-6 space-y-5 border border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {language === 'ml' ? 'റീസെറ്റ് ഓപ്ഷനുകൾ' : 'Reset Options'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {language === 'ml' ? 'ആവശ്യമായ റീസെറ്റ് ഓപ്ഷൻ തെരഞ്ഞെടുക്കുക' : 'Choose which reset you want to perform'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: Reset Today Only */}
              <div
                onClick={handleResetToday}
                className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 hover:border-amber-400 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors">
                    {language === 'ml' ? '1. ഇന്നത്തെ റൂട്ടീനുകൾ മാത്രം റീസെറ്റ് ചെയ്യുക' : '1. Reset Today\'s Routines Only'}
                  </h4>
                  <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                    {language === 'ml' ? 'ഇന്ന്' : 'Today'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                  {language === 'ml'
                    ? 'ഇന്നത്തെ ടിക്ക് മാർക്കുകളും ദിക്റ് എണ്ണങ്ങളും വീണ്ടും പൂജ്യത്തിൽ നിന്ന് തുടങ്ങാൻ ഇത് സഹായിക്കും. സ്ട്രീക്കും മറ്റ് വിവരങ്ങളും നഷ്ടപ്പെടില്ല.'
                    : 'Unchecks all routines and resets today\'s counters to 0. Streak and custom routines are kept.'}
                </p>
              </div>

              {/* Option 2: Full Factory Reset */}
              <div
                onClick={handleFullFactoryReset}
                className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-500/20 hover:border-rose-400 cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors">
                    {language === 'ml' ? '2. മൊത്തം ഫാക്ടറി റീസെറ്റ് (Full Factory Reset)' : '2. Full Factory Reset'}
                  </h4>
                  <span className="text-[10px] font-bold bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
                    {language === 'ml' ? 'മൊത്തം' : 'All Data'}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-200/70 leading-relaxed">
                  {language === 'ml'
                    ? 'എല്ലാ വിവരങ്ങളും റീസെറ്റ് ചെയ്ത് യഥാർത്ഥ 13 റൂട്ടീനുകളിലേക്ക് പുതിയതായി പുനഃസ്ഥാപിക്കും.'
                    : 'Resets all routines, cached progress, and streak back to the pristine default 13 daily routines.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowResetModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
            >
              {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Lifetime Free Version Confirmation Modal */}
      {showFreeProModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-pop">
          <div className="bg-white dark:bg-[#151932] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-100 dark:border-white/10 shadow-2xl">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-black">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {language === 'ml' ? '100% സൗജന്യ ഫുൾ വേർഷൻ സജീവം' : 'Lifetime Free Version Active'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 leading-relaxed">
                {language === 'ml'
                  ? 'ഈ ആപ്പ് നിങ്ങൾക്ക് ദീർഘകാലത്തേക്ക് യാതൊരു പണമോ സബ്‌സ്‌ക്രിപ്‌ഷനോ ഇല്ലാതെ സൗജന്യമായി ഉപയോഗിക്കാം. ഓഫ്‌ലൈൻ വർക്കിംഗ്, 100x ദിക്റ് കൗണ്ടർ, ഓട്ടോ നോട്ടിഫിക്കേഷൻ, വാട്സാപ്പ് റിപ്പോർട്ടുകൾ എന്നിവയെല്ലാം പൂർണ്ണമായും അൺലോക്ക് ചെയ്തിട്ടുണ്ട്.'
                  : 'This application is permanently free with no subscriptions or trial limits. Offline storage, Dhikr counters, automated alerts, and WhatsApp reports are all fully unlocked forever.'}
              </p>
            </div>

            <button
              onClick={() => setShowFreeProModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF4B8B] to-[#7B4EE4] text-white font-bold text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              {language === 'ml' ? 'ശരി, മനസ്സിലായി' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
