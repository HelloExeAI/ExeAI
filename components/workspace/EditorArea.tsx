'use client';

import React, { useEffect } from 'react';
import { Note } from '@/app/dashboard/types';

interface EditorAreaProps {
  notes: Note[];
  focusedNoteId: string | null;
  editRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  onContentInput: (e: React.FormEvent<HTMLDivElement>, noteId: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, note: Note) => void;
  onFocus: (noteId: string) => void;
  onBlur: () => void;
  renderBulletTree: (notes: Note[], level?: number) => React.ReactNode;
}

export default function EditorArea({
  notes,
  focusedNoteId,
  editRefs,
  onContentInput,
  onKeyDown,
  onFocus,
  onBlur,
  renderBulletTree
}: EditorAreaProps) {
  // Auto-focus first note when component mounts
  useEffect(() => {
    if (notes.length > 0 && !focusedNoteId) {
      const firstNote = notes[0];
      const firstDiv = editRefs.current[firstNote.id];
      if (firstDiv) {
        setTimeout(() => {
          firstDiv.focus();
        }, 100);
      }
    }
  }, [notes, focusedNoteId, editRefs]);

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '32px 48px',
      position: 'relative'
    }}>
      {renderBulletTree(notes)}
    </div>
  );
}