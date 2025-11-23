'use client';

import React from 'react';
import EmailModule from '@/components/dashboard/EmailModule';
import MessengerModule from './MessengerModule';

interface RightSidebarProps {
  onAddTodo?: (content: string) => void;
}

export default function RightSidebar({ onAddTodo }: RightSidebarProps) {
  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      backgroundColor: '#FAFAFA', 
      padding: '12px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Email Module */}
        {/* <EmailModule 
        onAddTodo={(content: string) => onAddTodo?.(content)} 
        /> */}
        
        {/* Messenger Module */}
        {/* <MessengerModule 
          onAddTodo={(todo: Note) => onAddTodo?.(todo)} 
        /> */}
      </div>
    </div>
  );
}