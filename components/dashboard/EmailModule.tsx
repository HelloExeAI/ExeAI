// components/dashboard/EmailModule.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Email type definition
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
  
  // Simulating email fetching and checking for new emails periodically
  useEffect(() => {
    // Load saved emails from localStorage
    const savedEmails = localStorage.getItem('exeai-emails');
    if (savedEmails) {
      try {
        const parsed = JSON.parse(savedEmails);
        // Convert date strings back to Date objects
        const formattedEmails = parsed.map((email: any) => ({
          ...email,
          date: new Date(email.date)
        }));
        setEmails(formattedEmails);
      } catch (e) {
        console.error('Error parsing saved emails', e);
      }
    } else {
      // Initialize with demo emails if none exist
      const demoEmails: Email[] = [
        {
          id: '1',
          from: 'John Smith',
          subject: 'Project Update: EXEAI',
          preview: 'Just wanted to share the latest updates on our progress...',
          date: new Date(2025, 10, 13, 9, 30),
          content: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <p>Hi,</p>
              <p>Just wanted to share the latest updates on our progress with the EXEAI project:</p>
              <ul>
                <li>Dashboard UI is now 90% complete</li>
                <li>Calendar integration works flawlessly</li>
                <li>Todo list functionality is implemented</li>
              </ul>
              <p>We should be ready for the initial beta testing by next week. Can we schedule a meeting to discuss the release timeline?</p>
              <p>Best regards,<br>John Smith<br>Product Manager</p>
            </div>
          `,
          read: false
        },
        {
          id: '2',
          from: 'Sarah Johnson',
          subject: 'Invoice for November',
          preview: 'Please find attached the invoice for services rendered in November...',
          date: new Date(2025, 10, 12, 15, 45),
          content: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <p>Hello,</p>
              <p>Please find attached the invoice for services rendered in November 2025.</p>
              <p>Invoice details:</p>
              <ul>
                <li>Invoice #: INV-2025-11</li>
                <li>Amount: $1,850.00</li>
                <li>Due date: November 30, 2025</li>
              </ul>
              <p>Please let me know if you have any questions regarding this invoice.</p>
              <p>Thank you for your business!</p>
              <p>Best regards,<br>Sarah Johnson<br>Finance Department</p>
            </div>
          `,
          read: false
        }
      ];
      
      setEmails(demoEmails);
      localStorage.setItem('exeai-emails', JSON.stringify(demoEmails));
    }
    
    // Simulate receiving new emails every few minutes
    const intervalId = setInterval(() => {
      const chance = Math.random();
      if (chance > 0.7) { // 30% chance to receive new email
        const newEmail: Email = {
          id: `email-${Date.now()}`,
          from: `${['Alex', 'Maya', 'Carlos', 'Zoe', 'Jamie'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Davis', 'Brown'][Math.floor(Math.random() * 5)]}`,
          subject: `${['Update on', 'Question about', 'Feedback for', 'Invitation to', 'Reminder about'][Math.floor(Math.random() * 5)]} ${['the project', 'your request', 'EXEAI', 'our meeting', 'the proposal'][Math.floor(Math.random() * 5)]}`,
          preview: `${['Just wanted to check in about', 'I was wondering if you could provide', 'Please review', 'Looking forward to', 'Don\'t forget about'][Math.floor(Math.random() * 5)]}...`,
          date: new Date(),
          content: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <p>Hello,</p>
              <p>${['Just wanted to check in about the recent changes to EXEAI.', 'I was wondering if you could provide more details about the dashboard functionality.', 'Please review the latest design mockups I\'ve attached.', 'Looking forward to our meeting next week.', 'Don\'t forget about the deadline coming up this Friday.'][Math.floor(Math.random() * 5)]}</p>
              <p>${['Let me know your thoughts when you have a moment.', 'Please let me know if you need any clarification.', 'I\'d appreciate your feedback on this.', 'This is a high priority item for our team.', 'We should discuss this further at your convenience.'][Math.floor(Math.random() * 5)]}</p>
              <p>Best regards,<br>${['Alex', 'Maya', 'Carlos', 'Zoe', 'Jamie'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Davis', 'Brown'][Math.floor(Math.random() * 5)]}</p>
            </div>
          `,
          read: false
        };
        
        setEmails(prevEmails => {
          const updatedEmails = [...prevEmails, newEmail];
          localStorage.setItem('exeai-emails', JSON.stringify(updatedEmails));
          return updatedEmails;
        });
      }
    }, 120000); // Check every 2 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Mark email as read
  const markAsRead = (emailId: string) => {
    const updatedEmails = emails.map(email => 
      email.id === emailId ? { ...email, read: true } : email
    );
    setEmails(updatedEmails);
    localStorage.setItem('exeai-emails', JSON.stringify(updatedEmails));
  };
  
  // Open email
  const openEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowEmailPopup(true);
    markAsRead(email.id);
  };
  
  // Handle Reply Later (add to todo list)
  const handleReplyLater = () => {
    if (selectedEmail && onAddTodo) {
      const todoContent = `Reply to email: ${selectedEmail.subject} (from: ${selectedEmail.from})`;
      onAddTodo(todoContent);
      setShowEmailPopup(false);
      
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
      toastElement.innerHTML = `<span style="fontSize: 20px">✓</span>Added to todo list`;
      
      document.body.appendChild(toastElement);
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 3000);
    }
  };
  
  // Filter to show only unread emails
  const unreadEmails = emails.filter(email => !email.read);
  
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
          <span style={{ color: '#F4B000' }}>📩</span> Inbox
          {unreadEmails.length > 0 && (
            <span style={{
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '9999px',
              padding: '2px 6px',
              fontSize: '12px',
              fontWeight: '600',
              marginLeft: '6px'
            }}>
              {unreadEmails.length}
            </span>
          )}
        </h2>
      </div>
      
      {/* Email list */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        maxHeight: '300px', 
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {unreadEmails.length === 0 ? (
          <div style={{ 
            padding: '24px 16px', 
            textAlign: 'center', 
            color: '#9CA3AF',
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px dashed #E5E7EB',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>📩</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>No new emails</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Your inbox is all caught up
            </div>
          </div>
        ) : (
          unreadEmails.map(email => (
            <div 
              key={email.id}
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
              onClick={() => openEmail(email)}
            >
              {/* Unread indicator */}
              {!email.read && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                  flexShrink: 0
                }} />
              )}
              
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '14px',
                  color: '#1F2937',
                  fontWeight: !email.read ? '600' : '400',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px'
                }}>
                  {email.from}
                </div>
                <div style={{ 
                  fontSize: '13px',
                  color: '#4B5563',
                  fontWeight: !email.read ? '600' : '400',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px'
                }}>
                  {email.subject}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: '#6B7280',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {email.preview}
                </div>
              </div>
              
              {/* Time */}
              <div style={{ 
                fontSize: '11px',
                color: '#9CA3AF',
                flexShrink: 0
              }}>
                {email.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Email popup */}
      {showEmailPopup && selectedEmail && (
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
        onClick={() => setShowEmailPopup(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Email header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                  {selectedEmail.subject}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#4B5563' }}>
                    From: <strong>{selectedEmail.from}</strong>
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    {selectedEmail.date.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
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
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>✓</span>
                  Reply Later
                </button>
              </div>
            </div>
            
            {/* Email content */}
            <div style={{
              padding: '20px 24px',
              overflow: 'auto',
              flex: 1
            }}>
              <div dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
            </div>
            
            {/* Email footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowEmailPopup(false)}
                style={{
                  backgroundColor: 'white',
                  color: '#4B5563',
                  border: '1px solid #E5E7EB',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
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
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}