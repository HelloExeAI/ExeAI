'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getAICallSuggestions } from '@/app/dashboard/utils/aiHelpers';
import { getFilteredPages } from '@/app/dashboard/utils/searchUtils';
import { getTodayPageTitle } from '@/app/dashboard/utils/noteHelpers';
import { Note, Page, CommandOption, COMMAND_OPTIONS } from '@/app/dashboard/types/index';
import { CalendarEvent } from '@/app/types';
import AnalysisModeToggle from '@/components/workspace/AnalysisModeToggle';
import { formatDateAPI, formatDateLong, getPreviousDay, getNextDay, getToday, isToday } from '@/lib/helpers/dateHelpers';
import { debounce } from '@/lib/helpers/editorHelpers';

interface CenterPanelProps {
  currentPage: Page | null;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page | null>>;
  onAddCalendarEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function CenterPanel({ currentPage, setCurrentPage, onAddCalendarEvent }: CenterPanelProps) {
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
  
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // NEW: Milestone 1 - Date navigation and analysis mode
  const [currentDate, setCurrentDate] = useState(getToday());
  const [analysisMode, setAnalysisMode] = useState<'manual' | 'automatic'>('manual');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

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

  // NEW: Auto-save functionality with debounce
  const autoSaveToAPI = useRef(
    debounce(async (pageTitle: string, content: string) => {
      setSaveStatus('saving');
      
      try {
        const dateStr = formatDateAPI(currentDate);
        
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
          setSaveStatus('unsaved');
          console.error('Failed to save note');
        }
      } catch (error) {
        setSaveStatus('unsaved');
        console.error('Error saving note:', error);
      }
    }, 1500)
  ).current;

  // Trigger auto-save when page content changes
  useEffect(() => {
    if (currentPage && currentPage.notes.length > 0) {
      const contentStr = currentPage.notes
        .map(note => '  '.repeat(note.indent) + note.content)
        .join('\n');
      
      setSaveStatus('unsaved');
      autoSaveToAPI(currentPage.title, contentStr);
    }
  }, [currentPage, autoSaveToAPI]);

  // NEW: Date navigation handlers
  const handlePreviousDay = () => {
    setCurrentDate(getPreviousDay(currentDate));
  };

  const handleNextDay = () => {
    setCurrentDate(getNextDay(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(getToday());
  };

  const handleAnalysisModeChange = (mode: 'manual' | 'automatic') => {
    setAnalysisMode(mode);
    console.log('Analysis mode changed to:', mode);
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

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  };

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>, noteId: string) => {
    const target = e.currentTarget;
    const content = target.textContent || '';
    
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const rect = range?.getBoundingClientRect();

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
    
    const noteType = currentPage?.notes.find(n => n.id === noteId)?.type;
    if (noteType === 'call' && content.trim().length > 0) {
      const debounceTimeout = setTimeout(() => {
        const aiSuggestions = getAICallSuggestions(content);
        
        if (!aiSuggestions.hasAgenda && aiSuggestions.suggestedAgenda) {
          setToastMessage(`💡 Suggestion: Add purpose - "${aiSuggestions.suggestedAgenda}"`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 6000);
        }
      }, 1500);
      
      return () => clearTimeout(debounceTimeout);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, note: Note) => {
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

    if (e.key === 'Escape') {
      setShowPageSearch(false);
      setShowCommandMenu(false);
    }
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

  const handlePageSelect = (pageTitle: string, noteId: string) => {
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
    
    if (['event', 'meeting', 'travel', 'birthday'].includes(command.command) && onAddCalendarEvent) {
      const today = new Date();
      let eventDate = new Date(today);
      let eventTime = 9;
      let endTime = 10;
      
      const dateMatch = newContent.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      const timeMatch = newContent.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1;
        const day = parseInt(dateMatch[2]);
        let year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000;
        
        eventDate = new Date(year, month, day);
      }
      
      if (timeMatch) {
        eventTime = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        
        if (timeMatch[3] && timeMatch[3].toLowerCase() === 'pm' && eventTime < 12) {
          eventTime += 12;
        }
        
        eventDate.setHours(eventTime, minutes);
        endTime = eventTime + 1;
      } else {
        eventDate.setHours(eventTime, 0);
        endTime = eventTime + 1;
      }
      
      const endDate = new Date(eventDate);
      endDate.setHours(endTime);
      
      onAddCalendarEvent({
        title: newContent,
        start: eventDate,
        end: endDate,
        type: command.command as CalendarEvent['type'],
        description: newContent,
        sourceNoteId: noteId
      });
    }
    
    if (command.command === 'call') {
      if (newContent === '') {
        setTimeout(() => {
          const div = editRefs.current[noteId];
          if (div) {
            div.textContent = 'Call ';
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
            
            setToastMessage('📞 Add who to call and the purpose of the call');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }
        }, 10);
      } else {
        const aiSuggestions = getAICallSuggestions(newContent);
        if (!aiSuggestions.hasAgenda && aiSuggestions.suggestedAgenda) {
          setToastMessage(`💡 Suggestion: Add purpose - "${aiSuggestions.suggestedAgenda}"`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 6000);
        }
      }
    }
    
    showSuccessToast(`Added to ${command.destination}`);
    
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

  const handlePageLinkClick = (pageTitle: string) => {
    const page = allPages.find(p => p.title === pageTitle) || getOrCreatePage(pageTitle);
    setSelectedPageForPopup(page);
    setShowPagePopup(true);
  };

  const switchToPage = (pageTitle: string) => {
    const page = getOrCreatePage(pageTitle);
    setCurrentPage(page);
    setShowPagePopup(false);
  };

  const getTypeIcon = (type: Note['type']): string => {
    const option = COMMAND_OPTIONS.find(o => o.command === type);
    return option?.icon || '•';
  };

  const getTypeColor = (type: Note['type']): string => {
    const option = COMMAND_OPTIONS.find(o => o.command === type);
    return option?.color || '#6B7280';
  };

  const renderBulletTree = (notes: Note[], level: number = 0) => {
    const tree = buildNoteTree(notes);
    
    return tree.map((note) => {
      const aiSuggestions = note.type === 'call' ? getAICallSuggestions(note.content) : null;
      
      return (
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
                if (el && el.textContent !== note.content) {
                  el.textContent = note.content;
                }
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={(e) => handleContentInput(e, note.id)}
              onKeyDown={(e) => handleKeyDown(e, note)}
              onFocus={() => setFocusedNoteId(note.id)}
              onBlur={() => {
                setTimeout(() => {
                  if (!showPageSearch && !showCommandMenu) {
                    setFocusedNoteId(null);
                  }
                }, 200);
              }}
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
            
            {note.type === 'call' && aiSuggestions && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                marginTop: '8px'
              }}>
                {aiSuggestions.importance === 'high' && (
                  <div style={{ 
                    padding: '2px 6px', 
                    fontSize: '10px', 
                    fontWeight: '600',
                    borderRadius: '4px',
                    backgroundColor: '#FEE2E2',
                    color: '#EF4444'
                  }}>
                    Urgent
                  </div>
                )}
              </div>
            )}
          </div>
          
          {note.type === 'call' && aiSuggestions && !aiSuggestions.hasAgenda && aiSuggestions.suggestedAgenda && focusedNoteId === note.id && (
            <div style={{
              marginLeft: '24px',
              marginBottom: '8px',
              padding: '8px 12px',
              backgroundColor: '#FFFBEB',
              borderLeft: '2px solid #F59E0B',
              fontSize: '12px',
              color: '#92400E',
              borderRadius: '0 4px 4px 0'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>💡 AI Suggestion</div>
              <div>Add purpose: {aiSuggestions.suggestedAgenda}</div>
              <div style={{ 
                marginTop: '6px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#D97706',
                cursor: 'pointer',
                display: 'inline-block',
                padding: '2px 6px',
                backgroundColor: 'rgba(249, 168, 37, 0.1)',
                borderRadius: '4px'
              }}
              onClick={() => {
                const div = editRefs.current[note.id];
                if (div) {
                  const currentText = div.textContent || '';
                  div.textContent = `${currentText} - ${aiSuggestions.suggestedAgenda}`;
                  updateNoteContent(note.id, div.textContent);
                }
              }}
              >
                + Add Suggestion
              </div>
            </div>
          )}

          {note.children && note.children.length > 0 && (
            <div style={{ marginTop: '0px' }}>
              {renderBulletTree(note.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredPages = allPages.filter(page => 
    page.title.toLowerCase().includes(pageSearchQuery.toLowerCase())
  );

  const filteredCommands = COMMAND_OPTIONS.filter(cmd =>
    cmd.command.toLowerCase().includes(commandSearchQuery.toLowerCase()) ||
    cmd.label.toLowerCase().includes(commandSearchQuery.toLowerCase())
  );

  const sortedPages = [...allPages].sort((a, b) => 
    b.lastModified.getTime() - a.lastModified.getTime()
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
        {/* NEW: Date Navigation Bar */}
        <div style={{
          padding: '20px 32px',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: 'white',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px', lineHeight: 1 }}>📅</div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1F2937',
                  lineHeight: 1.2
                }}>
                  {formatDateLong(currentDate)}
                </h2>
                {isToday(currentDate) && (
                  <div style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 12px',
                    background: '#FEF3C7',
                    border: '2px solid #F4B000',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#92400E',
                    letterSpacing: '0.05em'
                  }}>
                    TODAY
                  </div>
                )}
              </div>
            </div>

            {/* Date Navigation Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handlePreviousDay}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <span style={{ fontSize: '18px' }}>←</span>
                <span>Previous</span>
              </button>

              {!isToday(currentDate) && (
                <button
                  onClick={handleToday}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: '2px solid #F4B000',
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FDE68A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEF3C7';
                  }}
                >
                  Today
                </button>
              )}

              <button
                onClick={handleNextDay}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <span>Next</span>
                <span style={{ fontSize: '18px' }}>→</span>
              </button>
            </div>
          </div>

          {/* NEW: AI Analysis & Save Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <AnalysisModeToggle
              mode={analysisMode}
              onModeChange={handleAnalysisModeChange}
            />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '18px' }}>
                {saveStatus === 'saving' ? '💾' : saveStatus === 'saved' ? '✓' : '⚠️'}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: saveStatus === 'saving' ? '#3B82F6' : saveStatus === 'saved' ? '#10B981' : '#F59E0B'
              }}>
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'All changes saved' : 'Unsaved changes'}
              </span>
            </div>
          </div>
        </div>



        {/* Main Content Area - Notes */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px 32px',
          position: 'relative'
        }}>
          {currentPage && renderBulletTree(currentPage.notes)}

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
                  onClick={() => focusedNoteId && handlePageSelect(pageSearchQuery, focusedNoteId)}
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
                  onClick={() => focusedNoteId && handlePageSelect(page.title, focusedNoteId)}
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
        </div>

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
          <span><strong>🔍</strong> Search pages</span>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          backgroundColor: toastMessage.startsWith('💡') ? '#F59E0B' : '#10B981',
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
          {!toastMessage.startsWith('💡') && <span style={{ fontSize: '20px' }}>✓</span>}
          {toastMessage}
        </div>
      )}

      {/* All Pages Modal */}
      {showPagePopup && (
        <div style={{
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
        onClick={() => setShowPagePopup(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              width: '600px',
              maxHeight: '70vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
              All Pages
            </h3>

            {sortedPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
                No pages yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedPages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => {
                      switchToPage(page.title);
                      setShowPagePopup(false);
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                      📄 {page.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {page.notes.length} notes • {page.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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