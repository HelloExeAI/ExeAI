// components/dashboard/RightSidebar.tsx
'use client';

import React from 'react';
import TodoList from './TodoList';
import EmailModule from '@/components/dashboard/EmailModule';
import MessengerModule from './MessengerModule';
import { Note } from '../../app/types';

interface RightSidebarProps {
  todoItems: Note[];
  onCompleteTodo: (noteId: string, completed: boolean) => void;
  onDeleteTodo?: (noteId: string) => void;
  onAddTodo?: (content: string) => void; 
}

export default function RightSidebar({ 
  todoItems, 
  onCompleteTodo, 
  onDeleteTodo,
  onAddTodo
}: RightSidebarProps) {
  return (
    <div style={{ 
      height: '100%', 
      padding: '8px',
      backgroundColor: '#FAFAFA', 
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
        {/* TodoList Module */}
        <div>
          <TodoList 
            todoItems={todoItems} 
            onCompleteTodo={onCompleteTodo}
            onDeleteTodo={onDeleteTodo}
            onAddTodo={onAddTodo}
          />
        </div>
        
        {/* Email Module */}
        <div>
          <EmailModule 
            onAddTodo={onAddTodo} 
          />
        </div>
        
        {/* Messenger Module */}
        <div>
          <MessengerModule 
            onAddTodo={onAddTodo} 
          />
        </div>
      </div>
    </div>
  );
}