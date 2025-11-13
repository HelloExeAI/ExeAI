'use client';

import { Note } from '../types/notes';
import { getTypeIcon, getTypeColor } from '../utils/noteHelpers';

interface BulletItemProps {
  note: Note;
  focusedNoteId: string | null;
  onFocus: (noteId: string) => void;
  onBlur: () => void;
  onInput: (e: React.FormEvent<HTMLDivElement>, noteId: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, note: Note) => void;
  editRef: (el: HTMLDivElement | null) => void;
  showPageSearch: boolean;
  showCommandMenu: boolean;
}

export default function BulletItem({
  note,
  focusedNoteId,
  onFocus,
  onBlur,
  onInput,
  onKeyDown,
  editRef,
  showPageSearch,
  showCommandMenu
}: BulletItemProps) {
  return (
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
        ref={editRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={(e) => onInput(e, note.id)}
        onKeyDown={(e) => onKeyDown(e, note)}
        onFocus={() => onFocus(note.id)}
        onBlur={() => {
          setTimeout(() => {
            if (!showPageSearch && !showCommandMenu) {
              onBlur();
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
    </div>
  );
}