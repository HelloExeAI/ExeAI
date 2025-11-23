'use client';

import React, { useState, useEffect } from 'react';

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
      const res = await fetch('/api/settings');
      if (res.ok) {
        const settings = await res.json();
        setIsConnected(settings.emailGmailConnected || settings.emailOutlookConnected);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsLoading(false);
    }
  };
  
  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/emails');
      if (res.ok) {
        const data = await res.json();
        setEmails(data.map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
    } catch (error) {
      console.error('Email fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    setShowEmailPopup(true);
    
    if (!email.read) {
      try {
        await fetch(`/api/emails/${email.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
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
          Connect Your Email
        </h3>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          Connect Gmail or Outlook to see your emails here
        </p>
        <button
          onClick={() => window.location.href = '/dashboard/settings?tab=email'}
          style={{
            backgroundColor: '#F4B000',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Go to Settings
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
            Email
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
      </div>

      {isLoading && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6B7280',
            fontSize: '13px'
          }}
        >
          Loading emails...
        </div>
      )}

      {!isLoading && unreadEmails.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6B7280',
            fontSize: '13px'
          }}
        >
          No unread emails
        </div>
      )}

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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF3C7';
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
                    flex: 1
                  }}
                >
                  {email.from}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  {email.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#4B5563',
                  marginBottom: '2px',
                  fontWeight: '600'
                }}
              >
                {email.subject}
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

      {showEmailPopup && selectedEmail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E5E7EB'
              }}
            >
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: '8px'
                }}
              >
                {selectedEmail.subject}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#4B5563'
                    }}
                  >
                    From: {selectedEmail.from}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      marginTop: '2px'
                    }}
                  >
                    {selectedEmail.date.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
            </div>
            
            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              <button
                onClick={handleReplyLater}
                style={{
                  backgroundColor: '#F4B000',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ⏰ Reply Later
              </button>
              <button
                onClick={() => setShowEmailPopup(false)}
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}