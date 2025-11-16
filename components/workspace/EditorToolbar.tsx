// components/workspace/EditorToolbar.tsx
'use client';

import React from 'react';
import DateNavigation from './DateNavigation';
import AnalysisModeToggle from './AnalysisModeToggle';

interface EditorToolbarProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  analysisMode: 'manual' | 'automatic';
  onAnalysisModeChange: (mode: 'manual' | 'automatic') => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
}

export default function EditorToolbar({
  currentDate,
  onPreviousDay,
  onNextDay,
  onToday,
  analysisMode,
  onAnalysisModeChange,
  saveStatus = 'saved'
}: EditorToolbarProps) {
  
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return '💾';
      case 'saved':
        return '✓';
      case 'unsaved':
        return '⚠️';
      default:
        return '✓';
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'All changes saved';
      case 'unsaved':
        return 'Unsaved changes';
      default:
        return 'All changes saved';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return '#3B82F6';
      case 'saved':
        return '#10B981';
      case 'unsaved':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '16px'
    }}>
      {/* Top Row: Date Navigation */}
      <DateNavigation
        currentDate={currentDate}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
        onToday={onToday}
      />

      {/* Bottom Row: Analysis Mode + Save Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Left: Analysis Mode Toggle */}
        <AnalysisModeToggle
          mode={analysisMode}
          onModeChange={onAnalysisModeChange}
        />

        {/* Right: Save Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '16px' }}>
            {getSaveStatusIcon()}
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: getSaveStatusColor()
          }}>
            {getSaveStatusText()}
          </span>
        </div>
      </div>
    </div>
  );
}