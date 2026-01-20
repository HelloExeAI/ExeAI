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
  // Auto-focus removed to prevent fighting with parent state
  // Parent component (CenterPanel) manages initial focus via focusedNoteId
  useEffect(() => {
    // Only focus if specifically requested and valid
    if (focusedNoteId && editRefs.current[focusedNoteId]) {
      const el = editRefs.current[focusedNoteId];
      if (document.activeElement !== el) {
        // We let the parent handle the actual focus call via its own effect,
        // or we can do it here, but CenterPanel already has a focus effect.
        // So this effect is strictly for "first load" if we wanted it, but
        // CenterPanel handles that too.
        // Leaving empty or removing reduces conflict.
      }
    }
  }, [focusedNoteId, editRefs]);

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