'use client';

interface SuccessToastProps {
  visible: boolean;
  message: string;
}

export default function SuccessToast({ visible, message }: SuccessToastProps) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      backgroundColor: '#10B981',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease'
    }}>
      <span style={{ fontSize: '20px' }}>✓</span>
      {message}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}