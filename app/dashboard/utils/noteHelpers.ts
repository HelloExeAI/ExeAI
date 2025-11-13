import { Note, Page, COMMAND_OPTIONS } from '../types/index';

export const getTodayPageTitle = (): string => {
  const today = new Date();
  return today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const extractLinkedPages = (text: string): string[] => {
  const regex = /\[\[(.*?)\]\]/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
};

export const buildNoteTree = (notes: Note[]): Note[] => {
  const noteMap = new Map<string, Note>();
  const rootNotes: Note[] = [];

  notes.forEach(note => {
    noteMap.set(note.id, { ...note, children: [] });
  });

  notes.forEach(note => {
    const noteWithChildren = noteMap.get(note.id)!;
    if (note.parentId) {
      const parent = noteMap.get(note.parentId);
      if (parent) {
        parent.children.push(noteWithChildren);
      } else {
        rootNotes.push(noteWithChildren);
      }
    } else {
      rootNotes.push(noteWithChildren);
    }
  });

  return rootNotes;
};

export const flattenNotes = (notes: Note[]): Note[] => {
  const result: Note[] = [];
  
  const flatten = (noteList: Note[]) => {
    noteList.forEach(note => {
      result.push(note);
      if (note.children && note.children.length > 0) {
        flatten(note.children);
      }
    });
  };
  
  flatten(notes);
  return result;
};

export const getTypeIcon = (type: Note['type']): string => {
  const option = COMMAND_OPTIONS.find(o => o.command === type);
  return option?.icon || '•';
};

export const getTypeColor = (type: Note['type']): string => {
  const option = COMMAND_OPTIONS.find(o => o.command === type);
  return option?.color || '#6B7280';
};

export const getTypeLabel = (type: Note['type']): string => {
  const option = COMMAND_OPTIONS.find(o => o.command === type);
  return option?.label || 'Note';
};