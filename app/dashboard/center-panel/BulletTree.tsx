'use client';

import { Note } from '../types/notes';
import { buildNoteTree } from '../utils/noteHelpers';
import BulletItem from './BulletItem';

interface BulletTreeProps {
  notes: Note[];
  level?: number;
  focusedNoteId: string | null;
  onFocus: (noteId: string) => void;
  onBlur: () => void;
  onInput: (e: React.FormEvent<HTMLDivElement>, noteId: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, note: Note) => void;
  editRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  showPageSearch: boolean;
  showCommandMenu: boolean;
}

export default function BulletTree({
  notes,
  level = 0,
  focusedNoteId,
  onFocus,
  onBlur,
  onInput,
  onKeyDown,
  editRefs,
  showPageSearch,
  showCommandMenu
}: BulletTreeProps) {
  const tree = buildNoteTree(notes);
  
  return (
    <>
      {tree.map((note) => (
        <div key={note.id} style={{ marginLeft: `${level * 28}px` }}>
          <BulletItem
            note={note}
            focusedNoteId={focusedNoteId}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            onKeyDown={onKeyDown}
            editRef={(el) => { 
              editRefs.current[note.id] = el;
              if (el && el.textContent !== note.content) {
                el.textContent = note.content;
              }
            }}
            showPageSearch={showPageSearch}
            showCommandMenu={showCommandMenu}
          />

          {note.children && note.children.length > 0 && (
            <div style={{ marginTop: '0px' }}>
              <BulletTree
                notes={note.children}
                level={level + 1}
                focusedNoteId={focusedNoteId}
                onFocus={onFocus}
                onBlur={onBlur}
                onInput={onInput}
                onKeyDown={onKeyDown}
                editRefs={editRefs}
                showPageSearch={showPageSearch}
                showCommandMenu={showCommandMenu}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}