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

export type SettingsDialogProps = {
  isOpen: boolean;
  toggleSettings: () => void;

  defaultOvertimeToday: number;
  setDefaultOvertimeToday: (v: number) => void;

  overtimeToday: number;
  setOvertimeToday: (v: number) => void;

  overtimeTotal: number;
  setOvertimeTotal: (v: number) => void;

  increment: number;
  setIncrement: (v: number) => void;
};
