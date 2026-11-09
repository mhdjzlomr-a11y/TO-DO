export type TaskCategory = 'spiritual' | 'learning' | 'health' | 'work' | 'personal';

export type TaskType = 'standard' | 'counter' | 'reading';

export interface ReadingDetails {
  materialType: 'Book' | 'Quran Tafsir' | 'Islamic Literature' | 'English Article' | 'Self Development' | 'Custom';
  title: string;
  targetMinutes: number;
  minutesSpent: number;
  startPage?: string;
  endPage?: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  subtitle?: string;
  arabicTitle?: string;
  time: string; // 24-hr format "HH:mm" e.g. "05:30", "18:45"
  period?: 'fajr' | 'morning' | 'afternoon' | 'evening' | 'night';
  completed: boolean;
  category: TaskCategory;
  type: TaskType;
  counterTarget?: number; // e.g. 100 for 100 ISTHIGFAR
  counterCurrent?: number;
  readingDetails?: ReadingDetails;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  completedAt?: string;
}

export interface DayHistory {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalCount: number;
  completionRate: number;
}
