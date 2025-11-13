'use client';

import { Page } from '../types/notes';

interface PageSearchMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  searchQuery: string;
  filteredPages: Page[];
  onPageSelect: (pageTitle: string) => void;
}

export default function PageSearchMenu({
  visible,
  position,
  searchQuery,
  filteredPages,
  onPageSelect
}: PageSearchMenuProps) {
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
      maxHeight: '300px',
      overflowY: 'auto',
      minWidth: '280px'
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
        🔗 Link to Page
      </div>
      
      {filteredPages.length === 0 && searchQuery && (
        <div
          onClick={() => onPageSelect(searchQuery)}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>➕</span>
          <div>
            <div style={{ fontWeight: '600' }}>Create "{searchQuery}"</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>New page</div>
          </div>
        </div>
      )}
      
      {filteredPages.slice(0, 8).map(page => (
        <div
          key={page.id}
          onClick={() => onPageSelect(page.title)}
          style={{
            padding: '14px 16px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: '#1F2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            borderBottom: '1px solid #F3F4F6'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600' }}>{page.title}</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              {page.notes.length} notes
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}