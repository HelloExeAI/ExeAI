'use client';

import React, { useEffect, useRef } from 'react';
import { Page } from '@/app/dashboard/types';

interface SearchOverlayProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  searchResults: Page[];
  onPageSelect: (page: Page) => void;
}

export default function SearchOverlay({
  isOpen,
  searchQuery,
  onSearchChange,
  onClose,
  searchResults,
  onPageSelect
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '120px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '600px',
          maxHeight: '70vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#F9FAFB',
            border: '2px solid #F4B000',
            borderRadius: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search all pages and notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '16px',
                color: '#1F2937',
                fontWeight: '500'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 4px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}>
          {searchQuery === '' ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9CA3AF'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔎</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Search Your Workspace
              </div>
              <div style={{ fontSize: '14px' }}>
                Type to search across all pages and daily notes
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#9CA3AF'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                No results found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try searching with different keywords
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {searchResults.map((page) => (
                <div
                  key={page.id}
                  onClick={() => {
                    onPageSelect(page);
                    onClose();
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF3C7';
                    e.currentTarget.style.borderColor = '#F4B000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📄</span>
                    {page.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    {page.notes.length} notes • Last modified {page.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {/* Show snippet of first note */}
                  {page.notes.length > 0 && page.notes[0].content && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#9CA3AF',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {page.notes[0].content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          fontSize: '12px',
          color: '#6B7280',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span><strong>Enter</strong> to open</span>
          <span><strong>Esc</strong> to close</span>
        </div>
      </div>
    </div>
  );
}