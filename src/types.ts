export type OvertimeColor = 'positive' | 'negative' | null;

export interface OvertimeType {
  label: string;
  overtime: number;
  color?: OvertimeColor;
}

export type WhatsToday = 'work' | 'rest';

export interface SwitchProps {
  whatsToday: WhatsToday;
  clickWhatsToday: (whatsToday: WhatsToday) => void;
}
