// src/types/settings.ts

export interface WorldClock {
  city: string;
  timezone: string;
  offset: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Calendar Settings
  calendarDefaultDuration: number;
  calendarWeekendMode: string;
  calendarFirstDayOfWeek: string;
  calendarGoogleConnected: boolean;
  calendarOutlookConnected: boolean;
  calendarAppleConnected: boolean;
  calendarShowCurrentEvent?: boolean;

  // Clock Settings
  clockShowSeconds: boolean;
  clockTimezone: string;
  clockWeatherLocation?: string;
  timerDefaultDuration: number;
  timerSoundEnabled: boolean;
  worldClocks?: string | WorldClock[] | null;

  // Workspace Settings
  workspaceThemeMode?: string;
  workspaceAccentColor: string;
  workspaceFontSize?: string;
  workspaceSidebarWidth?: string;
  workspaceShowLeftSidebar?: boolean;
  workspaceShowRightSidebar?: boolean;

  // Todo Settings
  todoDefaultPriority: string;
  todoShowCompleted: boolean;
  todoAutoArchiveDays: number;
  todoSortBy: string;
  todoRemindersEnabled: boolean;

  // Email Settings
  emailGmailConnected?: boolean;
  emailOutlookConnected?: boolean;
  emailSignature?: string | null;
  emailNotifications?: boolean;

  // Message Settings
  messageWhatsAppConnected?: boolean;
  messageSMSConnected?: boolean;
  messageTeamsConnected?: boolean;
  messageSlackConnected?: boolean;
  messageReadReceipts?: boolean;
  messageNotifications?: boolean;

  // General Preferences
  language: string;
  dateFormat: string;
  timeFormat?: string;
  notificationsEnabled: boolean;
  soundEnabled?: boolean;
}

export const DEFAULT_USER_SETTINGS: Partial<UserSettings> = {
  // Calendar
  calendarDefaultDuration: 60,
  calendarWeekendMode: 'both_off',
  calendarFirstDayOfWeek: 'sunday',
  calendarGoogleConnected: false,
  calendarOutlookConnected: false,
  calendarAppleConnected: false,
  calendarShowCurrentEvent: true,

  // Clock
  clockShowSeconds: true,
  clockTimezone: 'Asia/Kolkata',
  clockWeatherLocation: 'Bengaluru,IN',
  timerDefaultDuration: 300,
  timerSoundEnabled: true,
  worldClocks: null,

  // Workspace
  workspaceThemeMode: 'light',
  workspaceAccentColor: '#F4B000',
  workspaceFontSize: 'medium',
  workspaceSidebarWidth: 'default',
  workspaceShowLeftSidebar: true,
  workspaceShowRightSidebar: true,

  // Todo
  todoDefaultPriority: 'medium',
  todoShowCompleted: true,
  todoAutoArchiveDays: 30,
  todoSortBy: 'date',
  todoRemindersEnabled: true,

  // Email
  emailGmailConnected: false,
  emailOutlookConnected: false,
  emailSignature: null,
  emailNotifications: true,

  // Messages
  messageWhatsAppConnected: false,
  messageSMSConnected: false,
  messageTeamsConnected: false,
  messageSlackConnected: false,
  messageReadReceipts: true,
  messageNotifications: true,

  // General
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  notificationsEnabled: true,
  soundEnabled: true,
};