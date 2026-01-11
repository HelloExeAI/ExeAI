// src/components/calendar/CalendarTypes.ts
// Shared types for Calendar components

export interface CalendarEvent {
  id: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'internal_meeting' | 'client_meeting' | 'call_reminder' | 'travel' | 'vacation' | 'weekend' | 'holiday' | 'reminder' | 'event' | 'meeting';
  title: string;
  time?: string;
  color: string;
  description?: string;
  meetingLink?: string;
  location?: string;
  attendees?: { email: string; responseStatus?: string }[];
  start?: Date;
  end?: Date;
  metadata?: any;
}

export interface EventTypeConfig {
  type: string;
  label: string;
  color: string;
  icon: string;
}

export const DEFAULT_EVENT_TYPES: EventTypeConfig[] = [
  { type: 'birthday', label: 'Birthday', color: '#EC4899', icon: '🎂' },
  { type: 'anniversary', label: 'Anniversary', color: '#8B5CF6', icon: '💍' },
  { type: 'internal_meeting', label: 'Internal Meeting', color: '#3B82F6', icon: '👥' },
  { type: 'client_meeting', label: 'Client Meeting', color: '#1E40AF', icon: '🤝' },
  { type: 'call_reminder', label: 'Call Reminder', color: '#F59E0B', icon: '📞' },
  { type: 'travel', label: 'Travel', color: '#14B8A6', icon: '✈️' },
  { type: 'vacation', label: 'Vacation', color: '#10B981', icon: '🏖️' },
  { type: 'weekend', label: 'Weekend', color: '#34D399', icon: '🎉' },
  { type: 'holiday', label: 'Holiday', color: '#EF4444', icon: '🏛️' },
  { type: 'reminder', label: 'Reminder', color: '#F4B000', icon: '⏰' },
  { type: 'meeting', label: 'Meeting', color: '#8B5CF6', icon: '👥' },
  { type: 'event', label: 'Event', color: '#F59E0B', icon: '📅' },
];

export interface NewEventData {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  type: string;
  description: string;
  allDay: boolean;
}