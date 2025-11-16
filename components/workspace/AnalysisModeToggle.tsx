// components/workspace/AnalysisModeToggle.tsx
'use client';

import React from 'react';

interface AnalysisModeToggleProps {
  mode: 'manual' | 'automatic';
  onModeChange: (mode: 'manual' | 'automatic') => void;
}

export default function AnalysisModeToggle({ mode, onModeChange }: AnalysisModeToggleProps) {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {/* Label */}
      <div style={{ 
        fontSize: '13px', 
        fontWeight: '600', 
        color: '#6B7280',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>🤖</span>
        <span>AI Analysis:</span>
      </div>

      {/* Toggle Switch */}
      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Manual Button */}
        <button
          onClick={() => onModeChange('manual')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: mode === 'manual' ? '2px solid #F4B000' : '1px solid #E5E7EB',
            background: mode === 'manual' ? '#FEF3C7' : 'white',
            color: mode === 'manual' ? '#92400E' : '#6B7280',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Manual
        </button>

        {/* Automatic Button */}
        <button
          onClick={() => onModeChange('automatic')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: mode === 'automatic' ? '2px solid #F4B000' : '1px solid #E5E7EB',
            background: mode === 'automatic' ? '#FEF3C7' : 'white',
            color: mode === 'automatic' ? '#92400E' : '#6B7280',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Automatic
        </button>
      </div>

      {/* Info Icon with Tooltip */}
      <div 
        style={{ 
          position: 'relative',
          cursor: 'help'
        }}
        title={
          mode === 'manual' 
            ? 'Use /analyse command to trigger AI analysis' 
            : 'AI automatically analyzes your writing in real-time'
        }
      >
        <span style={{ fontSize: '16px', color: '#9CA3AF' }}>ℹ️</span>
      </div>

      {/* Status Indicator */}
      <div style={{
        marginLeft: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: mode === 'automatic' ? '#10B981' : '#9CA3AF',
          animation: mode === 'automatic' ? 'pulse 2s ease-in-out infinite' : 'none'
        }} />
        <span style={{
          fontSize: '12px',
          color: '#6B7280',
          fontWeight: '500'
        }}>
          {mode === 'automatic' ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}