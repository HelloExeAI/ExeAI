// src/components/dashboard/EmailPopupModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Email } from '@/app/types';

interface EmailPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
  onReplyLater: () => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onStar: () => void;
}

export default function EmailPopupModal({
  isOpen,
  onClose,
  email,
  onReplyLater,
  onMarkUnread,
  onArchive,
  onDelete,
  onStar
}: EmailPopupModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !email || !mounted) return null;

  // Open email client for Reply Now
  const handleReplyNow = () => {
    const mailtoLink = `mailto:${email.fromEmail || ''}?subject=Re: ${encodeURIComponent(email.subject)}`;
    window.open(mailtoLink, '_blank');
  };

  // Open email client for Forward
  const handleForward = () => {
    const mailtoLink = `mailto:?subject=Fwd: ${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.content)}`;
    window.open(mailtoLink, '_blank');
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 8px 0'
            }}>
              {email.subject}
            </h2>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
              <strong>From:</strong> {email.from} {email.fromEmail && `<${email.fromEmail}>`}
            </div>
            <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
              {email.date.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '16px'
            }}
          >
            ×
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          gap: '8px',
          backgroundColor: '#F9FAFB'
        }}>
          <button
            onClick={onMarkUnread}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              color: '#6B7280',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            👁️ Mark Unread
          </button>
          <button
            onClick={onStar}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              color: email.starred ? '#F4B000' : '#6B7280',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {email.starred ? '⭐' : '☆'} {email.starred ? 'Starred' : 'Star'}
          </button>
          <button
            onClick={onArchive}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              color: '#6B7280',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📁 Archive
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #FEE2E2',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🗑️ Delete
          </button>
        </div>

        {/* Email Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: 'white'
        }}>
          {/* Attachments (if any) */}
          {email.attachments && email.attachments.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6B7280',
                marginBottom: '8px'
              }}>
                📎 Attachments ({email.attachments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {email.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    style={{
                      fontSize: '13px',
                      color: '#3B82F6',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    📄 {attachment}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Body */}
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#1F2937'
            }}
            dangerouslySetInnerHTML={{ __html: email.content }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          gap: '12px',
          backgroundColor: 'white'
        }}>
          <button
            onClick={handleReplyNow}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3B82F6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ✉️ Reply Now
          </button>
          <button
            onClick={onReplyLater}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F4B000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ⏰ Reply Later
          </button>
          <button
            onClick={handleForward}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: 'white',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            ➡️ Forward
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}