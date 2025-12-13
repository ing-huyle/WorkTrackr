export type OvertimeColor = 'positive' | 'negative' | null;

export interface OvertimeType {
  label: string;
  overtime: number;
  color?: OvertimeColor;
}

export type WhatsToday = 'work' | 'rest';
