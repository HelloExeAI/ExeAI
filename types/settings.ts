// src/app/types/settings.ts
// TypeScript types for EXEAI Settings

export interface UserSettings {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Calendar Settings
  calendarDefaultDuration: number; // 15, 30, 45, 60, 90, 120 minutes
  calendarWeekendMode: 'all_working' | 'alternate_sat' | 'both_off';
  calendarFirstDayOfWeek: 'sunday' | 'monday';
  calendarGoogleConnected: boolean;
  calendarOutlookConnected: boolean;
  calendarAppleConnected: boolean;

  // Clock Settings
  clockShowSeconds: boolean;
  clockTimezone: string;
  timerDefaultDuration: number; // in seconds
  timerSoundEnabled: boolean;
  worldClocks?: string | null; // JSON string of WorldClock[]

  // Workspace Settings
  workspaceTheme: 'light' | 'dark';
  workspaceAccentColor: string;
  workspaceAutoSave: number; // in milliseconds
  workspaceFontSize: number;
  workspaceSpellCheck: boolean;
  aiAnalysisMode: 'manual' | 'automatic';

  // Todo Settings
  todoDefaultPriority: 'low' | 'medium' | 'high';
  todoShowCompleted: boolean;
  todoAutoArchiveDays: number;
  todoSortBy: 'date' | 'priority' | 'manual';
  todoRemindersEnabled: boolean;

  // Email Settings
  emailSignature?: string | null;
  emailNotifications: boolean;

  // Message Settings
  messageReadReceipts: boolean;
  messageNotifications: boolean;

  // General Preferences
  language: string;
  dateFormat: string;
  notificationsEnabled: boolean;
}

export interface WorldClock {
  city: string;
  timezone: string;
}

// Partial type for updating settings
export type UpdateSettingsInput = Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// Default settings for new users
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  // Calendar
  calendarDefaultDuration: 60,
  calendarWeekendMode: 'both_off',
  calendarFirstDayOfWeek: 'sunday',
  calendarGoogleConnected: false,
  calendarOutlookConnected: false,
  calendarAppleConnected: false,

  // Clock
  clockShowSeconds: true,
  clockTimezone: 'Asia/Kolkata',
  timerDefaultDuration: 300,
  timerSoundEnabled: true,
  worldClocks: null,

  // Workspace
  workspaceTheme: 'light',
  workspaceAccentColor: '#F4B000',
  workspaceAutoSave: 1500,
  workspaceFontSize: 14,
  workspaceSpellCheck: true,
  aiAnalysisMode: 'automatic',

  // Todo
  todoDefaultPriority: 'medium',
  todoShowCompleted: true,
  todoAutoArchiveDays: 30,
  todoSortBy: 'date',
  todoRemindersEnabled: true,

  // Email
  emailSignature: null,
  emailNotifications: true,

  // Messages
  messageReadReceipts: true,
  messageNotifications: true,

  // General
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  notificationsEnabled: true,
};