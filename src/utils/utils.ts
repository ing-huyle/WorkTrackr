import type { OvertimeColor } from '../types';


// Time formating
export const getTimeColor = (overtime: number): OvertimeColor => {
  if (overtime > -1 && overtime < 60) return null;
  return overtime >= 60 ? 'positive' : 'negative';
}

export const getSign = (time: number): string => {
  if (time > -1 && time < 60) return '';
  return time >= 60 ? '+' : '-';
}

const getTotalMinutes = (time: number): number => Math.floor(time / 60);

export const getHours = (time: number): string => {
  const totalMinutes = getTotalMinutes(time);
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  return twoDigits(hours);
};

export const getMinutes = (time: number): string => {
  const totalMinutes = getTotalMinutes(time);
  const minutes = Math.abs(totalMinutes % 60);
  return twoDigits(minutes);
};

export const getSeconds = (time: number): string => {
  return twoDigits(time % 60);
}

export const twoDigits = (n: number) => String(n).padStart(2, '0');

export const splitSecondsToHm = (totalSeconds: number) => {
  const s = Math.max(0, Math.trunc(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return { h, m };
};

export const hmToSeconds = (h: number, m: number) => {
  const hh = Math.max(0, Math.trunc(h));
  const mm = clamp(Math.trunc(m), 0, 59);
  return hh * 3600 + mm * 60;
};

export const splitSignedSecondsToHm = (totalSeconds: number) => {
  const sign: 1 | -1 = totalSeconds < 0 ? -1 : 1;
  const abs = Math.abs(Math.trunc(totalSeconds));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  return { sign, h, m };
};

export const signedHmToSeconds = (sign: 1 | -1, h: number, m: number) => {
  const hh = Math.max(0, Math.trunc(h));
  const mm = Math.min(59, Math.max(0, Math.trunc(m)));
  return sign * (hh * 3600 + mm * 60);
};


// Local storage management
export const loadNumber = (key: string, fallback: number): number => {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const persistNumber = (key: string, value: number): void => {
  localStorage.setItem(key, String(value));
};


// Other
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
