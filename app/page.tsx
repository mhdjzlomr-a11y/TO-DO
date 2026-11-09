'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskCategory, ReadingDetails } from '@/types/task';
import { DEFAULT_TASKS } from '@/lib/defaultTasks';
import { sendLocalNotification, triggerHaptic } from '@/lib/notifications';
import { Language, TRANSLATIONS } from '@/lib/translations';
import TaskCard from '@/components/TaskCard';
import DhikrModal from '@/components/DhikrModal';
import ReadingOptionsModal from '@/components/ReadingOptionsModal';
import AddTaskModal from '@/components/AddTaskModal';
import NotificationBanner from '@/components/NotificationBanner';
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
  Globe
} from 'lucide-react';

const STORAGE_KEY = 'taskati_daily_tasks_v1';
const STREAK_KEY = 'taskati_daily_streak_v1';
const LAST_DATE_KEY = 'taskati_last_active_date_v1';
const THEME_KEY = 'taskati_theme_v1';
const LANG_KEY = 'taskati_lang_v1';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'spiritual' | 'learning'>('all');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'tasks' | 'counter' | 'reading'>('dashboard');

  // Theme & Language
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('en');

  // Modals state
  const [selectedCounterTask, setSelectedCounterTask] = useState<Task | null>(null);
  const [selectedReadingTask, setSelectedReadingTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Translations
  const t = TRANSLATIONS[language];

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
    const savedLang = (localStorage.getItem(LANG_KEY) as Language) || 'en';
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
        // Merge in malayalam translations for default tasks if missing
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

  // Toggle Language
  const toggleLanguage = () => {
    triggerHaptic([30]);
    const nextLang: Language = language === 'en' ? 'ml' : 'en';
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

  // Scheduled Notification Watcher
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;

      tasks.forEach((item) => {
        if (!item.completed && item.time === currentTimeStr) {
          const notifiedKey = `notified_${item.id}_${new Date().toISOString().split('T')[0]}_${currentTimeStr}`;
          if (!sessionStorage.getItem(notifiedKey)) {
            sessionStorage.setItem(notifiedKey, 'true');
            const alertTitle = language === 'ml' && item.malayalamTitle ? item.malayalamTitle : item.title;
            sendLocalNotification(
              `⏰ ${t.todayRoutines}: ${alertTitle}`,
              item.arabicTitle ? `${item.arabicTitle} - ${item.time}` : `${item.time} - ${alertTitle}`
            );
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [tasks, language, t.todayRoutines]);

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
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const nextUpTask = useMemo(() => {
    return tasks.find((item) => !item.completed);
  }, [tasks]);

  const dateFormatted = new Date().toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-taskati-bg dark:bg-[#0D1021] text-taskati-text dark:text-gray-100 flex flex-col lg:flex-row pb-24 lg:pb-8 transition-colors duration-200">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (Taskati Style)                          */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#14182E] border-r border-taskati-border dark:border-white/10 p-6 justify-between flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <h1 className="text-2xl font-black text-taskati-navy dark:text-white tracking-tight flex items-center">
              Taskati<span className="text-taskati-blue">.</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveNav('dashboard'); setActiveFilter('all'); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-taskati-blue text-white shadow-taskati'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => { setActiveNav('tasks'); setActiveFilter('all'); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeNav === 'tasks'
                  ? 'bg-taskati-blue text-white shadow-taskati'
                  : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{t.dailyTasks}</span>
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] bg-taskati-blue-light dark:bg-white/10 text-taskati-blue dark:text-taskati-blue-light">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => {
                const counterTask = tasks.find((item) => item.type === 'counter');
                if (counterTask) setSelectedCounterTask(counterTask);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5 transition-all"
            >
              <Hash className="w-4 h-4 text-taskati-pink" />
              <span>{t.dhikrCounter}</span>
            </button>

            <button
              onClick={() => {
                const readTask = tasks.find((item) => item.type === 'reading');
                if (readTask) setSelectedReadingTask(readTask);
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white hover:bg-taskati-bg dark:hover:bg-white/5 transition-all"
            >
              <BookOpen className="w-4 h-4 text-taskati-purple" />
              <span>{t.readingHub}</span>
            </button>
          </nav>
        </div>

        {/* Taskati Pro Card */}
        <div className="bg-gradient-to-br from-taskati-blue to-taskati-blue-hover text-white rounded-3xl p-5 shadow-taskati-float relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm mb-3">
            T.
          </div>
          <h4 className="text-sm font-bold">{t.appName} Pro</h4>
          <p className="text-[11px] text-white/80 mt-1 mb-3">
            {language === 'ml' ? 'ദിക്റുകളും ദിനചര്യകളും ലളിതമായി' : 'Track Dhikr, Quran, English & Reading with local safety'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-2 bg-white text-taskati-blue font-bold rounded-2xl text-xs shadow-sm hover:bg-white/95 transition-all"
          >
            + {t.addTask}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA                                        */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Header Row */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between lg:justify-start gap-3">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-taskati-blue text-white flex items-center justify-center font-black text-sm shadow-sm">
                T.
              </span>
              <h2 className="text-xl font-black text-taskati-navy dark:text-white">Taskati.</h2>
            </div>

            <div>
              <p className="text-xs font-bold text-taskati-muted dark:text-gray-400 uppercase tracking-wider">
                {dateFormatted}
              </p>
              <h2 className="text-lg md:text-xl font-black text-taskati-navy dark:text-white">
                {t.greeting}
              </h2>
            </div>
          </div>

          {/* Search Bar & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-taskati-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 text-xs text-taskati-navy dark:text-white placeholder-taskati-muted focus:outline-none focus:border-taskati-blue shadow-taskati-card font-medium"
              />
            </div>

            {/* Language Toggle Button (English <-> Malayalam) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 rounded-2xl shadow-taskati-card text-xs font-bold text-taskati-navy dark:text-white hover:border-taskati-blue transition-all"
              title="Toggle English / Malayalam"
            >
              <Globe className="w-3.5 h-3.5 text-taskati-blue" />
              <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 rounded-2xl shadow-taskati-card text-taskati-navy dark:text-amber-400 hover:border-taskati-blue transition-all"
              title={theme === 'dark' ? 'Switch to Normal Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-taskati-navy" />}
            </button>

            {/* Streak pill */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 rounded-2xl shadow-taskati-card text-xs font-bold text-taskati-navy dark:text-white flex-shrink-0">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streak} {t.streak}</span>
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2.5 sm:px-4 sm:py-2 rounded-2xl bg-taskati-blue text-white text-xs font-bold shadow-taskati hover:bg-taskati-blue-hover transition-all flex items-center gap-1.5 flex-shrink-0"
              title={t.addTask}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addTask}</span>
            </button>
          </div>
        </header>

        {/* PWA Install Prompt Banner */}
        <InstallPwaPrompt />

        {/* Push Notification Status Banner */}
        <NotificationBanner />

        {/* ======================================================== */}
        {/* DASHBOARD TOP WIDGETS (Habits Summary & Progress Ring)   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Habits Row */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-taskati-navy dark:text-white">{t.dailyHabitFocus}</h3>
              <button
                onClick={handleResetDay}
                className="text-xs font-semibold text-taskati-muted dark:text-gray-400 hover:text-taskati-blue flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t.resetDay}
              </button>
            </div>

            {/* 4 Colored Squircle Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Tile 1: Dhikr */}
              <button
                onClick={() => {
                  const item = tasks.find((tk) => tk.type === 'counter');
                  if (item) setSelectedCounterTask(item);
                }}
                className="p-4 rounded-3xl bg-taskati-purple text-white shadow-taskati-card text-left transition-transform active:scale-95 hover:shadow-taskati relative overflow-hidden"
              >
                <div className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black">300</div>
                <div className="text-[11px] text-white/90 font-bold">{t.dhikrDaily}</div>
                <div className="text-[9px] text-white/70 mt-0.5 truncate">
                  {language === 'ml' ? 'ഇസ്തിഗ്ഫാർ, തസ്ബീഹ്, സ്വലാത്ത്' : 'Isthigfar, Thasbeeh, Swalath'}
                </div>
              </button>

              {/* Tile 2: Quran / Qiraath */}
              <div className="p-4 rounded-3xl bg-taskati-blue text-white shadow-taskati-card text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black">4 {t.surahs}</div>
                <div className="text-[11px] text-white/90 font-bold">{t.quranTilawat}</div>
                <div className="text-[9px] text-white/70 mt-0.5 truncate">
                  {language === 'ml' ? 'യാസീൻ, മുൽക്, ഖിറാഅത്ത്' : 'Yaseen, Mulk, Fathiha'}
                </div>
              </div>

              {/* Tile 3: Reading */}
              <button
                onClick={() => {
                  const r = tasks.find((item) => item.type === 'reading');
                  if (r) setSelectedReadingTask(r);
                }}
                className="p-4 rounded-3xl bg-gradient-to-br from-indigo-700 to-taskati-purple text-white shadow-taskati-card text-left transition-transform active:scale-95 relative overflow-hidden"
              >
                <div className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black">25 m</div>
                <div className="text-[11px] text-white/90 font-bold">{t.dailyReading}</div>
                <div className="text-[9px] text-white/70 mt-0.5 truncate">{t.tapForOptions}</div>
              </button>

              {/* Tile 4: English Language */}
              <div className="p-4 rounded-3xl bg-taskati-pink text-white shadow-taskati-card text-left relative overflow-hidden">
                <div className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black">2 {t.skills}</div>
                <div className="text-[11px] text-white/90 font-bold">{t.englishHabits}</div>
                <div className="text-[9px] text-white/70 mt-0.5 truncate">
                  {language === 'ml' ? 'കേൾക്കൽ & സംസാരിക്കൽ' : 'Listening & Speaking'}
                </div>
              </div>
            </div>

            {/* Next Up Routine Card */}
            {nextUpTask && (
              <div className="p-4 bg-white dark:bg-[#181C33] rounded-3xl border border-taskati-border dark:border-white/10 shadow-taskati-card flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-2xl bg-taskati-blue-light dark:bg-taskati-blue/20 text-taskati-blue flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div className="truncate">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-taskati-pink">
                      {t.nextScheduledTask}
                    </span>
                    <h4 className="text-sm font-bold text-taskati-navy dark:text-white truncate">
                      {language === 'ml' && nextUpTask.malayalamTitle ? nextUpTask.malayalamTitle : nextUpTask.title}
                    </h4>
                    {nextUpTask.arabicTitle && (
                      <p className="text-xs text-taskati-purple font-serif">{nextUpTask.arabicTitle}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleTask(nextUpTask.id)}
                  className="px-4 py-2 rounded-2xl bg-taskati-blue text-white text-xs font-bold shadow-taskati hover:bg-taskati-blue-hover transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.completeNow}</span>
                </button>
              </div>
            )}
          </div>

          {/* Daily Progress Donut Card */}
          <div className="bg-white dark:bg-[#181C33] rounded-4xl p-6 border border-taskati-border dark:border-white/10 shadow-taskati-card flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-taskati-navy dark:text-white mb-4 self-start">
              {t.dailyProgress}
            </h3>

            {/* Circular Progress Ring */}
            <div className="relative w-44 h-44 my-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={theme === 'dark' ? '#2A3052' : '#E8ECF5'}
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#taskatiGradient)"
                  strokeWidth="8"
                  strokeDasharray={251.32}
                  strokeDashoffset={251.32 - (251.32 * percentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="taskatiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5051F9" />
                    <stop offset="50%" stopColor="#744BE4" />
                    <stop offset="100%" stopColor="#E84E89" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-taskati-navy dark:text-white tracking-tight">{percentage}%</span>
                <span className="text-[11px] font-semibold text-taskati-muted dark:text-gray-400 mt-0.5">
                  {completedCount} / {totalCount} {t.doneOf}
                </span>
              </div>
            </div>

            {/* Category breakdown pills */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4 text-[11px] font-semibold text-taskati-navy dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-taskati-blue" />
                <span>{language === 'ml' ? 'ആത്മീയ (9)' : 'Spiritual (9)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-taskati-pink" />
                <span>{language === 'ml' ? 'ദിക്റുകൾ (3)' : 'Dhikr 100x (3)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-taskati-purple" />
                <span>{language === 'ml' ? 'ഇംഗ്ലീഷ് (2)' : 'English (2)'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{language === 'ml' ? 'വായന (1)' : 'Reading (1)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TASK LIST & TIMELINE SECTION                             */}
        {/* ======================================================== */}
        <section className="space-y-4">
          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-taskati-navy dark:text-white">{t.todayRoutines}</h3>
              <p className="text-xs text-taskati-muted dark:text-gray-400">
                {t.routinesDesc}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-[#181C33] border border-taskati-border dark:border-white/10 rounded-2xl shadow-taskati-card">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-taskati-blue text-white shadow-sm'
                    : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
                }`}
              >
                {t.all} ({tasks.length})
              </button>

              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'pending'
                    ? 'bg-taskati-blue text-white shadow-sm'
                    : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
                }`}
              >
                {t.pending} ({totalCount - completedCount})
              </button>

              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'completed'
                    ? 'bg-taskati-blue text-white shadow-sm'
                    : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
                }`}
              >
                {t.completed} ({completedCount})
              </button>

              <button
                onClick={() => setActiveFilter('spiritual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'spiritual'
                    ? 'bg-taskati-blue text-white shadow-sm'
                    : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
                }`}
              >
                {t.dhikrAndQuran}
              </button>

              <button
                onClick={() => setActiveFilter('learning')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === 'learning'
                    ? 'bg-taskati-blue text-white shadow-sm'
                    : 'text-taskati-muted dark:text-gray-400 hover:text-taskati-navy dark:hover:text-white'
                }`}
              >
                {t.englishAndReading}
              </button>
            </div>
          </div>

          {/* Task Cards Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTasks.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-[#181C33] rounded-3xl border border-taskati-border dark:border-white/10">
                <p className="text-sm font-bold text-taskati-navy dark:text-white mb-1">
                  {language === 'ml' ? 'ദിനചര്യകൾ ഒന്നും കണ്ടെത്തിയില്ല' : 'No tasks found'}
                </p>
                <p className="text-xs text-taskati-muted dark:text-gray-400 mb-4">
                  {language === 'ml' ? 'ഫിൽട്ടറോ തിരയലോ മാറ്റുക' : 'Try clearing your search query or filter'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                  className="px-4 py-2 bg-taskati-blue text-white text-xs font-bold rounded-2xl shadow-taskati"
                >
                  {language === 'ml' ? 'എല്ലാ ദിനചര്യകളും കാണുക' : 'Show All Tasks'}
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  language={language}
                  onToggle={handleToggleTask}
                  onOpenCounter={(tk) => setSelectedCounterTask(tk)}
                  onOpenReading={(tk) => setSelectedReadingTask(tk)}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
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
          onClick={() => {
            const counterTask = tasks.find((tk) => tk.type === 'counter');
            if (counterTask) setSelectedCounterTask(counterTask);
          }}
          className="flex flex-col items-center gap-1 text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-pink"
        >
          <Hash className="w-5 h-5 text-taskati-pink" />
          <span>{t.counter}</span>
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
            const readTask = tasks.find((tk) => tk.type === 'reading');
            if (readTask) setSelectedReadingTask(readTask);
          }}
          className="flex flex-col items-center gap-1 text-xs font-bold text-taskati-muted dark:text-gray-400 hover:text-taskati-purple"
        >
          <BookOpen className="w-5 h-5 text-taskati-purple" />
          <span>{t.reading}</span>
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

      {/* ======================================================== */}
      {/* INTERACTIVE MODALS                                       */}
      {/* ======================================================== */}
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
    </div>
  );
}
