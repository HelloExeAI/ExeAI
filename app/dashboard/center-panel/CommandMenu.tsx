'use client';

import { CommandOption } from '../types/notes';

interface CommandMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  filteredCommands: CommandOption[];
  onCommandSelect: (command: CommandOption) => void;
}

export default function CommandMenu({
  visible,
  position,
  filteredCommands,
  onCommandSelect
}: CommandMenuProps) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxHeight: '400px',
      overflowY: 'auto',
      minWidth: '320px'
    }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #E5E7EB',
        fontSize: '11px',
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        ⚡ Quick Commands
      </div>
      
      {filteredCommands.map(cmd => (
        <div
          key={cmd.command}
          onClick={() => onCommandSelect(cmd)}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'start',
            gap: '12px',
            transition: 'all 0.2s',
            borderBottom: '1px solid #F3F4F6'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ 
            fontSize: '20px',
            color: cmd.color,
            flexShrink: 0
          }}>
            {cmd.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1F2937',
              marginBottom: '2px'
            }}>
              /{cmd.command}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6B7280',
              marginBottom: '4px'
            }}>
              {cmd.description}
            </div>
            <div style={{ 
              fontSize: '10px',
              color: cmd.color,
              backgroundColor: cmd.color + '15',
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-block',
              fontWeight: '600'
            }}>
              → {cmd.destination}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}