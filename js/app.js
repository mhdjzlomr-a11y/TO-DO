/**
 * ONE DAY - Official Progressive Web App Core Script
 * Zero-latency native DOM architecture
 * 100% Offline Capable | PWA Standalone | Multi-language
 */

// ========================================================
// 1. DEFAULT ROUTINES (13 Exact Daily Tasks with Times)
// ========================================================
const DEFAULT_TASKS = [
  {
    id: 'auradu-shaduliyy',
    title: 'AURADU SHADULIYY',
    arabicTitle: 'أوراد الشاذلية',
    malayalamTitle: 'ഔറാദുശ്ശാദുലിയ്യ',
    malayalamSubtitle: 'സുബ്ഹിക്ക് ശേഷമുള്ള പ്രഭാത ഔറാദുകൾ',
    subtitle: 'Morning Awrād al-Shādhiliyyah spiritual litany',
    time: '05:45 AM',
    period: 'fajr',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Recite with devotion following Fajr prayer'
  },
  {
    id: 'yaseen',
    title: 'YASEEN',
    arabicTitle: 'سورة يس',
    malayalamTitle: 'സൂറത്തു യാസീൻ',
    malayalamSubtitle: 'വിശുദ്ധ ഖുർആന്റെ ഹൃദയം',
    subtitle: 'Surah Yaseen (Heart of the Quran)',
    time: '06:15 AM',
    period: 'morning',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Recitation of Surah Yaseen for barakah throughout the day'
  },
  {
    id: '100-isthigfar',
    title: '100 ISTHIGFAR',
    arabicTitle: 'أَسْتَغْفِرُ اللّٰهَ',
    malayalamTitle: '100 ഇസ്തിഗ്ഫാർ',
    malayalamSubtitle: 'അസ്തഗ്ഫിറുല്ലാഹ് (പാപമോചന പ്രാർത്ഥന)',
    subtitle: 'Astaghfirullah (Seek forgiveness 100 times)',
    time: '06:45 AM',
    period: 'morning',
    completed: false,
    category: 'spiritual',
    type: 'counter',
    counterTarget: 100,
    counterCurrent: 0,
    notes: 'Tap to use the built-in digital Tasbeeh counter to reach 100'
  },
  {
    id: '100-thasbeeh',
    title: '100 THASBEEH',
    arabicTitle: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ',
    malayalamTitle: '100 തസ്ബീഹ്',
    malayalamSubtitle: 'സുബ്ഹാനല്ലാഹി വബിഹംദിഹി',
    subtitle: 'SubhanAllah wa bihamdihi (100 times)',
    time: '07:15 AM',
    period: 'morning',
    completed: false,
    category: 'spiritual',
    type: 'counter',
    counterTarget: 100,
    counterCurrent: 0,
    notes: 'Glorification of Allah 100 times with digital tally clicker'
  },
  {
    id: '100-swalath',
    title: '100 SWALATH',
    arabicTitle: 'اللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ',
    malayalamTitle: '100 സ്വലാത്ത്',
    malayalamSubtitle: 'മുത്ത് നബി ﷺ യുടെ മേൽ സ്വലാത്ത്',
    subtitle: 'Salawat upon the Prophet ﷺ (100 times)',
    time: '07:45 AM',
    period: 'morning',
    completed: false,
    category: 'spiritual',
    type: 'counter',
    counterTarget: 100,
    counterCurrent: 0,
    notes: 'Send blessings upon the beloved Prophet Muhammad ﷺ'
  },
  {
    id: 'english-listening',
    title: 'ENGLISH LISTENING',
    malayalamTitle: 'ഇംഗ്ലീഷ് കേൾവി പരിശീലനം',
    malayalamSubtitle: 'പോഡ്‌കാസ്റ്റുകൾ / ഓഡിയോ പരിശീലനം',
    subtitle: 'Podcasts, TED Talks, or English audio comprehension',
    time: '08:30 AM',
    period: 'morning',
    completed: false,
    category: 'learning',
    type: 'standard',
    notes: 'Active listening practice for 20-30 minutes'
  },
  {
    id: 'english-speaking',
    title: 'ENGLISH SPEAKING',
    malayalamTitle: 'ഇംഗ്ലീഷ് സംസാരിക്കൽ പരിശീലനം',
    malayalamSubtitle: 'ഷാഡോവിംഗ് & സംഭാഷണ ശീലം',
    subtitle: 'Shadowing, conversational practice, or spoken summary',
    time: '10:30 AM',
    period: 'morning',
    completed: false,
    category: 'learning',
    type: 'standard',
    notes: 'Speak out loud for 15-20 minutes to build fluency and pronunciation'
  },
  {
    id: 'qiraath',
    title: 'QIRAATH',
    arabicTitle: 'تِلَاوَةُ الْقُرْآنِ الْكَرِيمِ',
    malayalamTitle: 'ഖിറാഅത്ത് (ഖുർആൻ ഓത്ത്)',
    malayalamSubtitle: 'ദിനേനയുള്ള ഖുർആൻ പാരായണം',
    subtitle: 'Daily Holy Quran recitation (Tilawat)',
    time: '01:45 PM',
    period: 'afternoon',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Recite at least 1-2 Ruku or 1 Hizb with proper Tajweed'
  },
  {
    id: 'daily-reading',
    title: 'DAILY READING',
    malayalamTitle: 'ദിനേനയുള്ള വായന',
    malayalamSubtitle: 'വായനാ ലക്ഷ്യം & ഫോക്കസ് ടൈമർ',
    subtitle: 'Customizable reading tracker & focus timer',
    time: '04:30 PM',
    period: 'afternoon',
    completed: false,
    category: 'learning',
    type: 'reading',
    readingDetails: {
      materialType: 'Book',
      title: 'Islamic & Personal Growth',
      targetMinutes: 25,
      minutesSpent: 0,
      startPage: '1',
      endPage: '15',
      notes: ''
    },
    notes: 'Choose options: Books, Tafsir, Islamic Literature, English Articles or Self-help with timer'
  },
  {
    id: 'haddad',
    title: 'HADDAD',
    arabicTitle: 'رَاتِبُ الْحَدَّادِ',
    malayalamTitle: 'റാത്തീബുൽ ഹദ്ദാദ്',
    malayalamSubtitle: 'മഗ്‌രിബിന് ശേഷമുള്ള സായാഹ്ന ദിക്റുകൾ',
    subtitle: 'Ratib al-Haddad (Evening spiritual protection litany)',
    time: '06:45 PM',
    period: 'evening',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Recited after Maghrib prayer for divine tranquility and protection'
  },
  {
    id: 'asmaul-husna',
    title: 'ASMAUL HUSNA',
    arabicTitle: 'أَسْمَاءُ اللّٰهِ الْحُسْنَى',
    malayalamTitle: 'അസ്മാഉൽ ഹുസ്നാ',
    malayalamSubtitle: 'അല്ലാഹുവിന്റെ 99 തിരുനാമങ്ങൾ',
    subtitle: '99 Beautiful Names of Allah recitation & reflection',
    time: '07:45 PM',
    period: 'evening',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Recite and reflect upon the divine attributes of Allah'
  },
  {
    id: 'mulk',
    title: 'MULK',
    arabicTitle: 'سورة الملك',
    malayalamTitle: 'സൂറത്തുൽ മുൽക്',
    malayalamSubtitle: 'ഉറങ്ങുന്നതിന് മുമ്പുള്ള സൂറത്ത് പാരായണം',
    subtitle: 'Surah Al-Mulk (The Protector from Grave Punishment)',
    time: '09:30 PM',
    period: 'night',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Recite before sleeping every night'
  },
  {
    id: 'fathiha',
    title: 'FATHIHA',
    arabicTitle: 'سُورَةُ الْفَاتِحَةِ',
    malayalamTitle: 'സൂറത്തുൽ ഫാത്തിഹ',
    malayalamSubtitle: 'ദിനചര്യ അവസാനിപ്പിക്കുന്ന പ്രാർത്ഥന',
    subtitle: 'Surah Al-Fatiha daily devotion & intentions',
    time: '10:00 PM',
    period: 'night',
    completed: false,
    category: 'spiritual',
    type: 'standard',
    notes: 'Close the day with Al-Fatiha for parents, teachers, and loved ones'
  }
];

// 4 Exact Lector Executive Palette Colors
const LECTOR_PALETTE = ['#2B2965', '#5376F8', '#7F44B8', '#EB5A8E'];

// Storage Keys
const STORAGE_KEY = 'oneday_daily_tasks_v2';
const STREAK_KEY = 'oneday_daily_streak_v2';
const LAST_DATE_KEY = 'oneday_last_active_date_v2';
const LANG_KEY = 'oneday_lang_v2';
const THEME_KEY = 'oneday_theme_v2';
const PHONE_KEY = 'oneday_saved_phone_number_v2';

// State Variables
let tasks = [];
let streak = 18;
let currentLang = 'ml';
let currentTheme = 'light';
let activeNav = 'dashboard';
let currentWavePeriod = 'daily';
let currentHabitPeriod = 'daily';
let currentTableFilter = 'all';
let currentSearchQuery = '';
let soundEnabled = true;

// Active Modal Data
let activeCounterTask = null;
let activeReadingTask = null;
let readingStopwatchSeconds = 0;
let readingStopwatchTimer = null;
let readingStopwatchRunning = false;

// ========================================================
// 2. AUDIO SYNTHESIZER & HAPTICS (Zero External Files)
// ========================================================
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playChimeSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.15, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.log('Audio note:', e);
  }
}

function triggerHaptic(pattern = [30]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}

function triggerConfettiBurst() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const colors = ['#FF4B8B', '#7A5AF8', '#5376F8', '#F79009', '#12B76A', '#EC4899'];
    const particles = Array.from({ length: 48 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height * 0.58,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 11 - 4,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rot: Math.random() * 360
    }));

    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.alpha -= 0.022;
        p.rot += 6;
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });
      frame++;
      if (frame < 55) {
        requestAnimationFrame(tick);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(tick);
  } catch (e) {}
}

function toggleAudioSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('dhikrSoundBtn');
  if (btn) btn.innerText = soundEnabled ? '🔊' : '🔇';
}

// ========================================================
// 3. INITIALIZATION & LOCALSTORAGE MANAGEMENT
// ========================================================
function initApp() {
  // Load Theme
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  // Load Language
  const savedLang = localStorage.getItem(LANG_KEY) || 'ml';
  currentLang = savedLang;
  updateLanguageUI();

  // Load Streak
  const savedStreak = localStorage.getItem(STREAK_KEY);
  streak = savedStreak ? parseInt(savedStreak, 10) || 18 : 18;

  // Load Tasks with Auto Midnight Date Rollover
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem(LAST_DATE_KEY);
    const rawTasks = localStorage.getItem(STORAGE_KEY);

    if (rawTasks) {
      const parsed = JSON.parse(rawTasks);
      // Merge with default titles to ensure Malayalam and Arabic never disappear
      tasks = parsed.map((item) => {
        const def = DEFAULT_TASKS.find((d) => d.id === item.id);
        if (def) {
          return {
            ...item,
            malayalamTitle: item.malayalamTitle || def.malayalamTitle,
            arabicTitle: item.arabicTitle || def.arabicTitle,
            subtitle: item.subtitle || def.subtitle,
            time: item.time || def.time
          };
        }
        return item;
      });

      // Daily Rollover: if new day, uncheck tasks and advance streak!
      if (savedDate && savedDate !== todayStr) {
        tasks = tasks.map((t) => ({
          ...t,
          completed: false,
          counterCurrent: t.type === 'counter' ? 0 : t.counterCurrent,
          readingDetails: t.readingDetails ? { ...t.readingDetails, minutesSpent: 0 } : undefined
        }));
        streak += 1;
        localStorage.setItem(STREAK_KEY, streak.toString());
        localStorage.setItem(LAST_DATE_KEY, todayStr);
        saveTasksToStorage();
      }
    } else {
      tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
      localStorage.setItem(LAST_DATE_KEY, todayStr);
      saveTasksToStorage();
    }
  } catch (e) {
    tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  }

  // Initial UI Render
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();
}

function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {}
}

// ========================================================
// 4. THEME & LANGUAGE HANDLERS
// ========================================================
function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  const sunIcon = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }
}

function toggleTheme() {
  triggerHaptic([25]);
  applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}

function toggleLanguageMenu() {
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.toggle('hidden');
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  const dd = document.getElementById('langDropdown');
  if (dd) dd.classList.add('hidden');
  updateLanguageUI();
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();
}

const I18N_DICT = {
  ml: {
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    projects: 'പ്രൊജക്ടുകൾ',
    myTasks: 'എന്റെ ടാസ്കുകൾ',
    calendar: 'കലണ്ടർ',
    report: 'റിപ്പോർട്ട്',
    quickWhatsApp: 'WhatsApp റിപ്പോർട്ടുകൾ',
    resetOptions: 'മൊത്തം റീസെറ്റ്',
    reset: 'റീസെറ്റ്',
    dashboardOverview: 'ഡാഷ്‌ബോർഡ് അവലോകനം',
    liveGraph: 'ദിനചര്യകളുടെ തത്സമയ ഗ്രാഫ്',
    todayCompletion: 'ഇന്നത്തെ പൂർത്തീകരണം',
    routinesDone: 'ദിനചര്യകൾ പൂർത്തിയായി',
    liveSummary: 'തത്സമയ സംഗ്രഹം',
    spiritual: 'ആത്മീയവ',
    dhikrTarget: 'ദിക്റുകൾ',
    reading: 'വായന',
    streak: 'തുടർച്ച',
    routineRatio: 'ദിനചര്യ വിതരണം',
    active: 'സജീവം',
    learning: 'പഠനം',
    dhikrCounter: 'ദിക്റ് കൗണ്ടർ',
    readingHub: 'വായനാ കേന്ദ്രം',
    daysStreak: 'ദിവസങ്ങൾ',
    timeline: 'സമയക്രമ ടൈംലൈൻ (Timeline)',
    habitReport: 'ശീലങ്ങളുടെ റിപ്പോർട്ട്',
    nextRoutine: 'അടുത്ത ദിനചര്യ',
    quranRecitation: 'ഖുർആൻ സൂറത്തുകൾ ഓത്ത്',
    hadithHeader: '💬 ഇന്നത്തെ നബിവചനം (ഹദീസ്)',
    hadithText: '«അല്ലാഹുവിങ്കൽ ഏറ്റവും പ്രിയപ്പെട്ട പുണ്യകർമ്മം, അല്പമാണെങ്കിലും നിത്യേന തുടരുന്നതാണ്.»',
    tableTitle: 'ദിനചര്യകളുടെ തത്സമയ സ്റ്റാറ്റസ്',
    tableSubtitle: 'ഇന്നത്തെ 13 പ്രധാന ദിനചര്യകളുടെ പട്ടിക'
  },
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    myTasks: 'My Tasks',
    calendar: 'Calendar',
    report: 'Report',
    quickWhatsApp: 'WhatsApp Reports',
    resetOptions: 'Factory Reset',
    reset: 'Reset',
    dashboardOverview: 'Dashboard Overview',
    liveGraph: 'Overview of Latest Routines',
    todayCompletion: "Today's Completion",
    routinesDone: 'Routines Checked',
    liveSummary: "Today's Summary",
    spiritual: 'Spiritual',
    dhikrTarget: 'Dhikr Target',
    reading: 'Reading',
    streak: 'Streak',
    routineRatio: 'Routine Ratio',
    active: 'Active',
    learning: 'Learning',
    dhikrCounter: 'Dhikr 100x',
    readingHub: 'Reading Focus',
    daysStreak: 'Days Streak',
    timeline: 'Timeline Schedule',
    habitReport: 'Habit Report',
    nextRoutine: 'Next Routine',
    quranRecitation: 'Daily Quran Recitation',
    hadithHeader: '💬 Daily Prophetic Hadith',
    hadithText: '«The most beloved deeds to Allah are those done regularly, even if they are few.»',
    tableTitle: 'Daily Routines Status',
    tableSubtitle: 'Live status table for your 13 daily routines'
  },
  ar: {
    dashboard: 'الرئيسية',
    projects: 'المشاريع',
    myTasks: 'مهامي',
    calendar: 'التقويم',
    report: 'التقارير',
    quickWhatsApp: 'تقارير واتساب',
    resetOptions: 'إعادة ضبط',
    reset: 'ضبط',
    dashboardOverview: 'نظرة عامة',
    liveGraph: 'مخطط الأوراد اليومية',
    todayCompletion: 'إنجاز اليوم',
    routinesDone: 'المهام المنجزة',
    liveSummary: 'ملخص اليوم',
    spiritual: 'روحي',
    dhikrTarget: 'الأذكار',
    reading: 'القراءة',
    streak: 'الاستمرارية',
    routineRatio: 'توزيع المهام',
    active: 'نشط',
    learning: 'تعلم',
    dhikrCounter: 'عداد الذكر ١٠٠x',
    readingHub: 'مركز القراءة',
    daysStreak: 'أيام الاستمرارية',
    timeline: 'الجدول الزمني',
    habitReport: 'تقرير العادات',
    nextRoutine: 'المهمة القادمة',
    quranRecitation: 'تلاوة السور اليومية',
    hadithHeader: '💬 حديث اليوم',
    hadithText: '«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»',
    tableTitle: 'حالة الأوراد والمهام اليومية',
    tableSubtitle: 'الجدول الكامل لمهامك الـ ١٣ اليومية'
  }
};

function updateLanguageUI() {
  const langText = document.getElementById('currentLangText');
  if (langText) {
    langText.innerText = currentLang === 'ml' ? 'മലയാളം' : currentLang === 'ar' ? 'العربية' : 'English';
  }

  const root = document.getElementById('appRoot');
  if (root) {
    root.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  }

  const dict = I18N_DICT[currentLang] || I18N_DICT.ml;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && dict[key]) {
      el.innerText = dict[key];
    }
  });

  // Translate Habit Period buttons
  document.querySelectorAll('.period-tabs button[data-habit]').forEach((btn) => {
    const h = btn.getAttribute('data-habit');
    if (h === 'daily') btn.innerText = currentLang === 'ml' ? 'ദിവസം' : currentLang === 'ar' ? 'يومي' : 'Day';
    if (h === 'weekly') btn.innerText = currentLang === 'ml' ? 'ആഴ്ച' : currentLang === 'ar' ? 'أسبوعي' : 'Week';
    if (h === 'monthly') btn.innerText = currentLang === 'ml' ? 'മാസം' : currentLang === 'ar' ? 'شهري' : 'Month';
  });

  // Translate Table Filter buttons
  document.querySelectorAll('.period-tabs button[data-filter]').forEach((btn) => {
    const f = btn.getAttribute('data-filter');
    if (f === 'all') btn.innerText = currentLang === 'ml' ? 'എല്ലാം' : currentLang === 'ar' ? 'الكل' : 'All';
    if (f === 'pending') btn.innerText = currentLang === 'ml' ? 'ബാക്കി' : currentLang === 'ar' ? 'متبقي' : 'Pending';
    if (f === 'completed') btn.innerText = currentLang === 'ml' ? 'തീർന്നവ' : currentLang === 'ar' ? 'مكتمل' : 'Completed';
  });
}

// Close dropdowns if clicked outside
document.addEventListener('click', (e) => {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  if (langDropdown && !langDropdown.contains(e.target) && langBtn && !langBtn.contains(e.target)) {
    langDropdown.classList.add('hidden');
  }
});

// ========================================================
// 5. NAVIGATION & VIEW SWITCHER
// ========================================================
function switchNav(navKey) {
  triggerHaptic([20]);
  activeNav = navKey;

  // Update Breadcrumb & Header Title
  const navTitle = document.getElementById('currentNavTitle');
  if (navTitle) navTitle.innerText = navKey;

  // Toggle active class on desktop sidebar buttons
  document.querySelectorAll('.sidebar-nav .nav-btn').forEach((btn) => {
    if (btn.getAttribute('data-nav') === navKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle active class on mobile drawer buttons
  document.querySelectorAll('#mobileDrawer .nav-btn').forEach((btn) => {
    if (btn.getAttribute('data-nav') === navKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle active class on mobile bottom bar tabs
  document.querySelectorAll('.mobile-bottom-nav .bottom-tab').forEach((tab) => {
    if (tab.getAttribute('data-nav') === navKey) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Hide all sections, show target section
  const views = ['Dashboard', 'Projects', 'Tasks', 'Calendar', 'Report'];
  views.forEach((v) => {
    const el = document.getElementById(`view${v}`);
    if (el) {
      if (v.toLowerCase() === navKey) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  if (navKey === 'projects') renderProjectsView();
  if (navKey === 'tasks') renderMyTasksView();
  if (navKey === 'calendar') renderCalendarView();
  if (navKey === 'report') renderReportView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) drawer.classList.toggle('open');
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) drawer.classList.remove('open');
}

function openReportView() {
  switchNav('report');
}

// ========================================================
// 6. DASHBOARD & HERO WAVE CHART
// ========================================================
const WAVE_DATA = {
  daily: {
    labels: ['05:00', '08:00', '10:30', '13:45', '16:30', '18:45', '21:30'],
    amber: [30, 65, 50, 85, 60, 90, 70],
    purple: [40, 80, 60, 70, 85, 95, 80]
  },
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    amber: [45, 60, 55, 75, 90, 70, 85],
    purple: [55, 75, 65, 85, 100, 80, 88]
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    amber: [35, 58, 48, 78, 62, 50],
    purple: [45, 70, 60, 88, 75, 95]
  },
  yearly: {
    labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 H1', '2024 H2'],
    amber: [50, 65, 70, 80, 75, 85],
    purple: [60, 75, 80, 92, 88, 98]
  }
};

function setWavePeriod(period) {
  triggerHaptic([20]);
  currentWavePeriod = period;
  document.querySelectorAll('.period-tabs button[data-wave]').forEach((btn) => {
    if (btn.getAttribute('data-wave') === period) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  updateWaveChart();
}

function generateSvgCatmullRom(values, width = 540, height = 145, padX = 25, padY = 20) {
  const coords = values.map((val, idx) => ({
    x: padX + (idx / (values.length - 1)) * (width - padX * 2),
    y: height - padY - (val / 100) * (height - padY * 2)
  }));

  let path = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5;
    const cp1y = p1.y + (p2.y - p0.y) / 5;
    const cp2x = p2.x - (p3.x - p1.x) / 5;
    const cp2y = p2.y - (p3.y - p1.y) / 5;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const lastCoord = coords[coords.length - 1];
  const firstCoord = coords[0];
  const area = `${path} L ${lastCoord.x.toFixed(1)} ${height - padY} L ${firstCoord.x.toFixed(1)} ${height - padY} Z`;

  return { path, area, coords };
}

function updateWaveChart() {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length || 13;
  const pct = Math.round((completed / total) * 100);

  const dataset = WAVE_DATA[currentWavePeriod] || WAVE_DATA.monthly;
  // Dynamic injection of today's live completion into wave
  const purpleVals = [...dataset.purple];
  purpleVals[purpleVals.length - 1] = Math.max(pct, purpleVals[purpleVals.length - 1]);

  const amberCalc = generateSvgCatmullRom(dataset.amber);
  const purpleCalc = generateSvgCatmullRom(purpleVals);

  const amberLine = document.getElementById('amberLinePath');
  const amberArea = document.getElementById('amberAreaPath');
  const purpleLine = document.getElementById('purpleLinePath');
  const purpleArea = document.getElementById('purpleAreaPath');

  if (amberLine) amberLine.setAttribute('d', amberCalc.path);
  if (amberArea) amberArea.setAttribute('d', amberCalc.area);
  if (purpleLine) purpleLine.setAttribute('d', purpleCalc.path);
  if (purpleArea) purpleArea.setAttribute('d', purpleCalc.area);

  // Render dots
  const dotsGroup = document.getElementById('waveDotsGroup');
  if (dotsGroup) {
    let dotsHtml = '';
    amberCalc.coords.forEach((c) => {
      dotsHtml += `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3" fill="#FFFFFF" stroke="#F59E0B" stroke-width="2"/>`;
    });
    purpleCalc.coords.forEach((c) => {
      dotsHtml += `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3.5" fill="#FFFFFF" stroke="#9333EA" stroke-width="2"/>`;
    });
    dotsGroup.innerHTML = dotsHtml;
  }

  // Render labels
  const labelsRow = document.getElementById('waveLabelsRow');
  if (labelsRow) {
    labelsRow.innerHTML = dataset.labels.map((lbl) => `<span>${lbl}</span>`).join('');
  }
}

function updateDonutChart() {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length || 13;
  const pct = Math.round((completed / total) * 100);

  const heroPct = document.getElementById('heroPct');
  const heroCount = document.getElementById('heroCount');
  const donutCenter = document.getElementById('donutCenterPct');
  const donutBadge = document.getElementById('donutPctBadge');

  if (heroPct) heroPct.innerText = `${pct}%`;
  if (heroCount) heroCount.innerText = `${completed} / ${total}`;
  if (donutCenter) donutCenter.innerText = `${pct}%`;
  if (donutBadge) donutBadge.innerText = `${pct}% Done`;

  // Hero metric pills
  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const spiritualDone = spiritualTasks.filter((t) => t.completed).length;
  const spiritualPill = document.getElementById('heroSpiritualPill');
  if (spiritualPill) spiritualPill.innerText = `${spiritualDone} / ${spiritualTasks.length}`;

  const streakPill = document.getElementById('heroStreakPill');
  if (streakPill) streakPill.innerText = `${streak} Days`;
}

function renderDashboard() {
  const completed = tasks.filter((t) => t.completed).length;
  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const spiritualDone = spiritualTasks.filter((t) => t.completed).length;

  // Gradient Cards
  const gradSpiritual = document.getElementById('gradCardSpiritualCount');
  if (gradSpiritual) gradSpiritual.innerText = `${spiritualDone} / ${spiritualTasks.length}`;

  const gradStreak = document.getElementById('gradCardStreakCount');
  if (gradStreak) gradStreak.innerText = streak.toString();

  const gradDate = document.getElementById('gradCardDateStr');
  if (gradDate) {
    gradDate.innerText = new Date().toLocaleDateString(currentLang === 'ml' ? 'ml-IN' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Next Upcoming Pending Routine
  const nextPending = tasks.find((t) => !t.completed);
  const nextPendingTitle = document.getElementById('nextPendingTitle');
  const nextPendingTime = document.getElementById('nextPendingTime');
  const nextPendingBox = document.getElementById('nextPendingPillBox');

  if (nextPending) {
    if (nextPendingBox) nextPendingBox.classList.remove('hidden');
    if (nextPendingTitle) {
      nextPendingTitle.innerText = currentLang === 'ml' && nextPending.malayalamTitle ? nextPending.malayalamTitle : nextPending.title;
    }
    if (nextPendingTime) nextPendingTime.innerText = nextPending.time;
  } else {
    if (nextPendingBox) nextPendingBox.classList.add('hidden');
  }

  // Update Quran checklist circles
  ['yaseen', 'mulk', 'fathiha'].forEach((qid) => {
    const qTask = tasks.find((t) => t.id === qid);
    const circle = document.getElementById(`quranCheck_${qid}`);
    if (circle) {
      if (qTask && qTask.completed) {
        circle.classList.add('checked');
        circle.innerHTML = '✓';
      } else {
        circle.classList.remove('checked');
        circle.innerHTML = '';
      }
    }
  });
}

// ========================================================
// 7. HABIT REPORT SWITCHER (DAY / WEEK / MONTH TABS)
// Exact User Request: Clicking Day/Week/Month updates squircle tiles!
// ========================================================
function setHabitPeriod(period) {
  triggerHaptic([25]);
  currentHabitPeriod = period;

  document.querySelectorAll('.period-tabs button[data-habit]').forEach((btn) => {
    if (btn.getAttribute('data-habit') === period) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  updateHabitSquircleTiles();
}

function updateHabitSquircleTiles() {
  const completed = tasks.filter((t) => t.completed).length;
  const spiritualTasks = tasks.filter((t) => t.category === 'spiritual');
  const spiritualDone = spiritualTasks.filter((t) => t.completed).length;

  const sq1 = document.getElementById('squircle1Count');
  const sq2 = document.getElementById('squircle2Count');
  const sq3 = document.getElementById('squircle3Count');
  const sq4 = document.getElementById('squircle4Count');
  const sq4Label = document.getElementById('squircle4Label');

  if (currentHabitPeriod === 'daily') {
    if (sq1) sq1.innerText = `${spiritualDone} / ${spiritualTasks.length}`;
    if (sq2) sq2.innerText = '300';
    if (sq3) sq3.innerText = '25 m';
    if (sq4) sq4.innerText = `${streak} ${currentLang === 'ml' ? 'ദിവസം' : 'Days'}`;
    if (sq4Label) sq4Label.innerText = currentLang === 'ml' ? 'തുടർച്ച (Streak)' : 'Daily Streak';
  } else if (currentHabitPeriod === 'weekly') {
    if (sq1) sq1.innerText = '68 / 70';
    if (sq2) sq2.innerText = '2,100';
    if (sq3) sq3.innerText = '3.5 h';
    if (sq4) sq4.innerText = '94% Score';
    if (sq4Label) sq4Label.innerText = currentLang === 'ml' ? 'വിജയശതമാനം' : 'Weekly Rate';
  } else if (currentHabitPeriod === 'monthly') {
    if (sq1) sq1.innerText = '280 / 300';
    if (sq2) sq2.innerText = '9,000';
    if (sq3) sq3.innerText = '14.8 h';
    if (sq4) sq4.innerText = '90% Score';
    if (sq4Label) sq4Label.innerText = currentLang === 'ml' ? 'വിജയശതമാനം' : 'Monthly Rate';
  }
}

// ========================================================
// 8. TIMELINE & TABLE RENDERING (NO STRIKETHROUGH EVER!)
// ========================================================
function getDisplayTitle(task) {
  if (!task) return '';
  if (currentLang === 'ml' && task.malayalamTitle) return task.malayalamTitle;
  if (currentLang === 'ar' && task.arabicTitle) return task.arabicTitle;
  return task.title;
}

function renderTimeline() {
  const container = document.getElementById('timelineTasksList');
  if (!container) return;

  const timelineTasks = tasks.slice(0, 5);
  const colors = ['#FF4B8B', '#7A5AF8', '#2E90FA', '#F79009', '#12B76A'];

  let html = '';
  timelineTasks.forEach((task, idx) => {
    const col = colors[idx % colors.length];
    const displayTitle = getDisplayTitle(task);

    html += `
      <div class="timeline-item" onclick="onTimelineItemClick('${task.id}')">
        <div class="timeline-badge" style="background-color: ${task.completed ? '#12B76A' : col};">
          ${task.completed ? '✓' : '<span style="width: 7px; height: 7px; border-radius: 50%; background: #FFF;"></span>'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div class="flex-between">
            <h4 class="no-strike" style="font-size: 12.5px; font-weight: 800; color: ${task.completed ? '#12B76A' : 'var(--text-main)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${displayTitle}
            </h4>
            <span class="mono" style="font-size: 10px; color: var(--text-muted); flex-shrink: 0;">
              ${task.time}
            </span>
          </div>
          <p class="no-strike" style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${task.arabicTitle || task.subtitle || ''}
          </p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function onTimelineItemClick(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (task.type === 'counter') {
    openDhikrModal(task);
  } else if (task.type === 'reading') {
    openReadingModal(task);
  } else {
    toggleTask(taskId);
  }
}

function setTableFilter(filter) {
  triggerHaptic([20]);
  currentTableFilter = filter;
  document.querySelectorAll('.period-tabs button[data-filter]').forEach((btn) => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderTable();
}

function onSearchTasks(query) {
  currentSearchQuery = (query || '').toLowerCase().trim();
  renderTable();
}

function renderTable() {
  const container = document.getElementById('routineRowsContainer');
  if (!container) return;

  const filtered = tasks.filter((t) => {
    const match =
      t.title.toLowerCase().includes(currentSearchQuery) ||
      (t.malayalamTitle && t.malayalamTitle.includes(currentSearchQuery)) ||
      (t.arabicTitle && t.arabicTitle.includes(currentSearchQuery));
    if (!match) return false;
    if (currentTableFilter === 'pending') return !t.completed;
    if (currentTableFilter === 'completed') return t.completed;
    return true;
  });

  let html = '';
  filtered.forEach((task, idx) => {
    const displayTitle = getDisplayTitle(task);
    const barColor = LECTOR_PALETTE[idx % LECTOR_PALETTE.length];
    const progressPct = task.completed ? 100 : task.type === 'counter' ? Math.min(100, Math.round(((task.counterCurrent || 0) / 100) * 100)) : 40;

    html += `
      <div class="routine-row ${task.completed ? 'completed' : ''}" onclick="onTableRowClick('${task.id}')">
        <!-- 1. Title & Checkbox -->
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <div class="check-circle ${task.completed ? 'checked' : ''}" onclick="event.stopPropagation(); toggleTask('${task.id}');">
            ${task.completed ? '✓' : ''}
          </div>
          <div style="min-width: 0;">
            <span class="no-strike" style="font-size: 13px; font-weight: 800; color: ${task.completed ? '#12B76A' : 'var(--text-main)'}; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${displayTitle}
            </span>
            ${task.arabicTitle ? `<span class="arabic-text" style="font-size: 11.5px; color: var(--text-muted); opacity: 0.85;">${task.arabicTitle}</span>` : ''}
          </div>
        </div>

        <!-- 2. Category -->
        <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: capitalize;">
          ${task.category}
        </div>

        <!-- 3. Schedule Time -->
        <div class="mono" style="font-size: 12px; font-weight: 700; color: var(--text-muted);">
          ⏰ ${task.time}
        </div>

        <!-- 4. Progress Bar -->
        <div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${progressPct}%; background-color: ${task.completed ? '#EB5A8E' : barColor};"></div>
          </div>
        </div>

        <!-- 5. Status / Action Pill -->
        <div style="text-align: right;">
          ${task.completed ? `
            <span class="action-pill" style="background: #EB5A8E;">Completed</span>
          ` : task.type === 'counter' ? `
            <button class="action-pill" style="background: var(--indigo);" onclick="event.stopPropagation(); openDhikrModalById('${task.id}');">
              📿 Counter (${task.counterCurrent || 0}/100)
            </button>
          ` : task.type === 'reading' ? `
            <button class="action-pill" style="background: var(--violet);" onclick="event.stopPropagation(); openReadingModal();">
              📖 Reading Hub
            </button>
          ` : `
            <span class="action-pill" style="background: var(--blue);">Pending</span>
          `}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  const entriesCount = document.getElementById('tableEntriesCount');
  if (entriesCount) {
    entriesCount.innerText = `Showing 1 to ${filtered.length} of ${tasks.length} entries`;
  }
}

function onTableRowClick(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (task.type === 'counter') {
    openDhikrModal(task);
  } else if (task.type === 'reading') {
    openReadingModal(task);
  } else {
    toggleTask(taskId);
  }
}

// Toggle Task Completion (Zero strikethrough!)
function toggleTask(taskId) {
  triggerHaptic([35]);
  tasks = tasks.map((item) => {
    if (item.id === taskId) {
      const nextCompleted = !item.completed;
      if (nextCompleted) {
        playChimeSound();
        triggerConfettiBurst();
      }
      return {
        ...item,
        completed: nextCompleted,
        counterCurrent: nextCompleted && item.type === 'counter' ? (item.counterTarget || 100) : item.counterCurrent
      };
    }
    return item;
  });

  saveTasksToStorage();
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();
}

function filterByCat(cat) {
  currentSearchQuery = cat;
  const input = document.getElementById('tableSearchInput');
  if (input) input.value = cat;
  renderTable();
}

// ========================================================
// 9. 100x DHIKR COUNTER MODAL (Full Interactive Logic)
// ========================================================
function openAnyCounterTask() {
  const counterTask = tasks.find((t) => t.type === 'counter' && !t.completed) || tasks.find((t) => t.type === 'counter') || tasks[2];
  openDhikrModal(counterTask);
}

function openDhikrModalById(taskId) {
  const t = tasks.find((item) => item.id === taskId);
  if (t) openDhikrModal(t);
}

function openDhikrModal(task) {
  triggerHaptic([20]);
  activeCounterTask = task;

  const modal = document.getElementById('dhikrModalBackdrop');
  const title = document.getElementById('dhikrModalTitle');
  const arabic = document.getElementById('dhikrModalArabic');
  const subtitle = document.getElementById('dhikrModalSubtitle');
  const celebration = document.getElementById('dhikrCelebrationTag');

  if (title) title.innerText = task.title;
  if (arabic) {
    arabic.innerText = task.arabicTitle || '';
    arabic.style.display = task.arabicTitle ? 'block' : 'none';
  }
  if (subtitle) subtitle.innerText = currentLang === 'ml' && task.malayalamSubtitle ? task.malayalamSubtitle : task.subtitle || '100x Target';
  if (celebration) celebration.classList.add('hidden');

  updateDhikrModalUI();
  if (modal) modal.classList.add('open');
}

function closeDhikrModal() {
  const modal = document.getElementById('dhikrModalBackdrop');
  if (modal) modal.classList.remove('open');
  activeCounterTask = null;
}

function updateDhikrModalUI() {
  if (!activeCounterTask) return;
  const current = activeCounterTask.counterCurrent || 0;
  const target = activeCounterTask.counterTarget || 100;
  const pct = Math.min(100, Math.round((current / target) * 100));

  const countDisplay = document.getElementById('dhikrCountDisplay');
  const pctDisplay = document.getElementById('dhikrPctDisplay');
  const ring = document.getElementById('dhikrSvgRing');
  const celebration = document.getElementById('dhikrCelebrationTag');

  if (countDisplay) countDisplay.innerText = current.toString();
  if (pctDisplay) pctDisplay.innerText = `(${pct}%)`;

  if (ring) {
    const circumference = 276.46;
    const offset = circumference - (circumference * pct) / 100;
    ring.style.strokeDashoffset = offset.toString();
  }

  if (celebration) {
    if (current >= target) {
      celebration.classList.remove('hidden');
    } else {
      celebration.classList.add('hidden');
    }
  }
}

function incrementDhikr(by = 1) {
  if (!activeCounterTask) return;
  const target = activeCounterTask.counterTarget || 100;
  const current = activeCounterTask.counterCurrent || 0;
  const next = Math.min(target, current + by);

  activeCounterTask.counterCurrent = next;
  triggerHaptic([30]);

  if (soundEnabled && next % 10 === 0) {
    playChimeSound();
  }

  if (next >= target) {
    activeCounterTask.completed = true;
    playChimeSound();
    triggerHaptic([80, 50, 80]);
    triggerConfettiBurst();
  }

  // Sync with main task list
  tasks = tasks.map((t) => (t.id === activeCounterTask.id ? { ...activeCounterTask } : t));
  saveTasksToStorage();

  updateDhikrModalUI();
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();
}

function resetDhikrCounter() {
  if (!activeCounterTask) return;
  triggerHaptic([50, 30]);
  activeCounterTask.counterCurrent = 0;
  activeCounterTask.completed = false;

  tasks = tasks.map((t) => (t.id === activeCounterTask.id ? { ...activeCounterTask } : t));
  saveTasksToStorage();

  updateDhikrModalUI();
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();
}

function completeDhikrNow() {
  if (!activeCounterTask) return;
  const target = activeCounterTask.counterTarget || 100;
  activeCounterTask.counterCurrent = target;
  activeCounterTask.completed = true;

  playChimeSound();
  triggerHaptic([80, 50, 80]);
  triggerConfettiBurst();

  tasks = tasks.map((t) => (t.id === activeCounterTask.id ? { ...activeCounterTask } : t));
  saveTasksToStorage();

  updateDhikrModalUI();
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();

  setTimeout(() => {
    closeDhikrModal();
  }, 700);
}

// ========================================================
// 10. READING OPTIONS HUB & FOCUS STOPWATCH
// ========================================================
function openReadingModal(task) {
  triggerHaptic([20]);
  activeReadingTask = task || tasks.find((t) => t.type === 'reading') || tasks[8];

  const modal = document.getElementById('readingModalBackdrop');
  const details = activeReadingTask.readingDetails || {
    materialType: 'Book',
    title: 'Islamic & Personal Growth',
    targetMinutes: 25,
    minutesSpent: 0,
    startPage: '1',
    endPage: '15',
    notes: ''
  };

  const titleInput = document.getElementById('readingBookTitleInput');
  const targetMin = document.getElementById('readingTargetMinInput');
  const startPage = document.getElementById('readingStartPageInput');
  const endPage = document.getElementById('readingEndPageInput');
  const notes = document.getElementById('readingNotesInput');

  if (titleInput) titleInput.value = details.title || '';
  if (targetMin) targetMin.value = details.targetMinutes || 25;
  if (startPage) startPage.value = details.startPage || '1';
  if (endPage) endPage.value = details.endPage || '15';
  if (notes) notes.value = details.notes || '';

  selectReadingMat(details.materialType || 'Book');

  readingStopwatchSeconds = (details.minutesSpent || 0) * 60;
  updateReadingStopwatchDisplay();

  if (modal) modal.classList.add('open');
}

function closeReadingModal() {
  const modal = document.getElementById('readingModalBackdrop');
  if (modal) modal.classList.remove('open');
  if (readingStopwatchTimer) clearInterval(readingStopwatchTimer);
  readingStopwatchRunning = false;
  const playBtn = document.getElementById('readingTimerPlayBtn');
  if (playBtn) playBtn.innerText = '▶ Start Timer';
}

function selectReadingMat(matId) {
  document.querySelectorAll('#readingMaterialPills button').forEach((btn) => {
    if (btn.getAttribute('data-mat') === matId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function toggleReadingTimer() {
  triggerHaptic([30]);
  const playBtn = document.getElementById('readingTimerPlayBtn');

  if (readingStopwatchRunning) {
    if (readingStopwatchTimer) clearInterval(readingStopwatchTimer);
    readingStopwatchRunning = false;
    if (playBtn) playBtn.innerText = '▶ Resume Timer';
  } else {
    readingStopwatchRunning = true;
    if (playBtn) playBtn.innerText = '⏸ Pause Timer';
    readingStopwatchTimer = setInterval(() => {
      readingStopwatchSeconds += 1;
      updateReadingStopwatchDisplay();
    }, 1000);
  }
}

function resetReadingTimer() {
  triggerHaptic([40]);
  if (readingStopwatchTimer) clearInterval(readingStopwatchTimer);
  readingStopwatchRunning = false;
  readingStopwatchSeconds = 0;
  updateReadingStopwatchDisplay();
  const playBtn = document.getElementById('readingTimerPlayBtn');
  if (playBtn) playBtn.innerText = '▶ Start Timer';
}

function updateReadingStopwatchDisplay() {
  const display = document.getElementById('readingStopwatchDisplay');
  if (!display) return;
  const mins = Math.floor(readingStopwatchSeconds / 60);
  const secs = readingStopwatchSeconds % 60;
  display.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function saveReadingHub(markCompleted = false) {
  if (!activeReadingTask) return;
  const activeMatBtn = document.querySelector('#readingMaterialPills button.active');
  const matType = activeMatBtn ? activeMatBtn.getAttribute('data-mat') : 'Book';

  const titleInput = document.getElementById('readingBookTitleInput');
  const targetMin = document.getElementById('readingTargetMinInput');
  const startPage = document.getElementById('readingStartPageInput');
  const endPage = document.getElementById('readingEndPageInput');
  const notes = document.getElementById('readingNotesInput');

  const updatedDetails = {
    materialType: matType,
    title: titleInput ? titleInput.value : '',
    targetMinutes: targetMin ? parseInt(targetMin.value, 10) || 25 : 25,
    minutesSpent: Math.round(readingStopwatchSeconds / 60),
    startPage: startPage ? startPage.value : '1',
    endPage: endPage ? endPage.value : '15',
    notes: notes ? notes.value : ''
  };

  activeReadingTask.readingDetails = updatedDetails;
  if (markCompleted) {
    activeReadingTask.completed = true;
    playChimeSound();
    triggerHaptic([80, 50, 80]);
    triggerConfettiBurst();
  }

  tasks = tasks.map((t) => (t.id === activeReadingTask.id ? { ...activeReadingTask } : t));
  saveTasksToStorage();

  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();

  closeReadingModal();
}

// ========================================================
// 11. PHONE & WHATSAPP REPORTS (One-Click Dispatches)
// ========================================================
function openPhoneModal() {
  triggerHaptic([20]);
  const modal = document.getElementById('phoneModalBackdrop');
  const phoneInput = document.getElementById('userPhoneNumberInput');
  if (phoneInput) {
    phoneInput.value = localStorage.getItem(PHONE_KEY) || '';
  }
  updatePhonePreview();
  if (modal) modal.classList.add('open');
}

function closePhoneModal() {
  const modal = document.getElementById('phoneModalBackdrop');
  if (modal) modal.classList.remove('open');
}

function saveUserPhone() {
  const phoneInput = document.getElementById('userPhoneNumberInput');
  if (phoneInput && phoneInput.value.trim()) {
    localStorage.setItem(PHONE_KEY, phoneInput.value.trim());
    triggerHaptic([40]);
    playChimeSound();
    alert(currentLang === 'ml' ? 'നമ്പർ വിജയകരമായി സേവ് ചെയ്തു!' : 'Phone number saved successfully!');
    updatePhonePreview();
  }
}

function cleanPhoneNumber(raw) {
  let cleaned = (raw || '').replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

function generateCompletedText() {
  const completed = tasks.filter((t) => t.completed);
  const total = tasks.length;
  const dateStr = new Date().toLocaleDateString(currentLang === 'ml' ? 'ml-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (currentLang === 'ml') {
    let msg = `🌟 *ONE DAY ദിനചര്യ റിപ്പോർട്ട് - പൂർത്തിയായവ* 🌟\n`;
    msg += `📅 തീയതി: ${dateStr}\n`;
    msg += `✅ പൂർത്തിയായവ: ${completed.length}/${total}\n`;
    msg += `🔥 തുടർച്ച: ${streak} ദിവസങ്ങൾ\n\n`;

    if (completed.length === 0) {
      msg += `ഇതുവരെ ഒരു ദിനചര്യയും പൂർത്തിയായിട്ടില്ല.\n`;
    } else {
      msg += `*പൂർത്തിയാക്കിയ ദിനചര്യകൾ:*\n`;
      completed.forEach((t, i) => {
        const title = t.malayalamTitle || t.title;
        const arabic = t.arabicTitle ? ` (${t.arabicTitle})` : '';
        msg += `${i + 1}. ✔️ ${title}${arabic} - ${t.time}\n`;
      });
    }

    msg += `\nഅൽഹംദുലില്ലാഹ്! നാഥൻ സ്വീകരിക്കട്ടെ. 🤲`;
    return msg;
  } else {
    let msg = `🌟 *ONE DAY DAILY REPORT - COMPLETED* 🌟\n`;
    msg += `📅 Date: ${dateStr}\n`;
    msg += `✅ Completed: ${completed.length}/${total}\n`;
    msg += `🔥 Streak: ${streak} Days\n\n`;

    if (completed.length === 0) {
      msg += `No routines completed yet today.\n`;
    } else {
      msg += `*Completed Routines:*\n`;
      completed.forEach((t, i) => {
        msg += `${i + 1}. ✔️ ${t.title} - ${t.time}\n`;
      });
    }

    msg += `\nAlhamdulillah! Keep going strong. ✨`;
    return msg;
  }
}

function generatePendingText() {
  const pending = tasks.filter((t) => !t.completed);
  const total = tasks.length;
  const dateStr = new Date().toLocaleDateString(currentLang === 'ml' ? 'ml-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (currentLang === 'ml') {
    let msg = `⚠️ *ONE DAY ഓർമ്മപ്പെടുത്തൽ - പൂർത്തിയാവാത്തവ* ⚠️\n`;
    msg += `📅 തീയതി: ${dateStr}\n`;
    msg += `⏳ ബാക്കിയുള്ളവ: ${pending.length}/${total}\n\n`;

    if (pending.length === 0) {
      msg += `മാശാ അല്ലാഹ്! ഇന്നത്തെ എല്ലാ ദിനചര്യകളും പൂർത്തിയായിക്കഴിഞ്ഞു. 🎉\n`;
    } else {
      msg += `*ഇനിയും പൂർത്തിയാക്കാനുള്ള ദിനചര്യകൾ:*\n`;
      pending.forEach((t, i) => {
        const title = t.malayalamTitle || t.title;
        const arabic = t.arabicTitle ? ` (${t.arabicTitle})` : '';
        msg += `${i + 1}. ⏳ ${title}${arabic} - സമയം: ${t.time}\n`;
      });
      msg += `\nദയവായി സമയം ശ്രദ്ധിച്ച് ഉടൻ പൂർത്തിയാക്കുക! 🔔`;
    }

    return msg;
  } else {
    let msg = `⚠️ *ONE DAY REMINDER - PENDING TASKS* ⚠️\n`;
    msg += `📅 Date: ${dateStr}\n`;
    msg += `⏳ Incomplete: ${pending.length}/${total}\n\n`;

    if (pending.length === 0) {
      msg += `MashaAllah! All daily tasks are finished for today! 🎉\n`;
    } else {
      msg += `*Pending Routines:*\n`;
      pending.forEach((t, i) => {
        msg += `${i + 1}. ⏳ ${t.title} - Due: ${t.time}\n`;
      });
      msg += `\nPlease check your schedule and complete them soon! 🔔`;
    }

    return msg;
  }
}

function updatePhonePreview() {
  const completedBadge = document.getElementById('phoneCompletedCountBadge');
  const pendingBadge = document.getElementById('phonePendingCountBadge');
  const previewBox = document.getElementById('phoneMessagePreviewBox');

  const comp = tasks.filter((t) => t.completed).length;
  const pend = tasks.length - comp;

  if (completedBadge) completedBadge.innerText = `${comp} / ${tasks.length} Done`;
  if (pendingBadge) pendingBadge.innerText = `${pend} Pending`;
  if (previewBox) previewBox.innerText = generateCompletedText();
}

function openWhatsAppUrl(url) {
  const win = window.open(url, '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    window.location.href = url;
  }
}

function sendWhatsAppCompleted() {
  triggerHaptic([35]);
  const rawPhone = localStorage.getItem(PHONE_KEY) || '';
  const phone = cleanPhoneNumber(rawPhone);
  const text = encodeURIComponent(generateCompletedText());

  const url = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
    : `https://api.whatsapp.com/send?text=${text}`;

  openWhatsAppUrl(url);
}

function sendWhatsAppPending() {
  triggerHaptic([35]);
  const rawPhone = localStorage.getItem(PHONE_KEY) || '';
  const phone = cleanPhoneNumber(rawPhone);
  const text = encodeURIComponent(generatePendingText());

  const url = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
    : `https://api.whatsapp.com/send?text=${text}`;

  openWhatsAppUrl(url);
}

// ========================================================
// 12. RESET MODAL (റീസെറ്റ് ഓപ്ഷനുകൾ)
// ========================================================
function openResetModal() {
  triggerHaptic([20]);
  const modal = document.getElementById('resetModalBackdrop');
  if (modal) modal.classList.add('open');
}

function closeResetModal() {
  const modal = document.getElementById('resetModalBackdrop');
  if (modal) modal.classList.remove('open');
}

function executeResetToday() {
  triggerHaptic([60, 40]);
  tasks = tasks.map((t) => ({
    ...t,
    completed: false,
    counterCurrent: t.type === 'counter' ? 0 : t.counterCurrent,
    readingDetails: t.readingDetails ? { ...t.readingDetails, minutesSpent: 0 } : undefined
  }));

  saveTasksToStorage();
  closeResetModal();

  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();

  alert(currentLang === 'ml' ? 'ഇന്നത്തെ ദിനചര്യകൾ റീസെറ്റ് ചെയ്തു.' : 'Today\'s routines have been reset.');
}

function executeFullFactoryReset() {
  const confirmMsg = currentLang === 'ml'
    ? 'തീർച്ചയാണോ? നിങ്ങളുടെ എല്ലാ ഡാറ്റയും റീസെറ്റ് ചെയ്ത് ആദ്യ ദിവസം മുതൽ പുനരാരംഭിക്കും.'
    : 'Are you sure? This will reset all tasks to initial state.';

  if (!confirm(confirmMsg)) return;

  triggerHaptic([100, 80, 80]);
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STREAK_KEY);
  localStorage.removeItem(LAST_DATE_KEY);

  streak = 18;
  tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  saveTasksToStorage();
  closeResetModal();

  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();

  alert(currentLang === 'ml' ? 'ഫാക്ടറി റീസെറ്റ് വിജയകരമായി പൂർത്തിയായി!' : 'Factory reset completed!');
}

// ========================================================
// 13. ADD TASK MODAL
// ========================================================
function openAddModal() {
  triggerHaptic([20]);
  const modal = document.getElementById('addModalBackdrop');
  if (modal) modal.classList.add('open');
}

function closeAddModal() {
  const modal = document.getElementById('addModalBackdrop');
  if (modal) modal.classList.remove('open');
}

function saveNewTask() {
  const titleInput = document.getElementById('newTaskTitleInput');
  const mlTitleInput = document.getElementById('newTaskMlTitleInput');
  const timeInput = document.getElementById('newTaskTimeInput');
  const catSelect = document.getElementById('newTaskCatSelect');
  const typeSelect = document.getElementById('newTaskTypeSelect');

  const title = (titleInput ? titleInput.value : '').trim();
  if (!title) {
    alert(currentLang === 'ml' ? 'ദയവായി ടാസ്ക് പേര് നൽകുക!' : 'Please enter a task title!');
    return;
  }

  const mlTitle = (mlTitleInput ? mlTitleInput.value : '').trim();
  const time = timeInput ? timeInput.value : '09:00';
  const category = catSelect ? catSelect.value : 'spiritual';
  const type = typeSelect ? typeSelect.value : 'standard';

  // Format 24h to 12h AM/PM
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const formattedTime = `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;

  const newTask = {
    id: `custom_${Date.now()}`,
    title: title.toUpperCase(),
    malayalamTitle: mlTitle || title,
    time: formattedTime,
    period: 'morning',
    completed: false,
    category: category,
    type: type,
    counterTarget: type === 'counter' ? 100 : undefined,
    counterCurrent: type === 'counter' ? 0 : undefined,
    readingDetails: type === 'reading' ? {
      materialType: 'Book',
      title: title,
      targetMinutes: 25,
      minutesSpent: 0,
      startPage: '1',
      endPage: '15',
      notes: ''
    } : undefined
  };

  tasks.push(newTask);
  saveTasksToStorage();
  triggerHaptic([40]);
  playChimeSound();

  if (titleInput) titleInput.value = '';
  if (mlTitleInput) mlTitleInput.value = '';

  closeAddModal();
  renderDashboard();
  renderTimeline();
  renderTable();
  updateWaveChart();
  updateDonutChart();
  updateHabitSquircleTiles();
  updatePhonePreview();
}

// ========================================================
// 14. FREE PRO LIFETIME BADGE MODAL
// ========================================================
function openFreeProModal() {
  triggerHaptic([20]);
  const modal = document.getElementById('freeProModalBackdrop');
  if (modal) modal.classList.add('open');
}

function closeFreeProModal() {
  const modal = document.getElementById('freeProModalBackdrop');
  if (modal) modal.classList.remove('open');
}

// Close Modal when tapping dark backdrop outside box
function closeModalOnBackdrop(event, backdropId) {
  if (event.target && event.target.id === backdropId) {
    const modal = document.getElementById(backdropId);
    if (modal) modal.classList.remove('open');
  }
}

// ========================================================
// 15. SUB-VIEWS RENDERING (Projects, My Tasks, Calendar, Report)
// ========================================================
function renderProjectsView() {
  const container = document.getElementById('projectsListContainer');
  if (!container) return;

  const projects = [
    { name: 'ഖുർആൻ ഹിഫ്ള് & തജ്‌വീദ്', prog: 65, cat: 'Spiritual', color: '#2B2965' },
    { name: '100x നിത്യേനയുള്ള ഔറാദുകൾ', prog: 85, cat: 'Dhikr', color: '#5376F8' },
    { name: 'ഇംഗ്ലീഷ് ആശയവിനിമയം & സ്പീക്കിങ്', prog: 45, cat: 'Learning', color: '#7F44B8' },
    { name: 'ഇസ്ലാമിക സാഹിത്യ വായന', prog: 70, cat: 'Reading', color: '#EB5A8E' },
  ];

  container.innerHTML = projects.map((p) => `
    <div class="card" style="padding: 16px;">
      <div class="flex-between" style="margin-bottom: 8px;">
        <span class="action-pill" style="background: ${p.color}; font-size: 10px;">${p.cat}</span>
        <span class="mono" style="font-size: 12px; font-weight: 800;">${p.prog}%</span>
      </div>
      <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 10px;">${p.name}</h3>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${p.prog}%; background-color: ${p.color};"></div>
      </div>
    </div>
  `).join('');
}

function renderMyTasksView() {
  const container = document.getElementById('fullTasksContainer');
  if (!container) return;

  container.innerHTML = tasks.map((t) => `
    <div class="routine-row ${t.completed ? 'completed' : ''}" onclick="toggleTask('${t.id}')">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="check-circle ${t.completed ? 'checked' : ''}">
          ${t.completed ? '✓' : ''}
        </div>
        <div>
          <span class="no-strike" style="font-size: 13px; font-weight: 800;">${t.malayalamTitle || t.title}</span>
          <span class="mono" style="font-size: 11px; color: var(--text-muted); display: block;">⏰ ${t.time} • ${t.category}</span>
        </div>
      </div>
      <span class="action-pill" style="background: ${t.completed ? '#12B76A' : 'var(--blue)'};">
        ${t.completed ? 'Completed' : 'Pending'}
      </span>
    </div>
  `).join('');
}

function renderCalendarView() {
  const container = document.getElementById('calendarGridContainer');
  if (!container) return;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let html = daysOfWeek.map((d) => `<div style="font-size: 11px; font-weight: 800; color: var(--text-muted); padding: 4px;">${d}</div>`).join('');

  const todayDate = new Date().getDate();
  for (let i = 1; i <= 31; i++) {
    const isToday = i === todayDate;
    const isPast = i <= todayDate;
    html += `
      <div style="padding: 10px 4px; border-radius: 12px; background: ${isToday ? 'var(--brand-grad)' : isPast ? 'var(--bg-subtle)' : 'transparent'}; color: ${isToday ? '#FFF' : 'inherit'}; border: 1px solid var(--border-color); font-weight: 800; font-size: 12px;">
        ${i}
        ${isPast ? '<span style="display: block; font-size: 8px; color: #12B76A;">✔</span>' : ''}
      </div>
    `;
  }
  container.innerHTML = html;
}

let reportCompPeriod = 'daily';
function setCompReportPeriod(p) {
  reportCompPeriod = p;
  document.querySelectorAll('.period-tabs button[data-compr]').forEach((btn) => {
    if (btn.getAttribute('data-compr') === p) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderReportView();
}

function renderReportView() {
  const kpiGrid = document.getElementById('reportKpiGrid');
  const breakdownList = document.getElementById('reportBreakdownList');
  if (!kpiGrid || !breakdownList) return;

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length || 13;
  const pct = Math.round((completed / total) * 100);

  kpiGrid.innerHTML = `
    <div class="card" style="padding: 16px; border-left: 4px solid var(--pink);">
      <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">പൂർത്തീകരണ നിരക്ക്</div>
      <div class="mono" style="font-size: 26px; font-weight: 900; margin-top: 4px;">${reportCompPeriod === 'daily' ? pct + '%' : reportCompPeriod === 'weekly' ? '92%' : '88%'}</div>
    </div>
    <div class="card" style="padding: 16px; border-left: 4px solid var(--blue);">
      <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">തുടർച്ച (Streak)</div>
      <div class="mono" style="font-size: 26px; font-weight: 900; margin-top: 4px;">${streak} Days</div>
    </div>
    <div class="card" style="padding: 16px; border-left: 4px solid var(--violet);">
      <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">ആകെ ദിക്റ് എണ്ണം</div>
      <div class="mono" style="font-size: 26px; font-weight: 900; margin-top: 4px;">${reportCompPeriod === 'daily' ? '300' : reportCompPeriod === 'weekly' ? '2,100' : '9,000'}</div>
    </div>
  `;

  breakdownList.innerHTML = tasks.map((t) => `
    <div class="flex-between" style="padding: 8px 12px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-color);">
      <div>
        <span class="no-strike" style="font-size: 12px; font-weight: 800;">${t.malayalamTitle || t.title}</span>
        <span class="mono" style="font-size: 10px; color: var(--text-muted); display: block;">${t.time}</span>
      </div>
      <span class="action-pill" style="background: ${t.completed ? '#12B76A' : '#F79009'}; font-size: 9.5px;">
        ${t.completed ? 'പൂർത്തിയായി' : 'ബാക്കിയുണ്ട്'}
      </span>
    </div>
  `).join('');
}

// ========================================================
// 16. BOOTSTRAP APP ON LOAD
// ========================================================
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}
