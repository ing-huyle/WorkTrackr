import type { OvertimeColor } from '../types';

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

export const loadNumber = (key: string, fallback: number): number => {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const persistNumber = (key: string, value: number): void => {
  localStorage.setItem(key, String(value));
};
