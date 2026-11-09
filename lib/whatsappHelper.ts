import { Task } from '@/types/task';
import { Language } from './translations';

export function formatPhoneNumber(phone: string): string {
  // Clean non-digit characters except leading plus
  let cleaned = phone.replace(/[^0-9]/g, '');
  // Default to India (+91) if 10 digits
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

export function generateCompletedReport(tasks: Task[], language: Language = 'ml', streak = 1): string {
  const completed = tasks.filter((t) => t.completed);
  const total = tasks.length;
  const dateStr = new Date().toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (language === 'ml') {
    let msg = `🌟 *ടാസ്കാതി ദിനചര്യ റിപ്പോർട്ട് - പൂർത്തിയായവ* 🌟\n`;
    msg += `📅 തീയതി: ${dateStr}\n`;
    msg += `✅ പൂർത്തിയായവ: ${completed.length}/${total}\n`;
    msg += `🔥 തുടർച്ച: ${streak} ദിവസങ്ങൾ\n\n`;

    if (completed.length === 0) {
      msg += `ഇതുവരെ ഒരു ദിനചര്യയും പൂർത്തിയായിട്ടില്ല.\n`;
    } else {
      msg += `*പൂർത്തിയാക്കിയ ദിനചര്യകൾ:*\n`;
      completed.forEach((t, index) => {
        const title = t.malayalamTitle || t.title;
        const arabic = t.arabicTitle ? ` (${t.arabicTitle})` : '';
        msg += `${index + 1}. ✔️ ${title}${arabic} - ${t.time}\n`;
      });
    }

    msg += `\nഅൽഹംദുലില്ലാഹ്! നാഥൻ സ്വീകരിക്കട്ടെ. 🤲`;
    return msg;
  } else {
    let msg = `🌟 *TASKATI DAILY REPORT - COMPLETED TASKS* 🌟\n`;
    msg += `📅 Date: ${dateStr}\n`;
    msg += `✅ Completed: ${completed.length}/${total}\n`;
    msg += `🔥 Streak: ${streak} Days\n\n`;

    if (completed.length === 0) {
      msg += `No tasks completed yet today.\n`;
    } else {
      msg += `*Completed Routines:*\n`;
      completed.forEach((t, index) => {
        msg += `${index + 1}. ✔️ ${t.title} - ${t.time}\n`;
      });
    }

    msg += `\nAlhamdulillah! Keep up the good work. ✨`;
    return msg;
  }
}

export function generatePendingReport(tasks: Task[], language: Language = 'ml'): string {
  const pending = tasks.filter((t) => !t.completed);
  const total = tasks.length;
  const dateStr = new Date().toLocaleDateString(language === 'ml' ? 'ml-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (language === 'ml') {
    let msg = `⚠️ *ടാസ്കാതി ഓർമ്മപ്പെടുത്തൽ - പൂർത്തിയാവാത്തവ* ⚠️\n`;
    msg += `📅 തീയതി: ${dateStr}\n`;
    msg += `⏳ ബാക്കിയുള്ളവ: ${pending.length}/${total}\n\n`;

    if (pending.length === 0) {
      msg += `മാശാ അല്ലാഹ്! ഇന്നത്തെ എല്ലാ ദിനചര്യകളും പൂർത്തിയായിക്കഴിഞ്ഞു. 🎉\n`;
    } else {
      msg += `*ഇനിയും പൂർത്തിയാക്കാനുള്ള ദിനചര്യകൾ:*\n`;
      pending.forEach((t, index) => {
        const title = t.malayalamTitle || t.title;
        const arabic = t.arabicTitle ? ` (${t.arabicTitle})` : '';
        msg += `${index + 1}. ⏳ ${title}${arabic} - നിശ്ചിത സമയം: ${t.time}\n`;
      });
      msg += `\nദയവായി സമയം ശ്രദ്ധിച്ച് ഉടൻ പൂർത്തിയാക്കുക! 🔔`;
    }

    return msg;
  } else {
    let msg = `⚠️ *TASKATI REMINDER - PENDING TASKS* ⚠️\n`;
    msg += `📅 Date: ${dateStr}\n`;
    msg += `⏳ Incomplete: ${pending.length}/${total}\n\n`;

    if (pending.length === 0) {
      msg += `MashaAllah! All daily tasks are finished for today! 🎉\n`;
    } else {
      msg += `*Pending Routines to Complete:*\n`;
      pending.forEach((t, index) => {
        msg += `${index + 1}. ⏳ ${t.title} - Scheduled: ${t.time}\n`;
      });
      msg += `\nPlease complete your pending routines on time! 🔔`;
    }

    return msg;
  }
}

export function openWhatsApp(phone: string, text: string) {
  const cleanPhone = formatPhoneNumber(phone);
  const encoded = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

export function openSMS(phone: string, text: string) {
  const cleanPhone = formatPhoneNumber(phone);
  const encoded = encodeURIComponent(text);
  const url = `sms:${cleanPhone}?body=${encoded}`;
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}
