import { useState, useEffect, useRef } from 'react';
import { Note, Page } from '../types/notes';
import { getTodayPageTitle, extractLinkedPages, flattenNotes } from '../utils/noteHelpers';

export const useCenterPanel = () => {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [showPagePopup, setShowPagePopup] = useState(false);
  const [selectedPageForPopup, setSelectedPageForPopup] = useState<Page | null>(null);
  const [showPageSearch, setShowPageSearch] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const editRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const todayPageTitle = getTodayPageTitle();
    const todayPage = getOrCreatePage(todayPageTitle);
    
    if (todayPage.notes.length === 0) {
      const firstNote: Note = {
        id: Date.now().toString(),
        content: '',
        type: 'note',
        createdAt: new Date(),
        pageId: todayPage.id,
        linkedPages: [],
        children: [],
        parentId: null,
        indent: 0
      };
      todayPage.notes = [firstNote];
      setFocusedNoteId(firstNote.id);
    }
    
    setCurrentPage(todayPage);
  }, []);

  const getOrCreatePage = (title: string): Page => {
    let page = allPages.find(p => p.title === title);
    
    if (!page) {
      page = {
        id: Date.now().toString(),
        title,
        createdAt: new Date(),
        lastModified: new Date(),
        notes: []
      };
      setAllPages([...allPages, page]);
    }
    
    return page;
  };

  const updateNoteContent = (noteId: string, content: string) => {
    if (!currentPage) return;
    
    const linkedPages = extractLinkedPages(content);
    const allNotes = flattenNotes(currentPage.notes);
    
    const updatedNotes = allNotes.map(note => 
      note.id === noteId 
        ? { ...note, content, linkedPages }
        : note
    );
    
    updatePageNotes(updatedNotes);
    
    linkedPages.forEach(pageTitle => {
      getOrCreatePage(pageTitle);
    });
  };

  const updatePageNotes = (flatNotes: Note[]) => {
    if (!currentPage) return;
    
    const updatedPage = {
      ...currentPage,
      notes: flatNotes,
      lastModified: new Date()
    };

    setCurrentPage(updatedPage);
    setAllPages(allPages.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const createNewBulletWithContent = (currentNote: Note, position: 'after' | 'child', initialContent: string = '') => {
    if (!currentPage) return;

    const newNote: Note = {
      id: Date.now().toString(),
      content: initialContent,
      type: 'note',
      createdAt: new Date(),
      pageId: currentPage.id,
      linkedPages: [],
      children: [],
      parentId: position === 'child' ? currentNote.id : currentNote.parentId,
      indent: position === 'child' ? currentNote.indent + 1 : currentNote.indent
    };

    const allNotes = flattenNotes(currentPage.notes);
    const currentIndex = allNotes.findIndex(n => n.id === currentNote.id);
    
    if (position === 'after') {
      allNotes.splice(currentIndex + 1, 0, newNote);
    } else {
      allNotes.push(newNote);
    }

    updatePageNotes(allNotes);
    setFocusedNoteId(newNote.id);
    
    setTimeout(() => {
      const div = editRefs.current[newNote.id];
      if (div) {
        div.focus();
        if (initialContent) {
          const range = document.createRange();
          const sel = window.getSelection();
          const textNode = div.firstChild;
          if (textNode) {
            range.setStart(textNode, 0);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      }
    }, 10);
  };

  const indentBullet = (note: Note) => {
    if (!currentPage) return;
    
    const allNotes = flattenNotes(currentPage.notes);
    const currentIndex = allNotes.findIndex(n => n.id === note.id);
    
    if (currentIndex > 0) {
      const previousNote = allNotes[currentIndex - 1];
      note.parentId = previousNote.id;
      note.indent = previousNote.indent + 1;
      
      updatePageNotes(allNotes);
    }
  };

  const outdentBullet = (note: Note) => {
    if (!currentPage || note.indent === 0) return;
    
    const allNotes = flattenNotes(currentPage.notes);
    
    if (note.parentId) {
      const parent = allNotes.find(n => n.id === note.parentId);
      if (parent) {
        note.parentId = parent.parentId;
        note.indent = parent.indent;
        updatePageNotes(allNotes);
      }
    }
  };

  const deleteBullet = (note: Note) => {
    if (!currentPage) return;
    
    const allNotes = flattenNotes(currentPage.notes);
    
    if (allNotes.length === 1) return;
    
    const currentIndex = allNotes.findIndex(n => n.id === note.id);
    const filtered = allNotes.filter(n => n.id !== note.id);
    
    updatePageNotes(filtered);
    
    if (currentIndex > 0) {
      const prevNote = filtered[currentIndex - 1];
      setFocusedNoteId(prevNote.id);
      setTimeout(() => {
        const div = editRefs.current[prevNote.id];
        if (div) {
          div.focus();
          const range = document.createRange();
          const sel = window.getSelection();
          const textNode = div.firstChild;
          if (textNode) {
            range.setStart(textNode, textNode.textContent?.length || 0);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }
      }, 10);
    }
  };

  const switchToPage = (pageTitle: string) => {
    const page = getOrCreatePage(pageTitle);
    setCurrentPage(page);
    setShowPagePopup(false);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return {
    currentPage,
    allPages,
    focusedNoteId,
    setFocusedNoteId,
    showPagePopup,
    setShowPagePopup,
    selectedPageForPopup,
    setSelectedPageForPopup,
    showPageSearch,
    setShowPageSearch,
    showCommandMenu,
    setShowCommandMenu,
    pageSearchQuery,
    setPageSearchQuery,
    commandSearchQuery,
    setCommandSearchQuery,
    menuPosition,
    setMenuPosition,
    showToast,
    toastMessage,
    editRefs,
    updateNoteContent,
    createNewBulletWithContent,
    indentBullet,
    outdentBullet,
    deleteBullet,
    switchToPage,
    showSuccessToast,
    getTodayPageTitle,
  };
};