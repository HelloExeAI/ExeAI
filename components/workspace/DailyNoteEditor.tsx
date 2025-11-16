// components/workspace/DailyNoteEditor.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce, getWordCount, getCharCount, getLineCount } from '@/lib/helpers/editorHelpers';
import { formatDateAPI } from '@/lib/helpers/dateHelpers';

interface DailyNoteEditorProps {
  date: Date;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
  analysisMode: 'manual' | 'automatic';
}

export default function DailyNoteEditor({
  date,
  initialContent = '',
  onContentChange,
  onSaveStatusChange,
  analysisMode
}: DailyNoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update content when date changes or initial content changes
  useEffect(() => {
    setContent(initialContent);
    updateStats(initialContent);
  }, [date, initialContent]);

  // Update statistics
  const updateStats = (text: string) => {
    setStats({
      words: getWordCount(text),
      chars: getCharCount(text),
      lines: getLineCount(text)
    });
  };

  // Auto-save function
  const autoSave = useCallback(
    debounce(async (contentToSave: string, dateToSave: Date) => {
      setSaveStatus('saving');
      if (onSaveStatusChange) onSaveStatusChange('saving');

      try {
        const response = await fetch('/api/daily-note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: formatDateAPI(dateToSave),
            content: contentToSave,
          }),
        });

        if (response.ok) {
          setSaveStatus('saved');
          if (onSaveStatusChange) onSaveStatusChange('saved');
        } else {
          setSaveStatus('unsaved');
          if (onSaveStatusChange) onSaveStatusChange('unsaved');
          console.error('Failed to save note');
        }
      } catch (error) {
        setSaveStatus('unsaved');
        if (onSaveStatusChange) onSaveStatusChange('unsaved');
        console.error('Error saving note:', error);
      }
    }, 1000), // 1 second delay
    []
  );

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateStats(newContent);
    setSaveStatus('unsaved');
    if (onSaveStatusChange) onSaveStatusChange('unsaved');
    if (onContentChange) onContentChange(newContent);

    // Trigger auto-save
    autoSave(newContent, date);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + S to manually save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      autoSave.cancel(); // Cancel pending auto-save
      autoSave(content, date); // Save immediately
    }

    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = 
        content.substring(0, start) + 
        '  ' + // 2 spaces
        content.substring(end);
      
      setContent(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      {/* Editor Area */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Start writing your daily note...

💡 Tips:
• Press Enter to start a new line
• Use Tab for indentation
• Type / for commands (coming soon)
• Write naturally - AI will help organize"
          style={{
            width: '100%',
            minHeight: '400px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#1F2937',
            background: 'transparent',
            overflow: 'hidden'
          }}
          autoFocus
        />
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        fontSize: '13px',
        color: '#6B7280'
      }}>
        {/* Left: Stats */}
        <div style={{
          display: 'flex',
          gap: '20px'
        }}>
          <div>
            <span style={{ fontWeight: '600' }}>{stats.words}</span> words
          </div>
          <div>
            <span style={{ fontWeight: '600' }}>{stats.chars}</span> characters
          </div>
          <div>
            <span style={{ fontWeight: '600' }}>{stats.lines}</span> lines
          </div>
        </div>

        {/* Right: Analysis Mode Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {analysisMode === 'automatic' && (
            <>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10B981',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
              <span style={{ fontWeight: '600', color: '#10B981' }}>
                AI analyzing in real-time
              </span>
            </>
          )}
          {analysisMode === 'manual' && (
            <span style={{ fontWeight: '500' }}>
              Type <code style={{ 
                background: '#E5E7EB', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>/analyse</code> to trigger AI analysis
            </span>
          )}
        </div>
      </div>

      {/* Pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}