// components/workspace/DateNavigation.tsx
'use client';

import React from 'react';
import { formatDateLong, isToday } from '@/lib/helpers/dateHelpers';

interface DateNavigationProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export default function DateNavigation({
  currentDate,
  onPreviousDay,
  onNextDay,
  onToday
}: DateNavigationProps) {
  const isTodayDate = isToday(currentDate);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '16px'
    }}>
      {/* Left: Date Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          fontSize: '32px',
          lineHeight: 1
        }}>
          📅
        </div>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#1F2937',
            lineHeight: 1.2
          }}>
            {formatDateLong(currentDate)}
          </h2>
          {isTodayDate && (
            <div style={{
              display: 'inline-block',
              marginTop: '6px',
              padding: '3px 10px',
              background: '#FEF3C7',
              border: '1px solid #F4B000',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#92400E',
              letterSpacing: '0.05em'
            }}>
              TODAY
            </div>
          )}
        </div>
      </div>

      {/* Right: Navigation Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        {/* Previous Day Button */}
        <button
          onClick={onPreviousDay}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
          title="Previous day"
        >
          <span style={{ fontSize: '16px' }}>←</span>
          <span>Previous</span>
        </button>

        {/* Today Button */}
        {!isTodayDate && (
          <button
            onClick={onToday}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '2px solid #F4B000',
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FDE68A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FEF3C7';
            }}
            title="Go to today"
          >
            Today
          </button>
        )}

        {/* Next Day Button */}
        <button
          onClick={onNextDay}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#D1D5DB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
          title="Next day"
        >
          <span>Next</span>
          <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </div>
    </div>
  );
}