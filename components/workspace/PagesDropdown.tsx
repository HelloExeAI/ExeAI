'use client';

import React, { useEffect, useRef } from 'react';
import { Page } from '@/app/dashboard/types';

interface PagesDropdownProps {
  isOpen: boolean;
  pages: Page[];
  currentPage: Page | null;
  onPageSelect: (page: Page) => void;
  onClose: () => void;
  onCreatePage: (title: string) => void;
}

export default function PagesDropdown({
  isOpen,
  pages,
  currentPage,
  onPageSelect,
  onClose,
  onCreatePage
}: PagesDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sort pages: Shopping first, then by last modified
  const sortedPages = [...pages].sort((a, b) => {
    if (a.title === 'Shopping') return -1;
    if (b.title === 'Shopping') return 1;
    return b.lastModified.getTime() - a.lastModified.getTime();
  });

  // Separate daily pages from custom pages
  const dailyPages = sortedPages.filter(p => /^[A-Za-z]+ \d{1,2}, \d{4}$/.test(p.title));
  const customPages = sortedPages.filter(p => !/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(p.title));

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: '70px',
        right: '32px',
        width: '320px',
        maxHeight: '500px',
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '700',
          color: '#1F2937'
        }}>
          📚 All Pages
        </h3>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0 4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        {/* Custom Pages Section */}
        {customPages.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 12px'
            }}>
              Custom Pages
            </div>
            {customPages.map((page) => (
              <div
                key={page.id}
                onClick={() => {
                  onPageSelect(page);
                  onClose();
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: currentPage?.id === page.id ? '#FEF3C7' : 'transparent',
                  border: currentPage?.id === page.id ? '1px solid #F4B000' : '1px solid transparent',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage?.id !== page.id) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage?.id !== page.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{page.title === 'Shopping' ? '🛒' : '📄'}</span>
                  {page.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {page.notes.length} notes
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Daily Pages Section */}
        {dailyPages.length > 0 && (
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 12px'
            }}>
              Daily Notes
            </div>
            {dailyPages.slice(0, 10).map((page) => (
              <div
                key={page.id}
                onClick={() => {
                  onPageSelect(page);
                  onClose();
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: currentPage?.id === page.id ? '#FEF3C7' : 'transparent',
                  border: currentPage?.id === page.id ? '1px solid #F4B000' : '1px solid transparent',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (currentPage?.id !== page.id) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage?.id !== page.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1F2937',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📅</span>
                  {page.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {page.notes.length} notes
                </div>
              </div>
            ))}
          </div>
        )}

        {pages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9CA3AF'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
            No pages yet
          </div>
        )}
      </div>

      {/* Footer: Create New Page */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB'
      }}>
        <button
          onClick={() => {
            const pageName = prompt('Enter page name:');
            if (pageName && pageName.trim()) {
              onCreatePage(pageName.trim());
              onClose();
            }
          }}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #F4B000',
            background: '#FEF3C7',
            color: '#92400E',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FDE68A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FEF3C7';
          }}
        >
          <span style={{ fontSize: '16px' }}>➕</span>
          Create New Page
        </button>
      </div>
    </div>
  );
}