// components/dashboard/MessengerModule.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Message type definition
interface Message {
  id: string;
  platform: 'whatsapp' | 'slack';
  sender: string;
  content: string;
  date: Date;
  read: boolean;
  avatar?: string;
}

interface MessengerModuleProps {
  onAddTodo?: (content: string) => void;
}

export default function MessengerModule({ onAddTodo }: MessengerModuleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'slack'>('whatsapp');
  
  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('exeai-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert date strings back to Date objects
        const formattedMessages = parsed.map((message: any) => ({
          ...message,
          date: new Date(message.date)
        }));
        setMessages(formattedMessages);
      } catch (e) {
        console.error('Error parsing saved messages', e);
      }
    } else {
      // Initialize with demo messages if none exist
      const demoMessages: Message[] = [
        {
          id: 'w1',
          platform: 'whatsapp',
          sender: 'Alice Chen',
          content: 'Hey, did you see the project timeline I shared yesterday? We need your feedback before the team meeting tomorrow.',
          date: new Date(2025, 10, 13, 10, 15),
          read: false,
          avatar: '👩🏻'
        },
        {
          id: 'w2',
          platform: 'whatsapp',
          sender: 'Marketing Group',
          content: "James: I've updated the presentation with the new branding guidelines. Can everyone review it by EOD?",
          date: new Date(2025, 10, 13, 9, 45),
          read: false,
          avatar: '👥'
        },
        {
          id: 's1',
          platform: 'slack',
          sender: 'dev-team',
          content: 'David Lopez: @channel The latest build is now available for testing in the staging environment. Please report any bugs ASAP.',
          date: new Date(2025, 10, 13, 11, 30),
          read: false,
          avatar: '🧑🏽‍💻'
        },
        {
          id: 's2',
          platform: 'slack',
          sender: 'general',
          content: 'Office Admin: Reminder that the office will be closing early at 4pm today for building maintenance.',
          date: new Date(2025, 10, 13, 8, 20),
          read: false,
          avatar: '🏢'
        }
      ];
      
      setMessages(demoMessages);
      localStorage.setItem('exeai-messages', JSON.stringify(demoMessages));
    }
    
    // Simulate receiving new messages every few minutes
    const intervalId = setInterval(() => {
      const chance = Math.random();
      if (chance > 0.8) { // 20% chance to receive new message
        const platform = Math.random() > 0.5 ? 'whatsapp' : 'slack';
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          platform,
          sender: platform === 'whatsapp' 
            ? `${['Alex', 'Maya', 'Carlos', 'Zoe', 'Jamie'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Davis', 'Brown'][Math.floor(Math.random() * 5)]}`
            : `${['dev-team', 'marketing', 'general', 'announcements', 'project-exeai'][Math.floor(Math.random() * 5)]}`,
          content: platform === 'whatsapp'
            ? `${['Hey, just checking in about', 'Quick question regarding', 'Have you had a chance to look at', 'Can we discuss', 'I need your input on'][Math.floor(Math.random() * 5)]} ${['the project', 'your availability', 'that document', 'the meeting notes', 'our timeline'][Math.floor(Math.random() * 5)]}`
            : `${['Alex', 'Maya', 'Carlos', 'Zoe', 'Jamie'][Math.floor(Math.random() * 5)]}: ${['Just pushed a new update to', 'Can someone review', 'Looking for feedback on', 'Important announcement about', 'Need help with'][Math.floor(Math.random() * 5)]} ${['the codebase', 'the design mockups', 'the latest PR', 'our roadmap', 'the deployment'][Math.floor(Math.random() * 5)]}`,
          date: new Date(),
          read: false,
          avatar: platform === 'whatsapp' 
            ? ['👩🏻', '👨🏽', '👩🏾', '👨🏻', '👥'][Math.floor(Math.random() * 5)]
            : ['💻', '📊', '🏢', '🔔', '🚀'][Math.floor(Math.random() * 5)]
        };
        
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, newMessage];
          localStorage.setItem('exeai-messages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }
    }, 180000); // Check every 3 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Rest of your code remains the same
  
  // Mark message as read
  const markAsRead = (messageId: string) => {
    const updatedMessages = messages.map(message => 
      message.id === messageId ? { ...message, read: true } : message
    );
    setMessages(updatedMessages);
    localStorage.setItem('exeai-messages', JSON.stringify(updatedMessages));
  };
  
  // Open message
  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowMessagePopup(true);
    markAsRead(message.id);
  };
  
  // Handle Reply Later (add to todo list)
  const handleReplyLater = () => {
    if (selectedMessage && onAddTodo) {
      const platform = selectedMessage.platform === 'whatsapp' ? 'WhatsApp' : 'Slack';
      const todoContent = `Reply to ${platform} message from ${selectedMessage.sender}`;
      onAddTodo(todoContent);
      setShowMessagePopup(false);
      
      // Show toast notification
      const toastElement = document.createElement('div');
      toastElement.style.position = 'fixed';
      toastElement.style.bottom = '32px';
      toastElement.style.right = '32px';
      toastElement.style.backgroundColor = '#10B981';
      toastElement.style.color = 'white';
      toastElement.style.padding = '16px 24px';
      toastElement.style.borderRadius = '12px';
      toastElement.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
      toastElement.style.fontSize = '14px';
      toastElement.style.fontWeight = '600';
      toastElement.style.zIndex = '2000';
      toastElement.style.display = 'flex';
      toastElement.style.alignItems = 'center';
      toastElement.style.gap = '12px';
      toastElement.innerHTML = `<span style="font-size: 20px">✓</span>Added to todo list`;
      
      document.body.appendChild(toastElement);
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 3000);
    }
  };
  
  // Filter to show only unread messages for the active tab
  const unreadMessages = messages.filter(message => !message.read && message.platform === activeTab);
  const unreadWhatsAppCount = messages.filter(message => !message.read && message.platform === 'whatsapp').length;
  const unreadSlackCount = messages.filter(message => !message.read && message.platform === 'slack').length;
  
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' }}>
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: '#F4B000' }}>💬</span> Messages
        </h2>
      </div>
      
      {/* Platform tabs */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setActiveTab('whatsapp')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: activeTab === 'whatsapp' ? '#25D366' : '#6B7280',
            border: 'none',
            borderBottom: activeTab === 'whatsapp' ? '2px solid #25D366' : '2px solid transparent',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 14.5l-1.5 1.5.5 5-5-2.5L5 21l.5-5-3-3 4.5-.5L9 8l1.5 4.5h6z" />
              <path d="M17.5 11l-1.5 1.5.5 5-5-2.5L5 17.5l.5-5-3-3 4.5-.5L9 4l1.5 4.5h6z" />
            </svg>
          </span>
          WhatsApp
          {unreadWhatsAppCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#25D366',
              color: 'white',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadWhatsAppCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('slack')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: activeTab === 'slack' ? '#4A154B' : '#6B7280',
            border: 'none',
            borderBottom: activeTab === 'slack' ? '2px solid #4A154B' : '2px solid transparent',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            position: 'relative'
          }}
        >
          <span style={{ fontSize: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          Slack
          {unreadSlackCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#4A154B',
              color: 'white',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadSlackCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Messages list */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        maxHeight: '300px', 
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {unreadMessages.length === 0 ? (
          <div style={{ 
            padding: '24px 16px', 
            textAlign: 'center', 
            color: '#9CA3AF',
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px dashed #E5E7EB',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>💬</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>No new messages</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {activeTab === 'whatsapp' ? 'WhatsApp' : 'Slack'} is all caught up
            </div>
          </div>
        ) : (
          unreadMessages.map(message => (
            <div 
              key={message.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
              onClick={() => openMessage(message)}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: message.platform === 'whatsapp' ? '#25D366' : '#4A154B',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                {message.avatar || (message.platform === 'whatsapp' ? '👤' : '💼')}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '14px',
                  color: '#1F2937',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px'
                }}>
                  {message.sender}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3'
                }}>
                  {message.content}
                </div>
              </div>
              
              {/* Time */}
              <div style={{ 
                fontSize: '11px',
                color: '#9CA3AF',
                flexShrink: 0
              }}>
                {message.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Message popup */}
      {showMessagePopup && selectedMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowMessagePopup(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Message header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: selectedMessage.platform === 'whatsapp' ? '#F0F9F0' : '#F4F1F4'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: selectedMessage.platform === 'whatsapp' ? '#25D366' : '#4A154B',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {selectedMessage.avatar || (selectedMessage.platform === 'whatsapp' ? '👤' : '💼')}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>
                    {selectedMessage.sender}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {selectedMessage.platform === 'whatsapp' ? 'WhatsApp' : 'Slack'} • {selectedMessage.date.toLocaleString()}
                  </div>
                </div>
              </div>
              <div>
                <button
                  onClick={handleReplyLater}
                  style={{
                    backgroundColor: '#F4B000',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>✓</span>
                  Reply Later
                </button>
              </div>
            </div>
            
            {/* Message content */}
            <div style={{
              padding: '16px 20px',
              backgroundColor: selectedMessage.platform === 'whatsapp' ? '#E5FFE3' : '#F9F3F9',
              flex: 1,
              overflow: 'auto'
            }}>
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#1F2937'
              }}>
                {selectedMessage.content}
              </div>
            </div>
            
            {/* Reply box */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: 'white',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Type your reply..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                style={{
                  backgroundColor: selectedMessage.platform === 'whatsapp' ? '#25D366' : '#4A154B',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
