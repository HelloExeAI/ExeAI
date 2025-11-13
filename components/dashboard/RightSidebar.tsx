'use client';

import React from 'react';
import TodoList from './TodoList';
import { Note } from '../../app/types';

interface RightSidebarProps {
  todoItems: Note[];
  onCompleteTodo: (noteId: string, completed: boolean) => void;
  onDeleteTodo: (noteId: string) => void;
}

export default function RightSidebar({ 
  todoItems, 
  onCompleteTodo, 
  onDeleteTodo 
}: RightSidebarProps) {
  return (
    <div style={{ 
      height: '100%', 
      borderLeft: '1px solid rgba(229, 231, 235, 0.5)', 
      width: '160px', // Significantly reduced width from 240px to 160px
      maxWidth: '160px', // Enforce maximum width
      flexShrink: 0, // Prevent shrinking
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)',
      overflow: 'hidden', // Prevent content from expanding the sidebar
    }}>
      <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* TodoList Module */}
        <div style={{ flex: 1 }}>
          <TodoList 
            todoItems={todoItems} 
            onCompleteTodo={onCompleteTodo}
            onDeleteTodo={onDeleteTodo}
          />
        </div>
        
        {/* Future Communication Module Placeholders - hidden for now */}
        {/* Hidden to save space */}
      </div>
    </div>
  );
}