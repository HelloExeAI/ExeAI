'use client';

import React, { useState, useEffect } from 'react';
import Portal from '@/components/ui/Portal';

interface Message {
  id: string;
  platform: 'whatsapp' | 'slack';
  from: string;
  preview: string;
  content: string;
  date: Date;
  read: boolean;
}

interface MessengerModuleProps {
  onAddTodo?: (content: string) => void;
}

export default function MessengerModule({ onAddTodo }: MessengerModuleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchMessages();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const settings = await res.json();
        setIsConnected(settings.messageWhatsAppConnected || settings.messageSlackConnected);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map((m: any) => ({ ...m, date: new Date(m.date) })));
      }
    } catch (error) {
      console.error('Message fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessagePopup(true);

    if (!message.read) {
      try {
        await fetch(`/api/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        });
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m));
      } catch (error) {
        console.error('Mark as read failed:', error);
      }
    }
  };

  const handleReplyLater = () => {
    if (selectedMessage && onAddTodo) {
      onAddTodo(`Reply to ${selectedMessage.from} (${selectedMessage.platform})`);
      setShowMessagePopup(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'whatsapp' ? '#25D366' : '#4A154B';
  };

  const getPlatformBgColor = (platform: string) => {
    return platform === 'whatsapp' ? '#E8F5E9' : '#F3E5F5';
  };

  const unreadMessages = messages.filter(m => !m.read);

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
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
          Connect Your Messages
        </h3>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          Connect WhatsApp or Slack to see your messages here
        </p>
        <button
          onClick={() => window.location.href = '/dashboard/settings?tab=messages'}
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
          <span style={{ fontSize: '18px' }}>💬</span>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#1F2937',
              margin: 0
            }}
          >
            Messages
          </h3>
          {unreadMessages.length > 0 && (
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
              {unreadMessages.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchMessages}
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
          Loading messages...
        </div>
      )}

      {!isLoading && unreadMessages.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6B7280',
            fontSize: '13px'
          }}
        >
          No unread messages
        </div>
      )}

      {!isLoading && unreadMessages.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {unreadMessages.map(message => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message)}
              style={{
                padding: '10px',
                backgroundColor: getPlatformBgColor(message.platform),
                borderRadius: '8px',
                cursor: 'pointer',
                border: `2px solid ${getPlatformColor(message.platform)}`,
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: getPlatformColor(message.platform),
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                {message.platform}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '4px',
                  paddingRight: '60px'
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
                  {message.from}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  {message.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#4B5563',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {message.preview}
              </div>
            </div>
          ))}
        </div>
      )}

      {showMessagePopup && selectedMessage && (
        <Portal>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999
            }}
            onClick={() => setShowMessagePopup(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
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
                  borderBottom: '1px solid #E5E7EB',
                  backgroundColor: getPlatformBgColor(selectedMessage.platform)
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: getPlatformColor(selectedMessage.platform),
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {selectedMessage.platform}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1F2937'
                    }}
                  >
                    {selectedMessage.from}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6B7280'
                  }}
                >
                  {selectedMessage.date.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1,
                  backgroundColor: '#F9FAFB'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#1F2937',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {selectedMessage.content}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 24px',
                  borderTop: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  backgroundColor: 'white'
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
                  onClick={() => setShowMessagePopup(false)}
                  style={{
                    backgroundColor: getPlatformColor(selectedMessage.platform),
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
        </Portal>
      )}
    </div>
  );
}