'use client';

import React, { useState } from 'react';
import { formatDateLong, isToday } from '@/lib/helpers/dateHelpers';

interface DateNavigationProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday?: () => void;
  onSearchToggle?: () => void;
  onPagesToggle?: () => void;
  onCalendarToggle?: () => void;
  onDateChange?: (date: Date) => void;
}

export default function DateNavigation({
  currentDate,
  onPreviousDay,
  onNextDay,
  onToday,
  onSearchToggle,
  onPagesToggle,
  onCalendarToggle,
  onDateChange
}: DateNavigationProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const years = generateYears();

  const handleMonthChange = (monthIndex: number) => {
    if (onDateChange) {
      onDateChange(new Date(currentDate.getFullYear(), monthIndex, currentDate.getDate()));
    }
    setShowMonthPicker(false);
  };

  const handleYearChange = (year: number) => {
    if (onDateChange) {
      onDateChange(new Date(year, currentDate.getMonth(), currentDate.getDate()));
    }
    setShowYearPicker(false);
  };

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

      {/* Center: Date Dropdowns Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {/* Month Picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowMonthPicker(!showMonthPicker);
              setShowYearPicker(false);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F3F4F6',
              color: '#1F2937',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getDate()}
          </button>

          {showMonthPicker && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              width: '140px'
            }}>
              {monthNames.map((month, index) => (
                <div
                  key={month}
                  onClick={() => handleMonthChange(index)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentDate.getMonth() === index ? '600' : '500',
                    color: currentDate.getMonth() === index ? '#3B82F6' : '#1F2937',
                    backgroundColor: currentDate.getMonth() === index ? '#EFF6FF' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (currentDate.getMonth() !== index) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentDate.getMonth() !== index) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Year Picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowYearPicker(!showYearPicker);
              setShowMonthPicker(false);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F3F4F6',
              color: '#1F2937',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          >
            {currentDate.getFullYear()}
          </button>

          {showYearPicker && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
              width: '100px'
            }}>
              {years.map(year => (
                <div
                  key={year}
                  onClick={() => handleYearChange(year)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentDate.getFullYear() === year ? '600' : '500',
                    color: currentDate.getFullYear() === year ? '#3B82F6' : '#1F2937',
                    backgroundColor: currentDate.getFullYear() === year ? '#EFF6FF' : 'transparent',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (currentDate.getFullYear() !== year) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentDate.getFullYear() !== year) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>

        {isToday(currentDate) && (
          <span style={{
            padding: '3px 10px',
            background: '#FEF3C7',
            border: '1px solid #F4B000',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '700',
            color: '#92400E',
            letterSpacing: '0.05em',
            marginLeft: '8px'
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
          onClick={() => onCalendarToggle?.()}
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
          onClick={() => onSearchToggle?.()}
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
          onClick={() => onPagesToggle?.()}
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