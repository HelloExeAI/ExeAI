// Types for EXEAI application - Notes System

export interface Note {
    id: string;
    content: string;
    type: 'note' | 'todo' | 'travel' | 'meeting' | 'event' | 'birthday' | 'shopping' | 'followup' | 'email' | 'message' | 'call' | 'reminder';
    createdAt: Date;
    pageId: string;
    linkedPages: string[];
    children: Note[];
    parentId: string | null;
    indent: number;
    completed?: boolean;
  }
  
  export interface Page {
    id: string;
    title: string;
    createdAt: Date;
    lastModified: Date;
    notes: Note[];
  }
  
  export interface CommandOption {
    command: string;
    label: string;
    icon: string;
    color: string;
    description: string;
    destination: string;
  }
  
  export const COMMAND_OPTIONS: CommandOption[] = [
    { command: 'todo', label: 'To-Do', icon: '☐', color: '#3B82F6', description: 'Add a task', destination: 'Tasks' },
    { command: 'travel', label: 'Travel', icon: '✈️', color: '#14B8A6', description: 'Plan travel', destination: 'Calendar' },
    { command: 'meeting', label: 'Meeting', icon: '👥', color: '#8B5CF6', description: 'Schedule meeting', destination: 'Calendar' },
    { command: 'event', label: 'Event', icon: '📅', color: '#F59E0B', description: 'Add event', destination: 'Calendar' },
    { command: 'birthday', label: 'Birthday', icon: '🎂', color: '#EC4899', description: 'Birthday reminder', destination: 'Calendar' },
    { command: 'shopping', label: 'Shopping', icon: '🛒', color: '#10B981', description: 'Shopping list item', destination: 'Shopping' },
    { command: 'followup', label: 'Follow-up', icon: '🔄', color: '#F59E0B', description: 'Follow-up task', destination: 'Follow-ups' },
    { command: 'email', label: 'Email', icon: '📧', color: '#3B82F6', description: 'Email reminder', destination: 'Follow-ups' },
    { command: 'message', label: 'Message', icon: '💬', color: '#10B981', description: 'Message reminder', destination: 'Follow-ups' },
    { command: 'call', label: 'Call', icon: '📞', color: '#EF4444', description: 'Call reminder', destination: 'Calls' },
    { command: 'reminder', label: 'Reminder', icon: '⏰', color: '#F4B000', description: 'General reminder', destination: 'Reminders' },
  ];