'use client';

import React from 'react';
import EmailModule from '@/components/dashboard/EmailModule';
import MessengerModule from './MessengerModule';
import { Note } from '@/app/types';

interface RightSidebarProps {
  onAddTodo?: (todo: Omit<Note, 'id' | 'createdAt'>) => void; 
}

export default function RightSidebar({ 
  onAddTodo
}: RightSidebarProps) {
  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      backgroundColor: '#FAFAFA', 
      padding: '12px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Email Module */}
        <EmailModule 
          onAddTodo={onAddTodo} 
        />
        
        {/* Messenger Module */}
        <MessengerModule 
          onAddTodo={onAddTodo} 
        />
      </div>
    </div>
  );
}