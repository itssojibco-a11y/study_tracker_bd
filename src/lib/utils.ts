import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBDDateString(d: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(d);
  const year = parts.find((p: any) => p.type === 'year')?.value;
  const month = parts.find((p: any) => p.type === 'month')?.value;
  const day = parts.find((p: any) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}