'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Note, Page, CommandOption, COMMAND_OPTIONS } from '@/app/dashboard/types';
import { CalendarEvent } from '@/app/types';
import { formatDateAPI, formatDateLong, getPreviousDay, getNextDay, getToday, isToday } from '@/lib/helpers/dateHelpers';
import { debounce } from '@/lib/helpers/editorHelpers';
import { getFilteredPages } from '@/app/dashboard/utils/searchUtils';
import { getAICallSuggestions } from '@/app/dashboard/utils/aiHelpers';

// Import new modular components
import DateNavigation from '../workspace/DateNavigation';
import SearchOverlay from '../workspace/SearchOverlay';
import PagesDropdown from '../workspace/PagesDropdown';
import EditorArea from '../workspace/EditorArea';

interface CenterPanelProps {
  currentPage: Page | null;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page | null>>;
  onAddCalendarEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function CenterPanel({ currentPage, setCurrentPage, onAddCalendarEvent }: CenterPanelProps) {
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [focusedNoteId, setFocusedNoteId] = useState<string | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const editRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // New simplified state
  const [currentDate, setCurrentDate] = useState(getToday());
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPages, setShowPages] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Page search state (for [[links]])
  const [showPageSearch, setShowPageSearch] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');

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

  // Create default "Shopping" page on first load
  useEffect(() => {
    const shoppingPage = getOrCreatePage('Shopping');
    if (shoppingPage.notes.length === 0) {
      shoppingPage.notes = [{
        id: Date.now().toString(),
        content: '',
        type: 'note',
        createdAt: new Date(),
        pageId: shoppingPage.id,
        linkedPages: [],
        children: [],
        parentId: null,
        indent: 0,
        completed: false
      }];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load page based on current date
  useEffect(() => {
    const dateTitle = formatDateLong(currentDate);
    const datePage = getOrCreatePage(dateTitle);

    if (datePage.notes.length === 0) {
      const firstNote: Note = {
        id: Date.now().toString(),
        content: '',
        type: 'note',
        createdAt: new Date(),
        pageId: datePage.id,
        linkedPages: [],
        children: [],
        parentId: null,
        indent: 0,
        completed: false
      };
      datePage.notes = [firstNote];
      setFocusedNoteId(firstNote.id);
    }

    setCurrentPage(datePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Auto-save functionality
  const autoSaveToAPI = useRef(
    debounce(async (date: Date, content: string) => {
      // Only save if there's actual content
      if (!content.trim()) {
        setSaveStatus('saved');
        return;
      }

      setSaveStatus('saving');

      try {
        const dateStr = formatDateAPI(date);

        const response = await fetch('/api/daily-note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: dateStr,
            content: content,
          }),
        });

        if (response.ok) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('saved'); // Don't show error to user
          console.error('Failed to save note');
        }
      } catch (error) {
        setSaveStatus('saved'); // Don't show error to user
        console.error('Error saving note:', error);
      }
    }, 1500)
  ).current;

  // Trigger auto-save when page content changes
  useEffect(() => {
    if (currentPage && currentPage.notes.length > 0) {
      const hasContent = currentPage.notes.some(note => note.content.trim() !== '');

      if (hasContent) {
        const contentStr = JSON.stringify(currentPage.notes);
        autoSaveToAPI(currentDate, contentStr);
      }
    }
  }, [currentPage, autoSaveToAPI, currentDate]);

  // Reliable focus management
  useEffect(() => {
    if (focusedNoteId && editRefs.current[focusedNoteId]) {
      const el = editRefs.current[focusedNoteId];
      // Only focus if we lost focus (e.g. render update) or explicitly asked
      if (document.activeElement !== el) {
        el.focus();
        // Move caret to end
        const range = document.createRange();
        const sel = window.getSelection();
        if (el.childNodes.length > 0) {
          // If we have text node
          const lastNode = el.childNodes[el.childNodes.length - 1];
          range.setStart(lastNode, lastNode.textContent?.length || 0);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        } else {
          // Empty div
          range.setStart(el, 0);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }
  }, [focusedNoteId, currentPage]);

  const handlePreviousDay = () => {
    setCurrentDate(getPreviousDay(currentDate));
  };

  const handleNextDay = () => {
    setCurrentDate(getNextDay(currentDate));
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
    }
  };

  const handlePagesToggle = () => {
    setShowPages(!showPages);
  };

  const handleCalendarToggle = () => {
    setShowCalendarPicker(!showCalendarPicker);
  };

  const handlePageSelect = (page: Page) => {
    setCurrentPage(page);
    setShowPages(false);
  };

  const handleCreatePage = (title: string) => {
    const newPage = getOrCreatePage(title);
    if (newPage.notes.length === 0) {
      newPage.notes = [{
        id: Date.now().toString(),
        content: '',
        type: 'note',
        createdAt: new Date(),
        pageId: newPage.id,
        linkedPages: [],
        children: [],
        parentId: null,
        indent: 0,
        completed: false
      }];
    }
    setCurrentPage(newPage);
  };

  const extractLinkedPages = (text: string): string[] => {
    const regex = /\[\[(.*?)\]\]/g;
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  };

  const buildNoteTree = (notes: Note[]): Note[] => {
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

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>, noteId: string) => {
    const target = e.currentTarget;
    const content = target.textContent || '';

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();

    // Check for [[page linking]]
    if (content.endsWith('[[')) {
      setShowPageSearch(true);
      setShowCommandMenu(false);
      setPageSearchQuery('');
      if (rect) {
        setMenuPosition({ x: rect.left, y: rect.bottom });
      }
    } else if (showPageSearch) {
      const lastBracketIndex = content.lastIndexOf('[[');
      if (lastBracketIndex !== -1) {
        const query = content.substring(lastBracketIndex + 2);
        setPageSearchQuery(query);
      } else {
        setShowPageSearch(false);
      }
    }

    // Check for slash commands
    const lastChar = content.slice(-1);
    const secondLastChar = content.slice(-2, -1);
    if (lastChar === '/' && (content.length === 1 || secondLastChar === ' ' || secondLastChar === '\n')) {
      setShowCommandMenu(true);
      setShowPageSearch(false);
      setCommandSearchQuery('');
      if (rect) {
        setMenuPosition({ x: rect.left, y: rect.bottom });
      }
    } else if (showCommandMenu) {
      const lastSlashIndex = content.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        const query = content.substring(lastSlashIndex + 1);
        setCommandSearchQuery(query);
      } else {
        setShowCommandMenu(false);
      }
    }

    updateNoteContent(noteId, content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, note: Note) => {
    if (!currentPage) return;

    const content = e.currentTarget.textContent || '';

    if (e.key === 'Enter' && !e.shiftKey && !showPageSearch && !showCommandMenu) {
      e.preventDefault();
      const selection = window.getSelection();
      const cursorPos = selection?.focusOffset || 0;

      const currentContent = content.substring(0, cursorPos);
      const remainingContent = content.substring(cursorPos);

      updateNoteContent(note.id, currentContent);
      createNewBulletWithContent(note, 'after', remainingContent);
    }

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      indentBullet(note);
    }

    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      outdentBullet(note);
    }

    if (e.key === 'Backspace' && content === '') {
      e.preventDefault();
      deleteBullet(note);
    }

    if (e.key === 'ArrowUp') {
      const selection = window.getSelection();
      if (selection && selection.anchorOffset === 0) {
        e.preventDefault();
        const allNotes = flattenNotes(currentPage.notes);
        const currentIndex = allNotes.findIndex(n => n.id === note.id);
        if (currentIndex > 0) {
          const prevNote = allNotes[currentIndex - 1];
          setFocusedNoteId(prevNote.id);
          setTimeout(() => {
            const div = editRefs.current[prevNote.id];
            if (div) {
              div.focus();
              // Place cursor at end of previous note
              const range = document.createRange();
              const sel = window.getSelection();
              const textNode = div.firstChild;
              if (textNode) {
                range.setStart(textNode, textNode.textContent?.length || 0);
              } else {
                range.setStart(div, 0);
              }
              range.collapse(true);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 0);
        }
      }
    }

    if (e.key === 'ArrowDown') {
      const selection = window.getSelection();
      const content = e.currentTarget.textContent || '';

      if (selection && selection.anchorOffset === content.length) {
        e.preventDefault();
        const allNotes = flattenNotes(currentPage.notes);
        const currentIndex = allNotes.findIndex(n => n.id === note.id);
        if (currentIndex < allNotes.length - 1) {
          const nextNote = allNotes[currentIndex + 1];
          setFocusedNoteId(nextNote.id);
          setTimeout(() => {
            const div = editRefs.current[nextNote.id];
            if (div) {
              div.focus();
              // Place cursor at start of next note
              const range = document.createRange();
              const sel = window.getSelection();
              const textNode = div.firstChild;
              if (textNode) {
                range.setStart(textNode, 0);
              } else {
                range.setStart(div, 0);
              }
              range.collapse(true);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }, 0);
        }
      }
    }

    if (e.key === 'Escape') {
      setShowPageSearch(false);
      setShowCommandMenu(false);
    }
  };

  const createNewBulletWithContent = (currentNote: Note, position: 'after' | 'child', initialContent: string = '') => {
    if (!currentPage) return;

    const newNote: Note = {
      id: `note-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      content: initialContent,
      type: 'note',
      createdAt: new Date(),
      pageId: currentPage.id,
      linkedPages: [],
      children: [],
      parentId: position === 'child' ? currentNote.id : currentNote.parentId,
      indent: position === 'child' ? currentNote.indent + 1 : currentNote.indent,
      completed: false
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

  const flattenNotes = (notes: Note[]): Note[] => {
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

  const updateNoteContent = (noteId: string, content: string) => {
    if (!currentPage) return;

    const linkedPages = extractLinkedPages(content);
    const allNotes = flattenNotes(currentPage.notes);

    const updatedNotes = allNotes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          content,
          linkedPages,
          completed: note.completed !== undefined ? note.completed : false
        };
      }
      return note;
    });

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

  const handlePageLinkSelect = (pageTitle: string, noteId: string) => {
    const editableDiv = editRefs.current[noteId];
    if (!editableDiv) return;

    const content = editableDiv.textContent || '';
    const lastBracketIndex = content.lastIndexOf('[[');

    const newContent = content.substring(0, lastBracketIndex) + `[[${pageTitle}]]`;

    editableDiv.textContent = newContent;
    updateNoteContent(noteId, newContent);
    setShowPageSearch(false);
    setPageSearchQuery('');

    editableDiv.focus();
    setTimeout(() => {
      const range = document.createRange();
      const sel = window.getSelection();
      const textNode = editableDiv.firstChild;
      if (textNode) {
        range.setStart(textNode, textNode.textContent?.length || 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);
  };

  /* Updated Handle Command Select to add Calendar Events */
  const handleCommandSelect = (command: CommandOption, noteId: string) => {
    const editableDiv = editRefs.current[noteId];
    if (!editableDiv) return;

    const content = editableDiv.textContent || '';
    const lastSlashIndex = content.lastIndexOf('/');
    const newContent = content.substring(0, lastSlashIndex).trim();

    editableDiv.textContent = newContent;

    if (!currentPage) return;

    const allNotes = flattenNotes(currentPage.notes);
    const updatedNotes = allNotes.map(note =>
      note.id === noteId
        ? {
          ...note,
          type: command.command as Note['type'],
          content: newContent,
          ...(command.command === 'todo' ? { completed: false } : {})
        }
        : note
    );

    updatePageNotes(updatedNotes);
    setShowCommandMenu(false);
    setCommandSearchQuery('');

    /* Logic to add to Calendar if destination is Calendar */
    if (onAddCalendarEvent && ['meeting', 'event', 'travel', 'birthday'].includes(command.command)) {
      // Default to current date and next hour
      const start = new Date(currentDate);
      start.setHours(new Date().getHours() + 1, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);

      onAddCalendarEvent({
        title: newContent || command.label,
        start: start,
        end: end,
        type: command.command as any,
        description: '',
        sourceNoteId: noteId
      });
      showSuccessToast(`Added to ${command.destination} for today`);
    } else {
      showSuccessToast(`Added to ${command.destination}`);
    }

    setTimeout(() => {
      editableDiv.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      const textNode = editableDiv.firstChild;
      if (textNode) {
        range.setStart(textNode, textNode.textContent?.length || 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 10);
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getTypeIcon = (type: Note['type']): string => {
    const option = COMMAND_OPTIONS.find(o => o.command === type);
    return option?.icon || '•';
  };

  const getTypeColor = (type: Note['type']): string => {
    const option = COMMAND_OPTIONS.find(o => o.command === type);
    return option?.color || '#6B7280';
  };

  const renderBulletTree = (notes: Note[], level: number = 0): React.ReactNode => {
    const tree = buildNoteTree(notes);

    return tree.map((note) => (
      <div key={note.id} style={{ marginLeft: `${level * 28}px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'start',
            gap: '8px',
            padding: '4px 0',
            position: 'relative'
          }}
        >
          <div style={{
            fontSize: '14px',
            color: getTypeColor(note.type),
            flexShrink: 0,
            marginTop: '8px',
            width: '16px',
            textAlign: 'center',
            fontWeight: '700'
          }}>
            {note.type === 'note' ? '•' : getTypeIcon(note.type)}
          </div>

          <div
            ref={(el) => {
              editRefs.current[note.id] = el;
              if (el && document.activeElement !== el && el.textContent !== note.content) {
                el.textContent = note.content;
              }
            }}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={(e) => handleContentInput(e, note.id)}
            onKeyDown={(e) => handleKeyDown(e, note)}
            onFocus={() => {
              /* Clean up any pending blur timeout to avoid race conditions */
              setFocusedNoteId(note.id);
            }}
            /* Removed onBlur to prevent cursor jumping/focus loss issues */
            style={{
              flex: 1,
              fontSize: '15px',
              color: '#1F2937',
              lineHeight: 1.6,
              outline: 'none',
              minHeight: '24px',
              padding: '4px 8px',
              borderRadius: '6px',
              cursor: 'text',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              backgroundColor: focusedNoteId === note.id ? '#F9FAFB' : 'transparent',
              transition: 'background-color 0.15s'
            }}
          />
        </div>

        {note.children && note.children.length > 0 && (
          <div style={{ marginTop: '0px' }}>
            {renderBulletTree(note.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const filteredPages = allPages.filter(page =>
    page.title.toLowerCase().includes(pageSearchQuery.toLowerCase())
  );

  const filteredCommands = COMMAND_OPTIONS.filter(cmd =>
    cmd.command.toLowerCase().includes(commandSearchQuery.toLowerCase()) ||
    cmd.label.toLowerCase().includes(commandSearchQuery.toLowerCase())
  );

  const searchResults = getFilteredPages(allPages, searchQuery);

  return (
    <>
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF'
      }}>
        {/* NEW: Simplified Header */}
        <DateNavigation
          currentDate={currentDate}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onSearchToggle={handleSearchToggle}
          onPagesToggle={handlePagesToggle}
          onCalendarToggle={handleCalendarToggle}
        />

        {/* Main Editor Area */}
        <EditorArea
          notes={currentPage?.notes || []}
          focusedNoteId={focusedNoteId}
          editRefs={editRefs}
          onContentInput={handleContentInput}
          onKeyDown={handleKeyDown}
          onFocus={setFocusedNoteId}
          onBlur={() => setFocusedNoteId(null)}
          renderBulletTree={renderBulletTree}
        />

        {/* Page Search Menu */}
        {showPageSearch && (
          <div style={{
            position: 'fixed',
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            minWidth: '280px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E5E7EB',
              fontSize: '11px',
              fontWeight: '700',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              🔗 Link to Page
            </div>

            {filteredPages.length === 0 && pageSearchQuery && (
              <div
                onClick={() => focusedNoteId && handlePageLinkSelect(pageSearchQuery, focusedNoteId)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>➕</span>
                <div>
                  <div style={{ fontWeight: '600' }}>Create "{pageSearchQuery}"</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>New page</div>
                </div>
              </div>
            )}

            {filteredPages.slice(0, 8).map(page => (
              <div
                key={page.id}
                onClick={() => focusedNoteId && handlePageLinkSelect(page.title, focusedNoteId)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#1F2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  borderBottom: '1px solid #F3F4F6'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>📄</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{page.title}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    {page.notes.length} notes
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Command Menu */}
        {showCommandMenu && (
          <div style={{
            position: 'fixed',
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            minWidth: '320px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #E5E7EB',
              fontSize: '11px',
              fontWeight: '700',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              ⚡ Quick Commands
            </div>

            {filteredCommands.map(cmd => (
              <div
                key={cmd.command}
                onClick={() => focusedNoteId && handleCommandSelect(cmd, focusedNoteId)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '12px',
                  transition: 'all 0.2s',
                  borderBottom: '1px solid #F3F4F6'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  fontSize: '20px',
                  color: cmd.color,
                  flexShrink: 0
                }}>
                  {cmd.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '2px'
                  }}>
                    /{cmd.command}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginBottom: '4px'
                  }}>
                    {cmd.description}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: cmd.color,
                    backgroundColor: cmd.color + '15',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    fontWeight: '600'
                  }}>
                    → {cmd.destination}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helper Bar */}
        <div style={{
          padding: '12px 32px',
          backgroundColor: '#EFF6FF',
          borderTop: '1px solid #DBEAFE',
          fontSize: '12px',
          color: '#1E40AF',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <span><strong>Enter</strong> New bullet</span>
          <span><strong>Tab</strong> Indent</span>
          <span><strong>Shift+Tab</strong> Outdent</span>
          <span><strong>[[</strong> Link pages</span>
          <span><strong>/</strong> Commands</span>
          <span><strong>🔍</strong> Search</span>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={showSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={() => setShowSearch(false)}
        searchResults={searchResults}
        onPageSelect={(page) => {
          setCurrentPage(page);
          setShowSearch(false);
        }}
      />

      {/* Pages Dropdown */}
      <PagesDropdown
        isOpen={showPages}
        pages={allPages}
        currentPage={currentPage}
        onPageSelect={handlePageSelect}
        onClose={() => setShowPages(false)}
        onCreatePage={handleCreatePage}
      />

      {/* Calendar Picker Modal */}
      {showCalendarPicker && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCalendarPicker(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              width: '500px',
              maxHeight: '600px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#1F2937'
              }}>
                📅 Select Date
              </h3>
              <button
                onClick={() => setShowCalendarPicker(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '24px',
                  padding: '0 4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Date Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => {
                  const newDate = getPreviousDay(currentDate);
                  setCurrentDate(newDate);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF3C7';
                  e.currentTarget.style.borderColor = '#F4B000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                ← Previous
              </button>

              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1F2937'
              }}>
                {formatDateLong(currentDate)}
              </div>

              <button
                onClick={() => {
                  const newDate = getNextDay(currentDate);
                  setCurrentDate(newDate);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF3C7';
                  e.currentTarget.style.borderColor = '#F4B000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                Next →
              </button>
            </div>

            {/* Notes Preview */}
            <div style={{
              backgroundColor: '#F9FAFB',
              borderRadius: '12px',
              padding: '20px',
              maxHeight: '350px',
              overflowY: 'auto'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                fontWeight: '700',
                color: '#6B7280'
              }}>
                Notes from {formatDateLong(currentDate)}:
              </h4>

              {currentPage && currentPage.notes.length > 0 && currentPage.notes.some(n => n.content.trim()) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentPage.notes.filter(n => n.content.trim()).map((note) => (
                    <div
                      key={note.id}
                      style={{
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#1F2937',
                        border: '1px solid #E5E7EB'
                      }}
                    >
                      • {note.content}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#9CA3AF'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                  <div>No notes for this date</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => {
                  setCurrentDate(getToday());
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #F4B000',
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FDE68A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FEF3C7';
                }}
              >
                Go to Today
              </button>

              <button
                onClick={() => setShowCalendarPicker(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease'
        }}>
          <span style={{ fontSize: '20px' }}>✓</span>
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}