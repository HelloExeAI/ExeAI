'use client';

import React, { useState, useEffect } from 'react';
import EmailPopupModal from './EmailPopupModal';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: Date;
  content: string;
  read: boolean;
}

interface EmailModuleProps {
  onAddTodo?: (content: string) => void;
}

export default function EmailModule({ onAddTodo }: EmailModuleProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchEmails();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/gmail/status');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        if (data.error) {
          setConnectionError(data.error);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmails = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const res = await fetch('/api/gmail/emails');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEmails(data.map((e: any) => ({
            ...e,
            date: new Date(e.date)
          })));
        } else if (data.error) {
          setConnectionError(data.error);
          if (data.error === 'Gmail not connected' || data.error === 'Failed to refresh token') {
            setIsConnected(false);
          }
        }
      } else {
        const errorData = await res.json();
        setConnectionError(errorData.error || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Email fetch failed:', error);
      setConnectionError('Network error while fetching emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const res = await fetch('/api/gmail/auth');
      if (res.ok) {
        const data = await res.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          setConnectionError('Failed to get authorization URL');
        }
      } else {
        setConnectionError('Failed to start Gmail authorization');
      }
    } catch (error) {
      console.error('Gmail auth failed:', error);
      setConnectionError('Failed to connect to Gmail');
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      const res = await fetch('/api/gmail/disconnect', { method: 'POST' });
      if (res.ok) {
        setIsConnected(false);
        setEmails([]);
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    setShowEmailPopup(true);

    if (!email.read) {
      try {
        await fetch('/api/gmail/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId: email.id })
        });
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
      } catch (error) {
        console.error('Mark as read failed:', error);
      }
    }
  };

  const handleReplyLater = () => {
    if (selectedEmail && onAddTodo) {
      onAddTodo(`Reply to: ${selectedEmail.from} - ${selectedEmail.subject}`);
      setShowEmailPopup(false);
    }
  };

  const unreadEmails = emails.filter(e => !e.read);

  // Not connected state
  if (!isConnected && !isLoading) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
          Connect Your Gmail
        </h3>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          Connect your Gmail account to see your emails here
        </p>
        {connectionError && (
          <p style={{ fontSize: '12px', color: '#EF4444', marginBottom: '12px' }}>
            {connectionError}
          </p>
        )}
        <button
          onClick={handleConnectGmail}
          style={{
            backgroundColor: '#F4B000',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Connect Gmail
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📧</span>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#1F2937',
              margin: 0
            }}
          >
            Gmail
          </h3>
          {unreadEmails.length > 0 && (
            <span
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '10px'
              }}
            >
              {unreadEmails.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={fetchEmails}
            disabled={isLoading}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: '4px',
              opacity: isLoading ? 0.5 : 1
            }}
            title="Refresh"
          >
            🔄
          </button>
          <button
            onClick={handleDisconnectGmail}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '4px',
              color: '#EF4444'
            }}
            title="Disconnect Gmail"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '12px'
          }}
        >
          {connectionError}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6B7280',
            fontSize: '13px'
          }}
        >
          <div style={{ marginBottom: '8px' }}>⏳</div>
          Loading emails...
        </div>
      )}

      {/* No Emails State */}
      {!isLoading && unreadEmails.length === 0 && !connectionError && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6B7280',
            fontSize: '13px'
          }}
        >
          <div style={{ marginBottom: '8px' }}>✅</div>
          No unread emails
        </div>
      )}

      {/* Email List */}
      {!isLoading && unreadEmails.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {unreadEmails.map(email => (
            <div
              key={email.id}
              onClick={() => handleEmailClick(email)}
              style={{
                padding: '10px',
                backgroundColor: '#FEF3C7',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid #FCD34D',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF9E7';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF3C7';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#1F2937',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {email.from.replace(/<.*>/, '').trim()}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginLeft: '8px' }}>
                  {email.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#4B5563',
                  marginBottom: '2px',
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {email.subject || '(No Subject)'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {email.preview}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Popup - Using Portal for correct positioning */}
      <EmailPopupModal
        isOpen={showEmailPopup}
        onClose={() => setShowEmailPopup(false)}
        email={selectedEmail}
        onReplyLater={handleReplyLater}
        onMarkUnread={() => console.log('Mark unread clicked')}
        onArchive={() => console.log('Archive clicked')}
        onDelete={() => console.log('Delete clicked')}
        onStar={() => console.log('Star clicked')}
      />
    </div>
  );
}