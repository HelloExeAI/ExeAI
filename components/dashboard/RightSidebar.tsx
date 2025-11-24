'use client';

import EmailModule from '@/components/dashboard/EmailModule';
import MessengerModule from '@/components/dashboard/MessengerModule';

export interface RightSidebarProps {
  onAddTodo?: (content: string) => void;
}

export default function RightSidebar({ onAddTodo }: RightSidebarProps) {
  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#FAFAFA',
        padding: '12px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <EmailModule onAddTodo={onAddTodo} />
        <MessengerModule onAddTodo={onAddTodo} />
      </div>
    </div>
  );
}
