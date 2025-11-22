// src/components/dashboard/TimerModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDuration?: number; // in seconds
  soundEnabled?: boolean;
}

export default function TimerModal({ 
  isOpen, 
  onClose, 
  defaultDuration = 300,
  soundEnabled = true 
}: TimerModalProps) {
  const [timerSeconds, setTimerSeconds] = useState(defaultDuration);
  const [timerRunning, setTimerRunning] = useState(false);

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimerSeconds(defaultDuration);
      setTimerRunning(false);
    }
  }, [isOpen, defaultDuration]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            
            // Play sound if enabled
            if (soundEnabled) {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUajk77RgGwU7k9n0yXcoBC15yO/glEILE2K39OyrUxIIRZ/h8rltIQUrhM/y2Yk2CBxqvvDknE4MDlGo5O+zYBoFPJTa9Ml3JwQtesjv4JRCCxNit/Tsq1MSCEWf4fK5bSEFK4TP8tmJNggcar7w5JxODA5RqOTvs2AaBTyU2vTJdycELXrI7+CUQgsUYrj07KtTEghFn+HyuW0hBSuEz/LZiTYIHGq+8OScTgwOUajk77NgGgU8lNr0yXcnBC16yO/glEILFGK49OyrUxIIRZ/h8rltIQUrhM/y2Yk2CBxqvvDknE4MDlGo5O+zYBoFPJTa9Ml3JwQtesjv4JRCCxRiuPTsq1MSCEWf4fK5bSEFK4TP8tmJNggcar7w5JxODA5RqOTvs2AaBTyU2vTJdycELXrI7+CUQgsUYrj07KtTEghFn+HyuW0hBSuEz/LZiTYIHGq+8OScTgwOUajk77NgGgU8lNr0yXcnBC16yO/glEILFGK49OyrUxIIRZ/h8rltIQUrhM/y2Yk2CBxqvvDknE4MDlGo5O+zYBoFPJTa9Ml3JwQtesjv4JRCCxRiuPTsq1');
              audio.play().catch(e => console.log('Audio play failed:', e));
            }
            
            // Show notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Complete! ⏰', {
                body: 'Your timer has finished!',
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, soundEnabled]);

  const formatTimerDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          width: '340px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 10001
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1F2937' 
          }}>
            ⏱️ Timer
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '28px', 
              cursor: 'pointer', 
              color: '#6B7280', 
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
        
        {/* Timer Display */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '56px', 
            fontWeight: '300', 
            color: '#1F2937', 
            marginBottom: '24px', 
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}>
            {formatTimerDisplay(timerSeconds)}
          </div>
          
          {/* Quick Timer Buttons */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px', 
            marginBottom: '20px' 
          }}>
            {[1, 5, 10, 15, 30, 60].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  setTimerSeconds(mins * 60);
                  setTimerRunning(false);
                }}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '2px solid #E5E7EB',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1F2937',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F4B000';
                  e.currentTarget.style.backgroundColor = '#FEF3C7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                if (timerSeconds > 0) {
                  setTimerRunning(!timerRunning);
                }
              }}
              disabled={timerSeconds === 0}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: timerSeconds === 0 ? '#E5E7EB' : (timerRunning ? '#EF4444' : '#10B981'),
                color: 'white',
                cursor: timerSeconds === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.2s',
                opacity: timerSeconds === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (timerSeconds > 0) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {timerRunning ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              onClick={() => {
                setTimerSeconds(defaultDuration);
                setTimerRunning(false);
              }}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '10px',
                border: '2px solid #E5E7EB',
                backgroundColor: 'white',
                color: '#1F2937',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}