// Search utilities for EXEAI application
import { Page, Note } from '../types/index';

export interface SearchResult {
  page: Page;
  matchingNotes: Note[];
}

export function getFilteredPages(allPages: Page[], searchQuery: string): Page[] {
  if (!searchQuery.trim()) return allPages;
  
  return allPages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.notes.some(note => 
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
}