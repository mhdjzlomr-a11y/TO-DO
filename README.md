# Taskati. - Daily Routine & Task Tracker Progressive Web App (PWA)

A mobile-friendly, offline-capable Daily Task Tracker Progressive Web App built with **Next.js**, **React**, and **Tailwind CSS**, designed in the sleek modern **Taskati** UI theme.

---

## 🌟 Key Features

1. **Preloaded Daily Routines**:
   - 📿 **AURADU SHADULIYY** (`05:45 AM` - Morning Awrād al-Shādhiliyyah)
   - 📖 **YASEEN** (`06:15 AM` - Surah Yaseen recitation)
   - 📿 **100 ISTHIGFAR** (`06:45 AM` - Astaghfirullah 100x with interactive digital Tasbeeh counter)
   - 📿 **100 THASBEEH** (`07:15 AM` - SubhanAllah wa bihamdihi 100x with digital counter)
   - 📿 **100 SWALATH** (`07:45 AM` - Salawat on Prophet ﷺ 100x with digital counter)
   - 🎧 **ENGLISH LISTENING** (`08:30 AM` - Podcasts / Audio comprehension)
   - 🎙️ **ENGLISH SPEAKING** (`10:30 AM` - Shadowing & fluency practice)
   - 🕌 **QIRAATH** (`01:45 PM` - Daily Quran Tilawat)
   - 📚 **DAILY READING { Options Hub }** (`04:30 PM` - Books, Tafsir, Articles with Focus Stopwatch & Page tracker)
   - 🛡️ **HADDAD** (`06:45 PM` - Ratib al-Haddad spiritual litany after Maghrib)
   - ✨ **ASMAUL HUSNA** (`07:45 PM` - 99 Names of Allah)
   - 👑 **MULK** (`09:30 PM` - Surah Al-Mulk before sleeping)
   - 🤲 **FATHIHA** (`10:00 PM` - Closing day with intentions)

2. **Taskati Color Palette & Design**:
   - Ultra-clean `#F4F6FC` light page background
   - Pure `#FFFFFF` rounded-3xl cards with soft drop shadows
   - Signature Indigo/Blue `#5051F9`, Magenta/Pink `#E84E89`, Purple `#744BE4`, and Midnight Navy `#1C1E38`
   - Real-time Donut Progress Ring with percentage & category breakdown
   - 4-column Habit Focus tiles (Dhikr 300, Quran 4, Reading 25m, English 2)

3. **Interactive Dhikr / Tasbeeh Counter**:
   - Dedicated full-screen tactile tally clicker for mobile thumbs
   - Haptic vibration feedback on tap
   - Audio chime and confetti celebration upon completing 100 counts
   - Auto marks the task as completed

4. **Daily Reading Options Hub & Timer**:
   - Material selector (Books, Quran Tafsir, Islamic Literature, English Articles, Self-Development)
   - Built-in reading focus stopwatch (start / pause / reset)
   - Page tracker (Start page to End page)
   - Reflection notes and takeaway quotes

5. **PWA & Mobile Installability**:
   - Fully compliant Web App Manifest (`manifest.json`)
   - Offline caching via Service Worker (`sw.js`)
   - Standalone mobile home-screen install banner for Chrome, Edge, and iOS Safari

6. **Scheduled Push Notifications**:
   - Local and Web Push notification alerts triggered at each scheduled routine time
   - Test Alert button with audio chime

7. **Local Storage Persistence**:
   - All tasks, completion statuses, custom habits, and streaks stored in browser `localStorage`
   - Rollover safety across new days

---

## 🚀 Quick Start

Double-click `START-APP.bat` to launch the dev server and open your browser automatically.

Or in terminal:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📦 Static Export / Build
```bash
npm run build
```
Creates a standalone `out/` folder ready for GitHub Pages or static web hosting!
