'use client';

import React from 'react';
import { formatDateLong, isToday } from '@/lib/helpers/dateHelpers';

interface DateNavigationProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onSearchToggle: () => void;
  onPagesToggle: () => void;
  onCalendarToggle: () => void;
}

export default function DateNavigation({
  currentDate,
  onPreviousDay,
  onNextDay,
  onSearchToggle,
  onPagesToggle,
  onCalendarToggle
}: DateNavigationProps) {
  return (
    <div style={{
      height: '60px',
      padding: '0 32px',
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      {/* Left: Previous Arrow */}
      <button
        onClick={onPreviousDay}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          background: 'white',
          color: '#6B7280',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FEF3C7';
          e.currentTarget.style.borderColor = '#F4B000';
          e.currentTarget.style.color = '#92400E';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.color = '#6B7280';
        }}
      >
        ←
      </button>

      {/* Center: Date Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#1F2937',
          letterSpacing: '-0.01em'
        }}>
          {formatDateLong(currentDate)}
        </h2>
        {isToday(currentDate) && (
          <span style={{
            padding: '3px 10px',
            background: '#FEF3C7',
            border: '1px solid #F4B000',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#92400E',
            letterSpacing: '0.05em'
          }}>
            TODAY
          </span>
        )}
      </div>

      {/* Right: Next Arrow + Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onNextDay}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#6B7280',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEF3C7';
            e.currentTarget.style.borderColor = '#F4B000';
            e.currentTarget.style.color = '#92400E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          →
        </button>

        {/* Calendar Icon */}
        <button
          onClick={onCalendarToggle}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#6B7280',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEF3C7';
            e.currentTarget.style.borderColor = '#F4B000';
            e.currentTarget.style.color = '#92400E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          📅
        </button>

        {/* Search Icon */}
        <button
          onClick={onSearchToggle}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#6B7280',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEF3C7';
            e.currentTarget.style.borderColor = '#F4B000';
            e.currentTarget.style.color = '#92400E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          🔍
        </button>

        {/* Pages Icon */}
        <button
          onClick={onPagesToggle}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#6B7280',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEF3C7';
            e.currentTarget.style.borderColor = '#F4B000';
            e.currentTarget.style.color = '#92400E';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          📄
        </button>
      </div>
    </div>
  );
}