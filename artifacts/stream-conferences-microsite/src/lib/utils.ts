import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNameInitials(name?: string, fallback: string = 'S'): string {
  if (!name || !name.trim()) return fallback;

  // Clean honorific prefixes like Dr., Prof., Mr., Mrs., Ms., Doctor, Er. etc.
  const cleaned = name
    .trim()
    .replace(/^(dr\.|dr|prof\.|prof|mr\.|mr|mrs\.|mrs|ms\.|ms|doctor|er\.|er)\b\s+/i, '')
    .trim();

  if (!cleaned) return name.charAt(0).toUpperCase() || fallback;

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}
