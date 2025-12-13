import type { OvertimeColor } from '../types';

export const getTimeColor = (overtime: number): OvertimeColor => {
  if (overtime > -1 && overtime < 60) return null;
  return overtime >= 60 ? 'positive' : 'negative';
}

export const getSign = (time: number): string => {
  return (time > -1 && time < 60) ? '' : time >= 60 ? '+' : '-'
}

export const getHours = (time: number): string => {
  const totalMinutes = Math.floor(time / 60);
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  return twoDigits(hours);
};

export const getMinutes = (time: number): string => {
  const totalMinutes = Math.floor(time / 60);
  const minutes = Math.abs(totalMinutes % 60);
  return twoDigits(minutes);
};

export const getSeconds = (time: number): string => {
  return twoDigits(time % 60);
}

export const twoDigits = (n: number) => String(n).padStart(2, '0');
