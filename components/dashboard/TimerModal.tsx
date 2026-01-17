// src/components/dashboard/TimerModal.tsx
'use client';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDuration?: number; // in seconds
  soundEnabled?: boolean;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetDuration: (duration: number) => void;
}

export default function TimerModal({
  isOpen,
  onClose,
  minutes,
  seconds,
  isRunning,
  onStart,
  onPause,
  onReset,
  onSetDuration
}: TimerModalProps) {

  const totalSeconds = minutes * 60 + seconds;

  const formatTimerDisplay = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
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
            {formatTimerDisplay(totalSeconds)}
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
                  onSetDuration(mins * 60);
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
                if (isRunning) {
                  onPause();
                } else if (totalSeconds > 0) {
                  onStart();
                }
              }}
              disabled={totalSeconds === 0}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: totalSeconds === 0 ? '#E5E7EB' : (isRunning ? '#EF4444' : '#10B981'),
                color: 'white',
                cursor: totalSeconds === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.2s',
                opacity: totalSeconds === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (totalSeconds > 0) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              onClick={onReset}
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