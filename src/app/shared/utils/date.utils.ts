import { format, parseISO, isToday, isYesterday, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(date: Date | string, formatStr = 'dd MMMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: fr });
}

export function getDateLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) {
    return "Aujourd'hui";
  }
  
  if (isYesterday(d)) {
    return 'Hier';
  }
  
  return formatDate(d, 'EEEE dd MMMM');
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime();
}