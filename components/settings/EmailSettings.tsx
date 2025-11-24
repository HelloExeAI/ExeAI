// src/components/settings/EmailSettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';

interface EmailSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

export default function EmailSettings({ settings, onUpdate, isSaving }: EmailSettingsProps) {
  const [gmailConnected, setGmailConnected] = useState(settings.emailGmailConnected || false);
  const [outlookConnected, setOutlookConnected] = useState(settings.emailOutlookConnected || false);
  const [signature, setSignature] = useState(settings.emailSignature || '');
  const [notifications, setNotifications] = useState(settings.emailNotifications ?? true);

  useEffect(() => {
    setGmailConnected(settings.emailGmailConnected || false);
    setOutlookConnected(settings.emailOutlookConnected || false);
    setSignature(settings.emailSignature || '');
    setNotifications(settings.emailNotifications ?? true);
  }, [settings]);

  const handleConnectGmail = async () => {
    const newStatus = !gmailConnected;
    setGmailConnected(newStatus);
    
    try {
      await onUpdate({
        emailGmailConnected: newStatus,
      });
      
      if (newStatus) {
        alert('Gmail connected successfully! (Demo mode)');
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error);
    }
  };

  const handleConnectOutlook = async () => {
    const newStatus = !outlookConnected;
    setOutlookConnected(newStatus);
    
    try {
      await onUpdate({
        emailOutlookConnected: newStatus,
      });
      
      if (newStatus) {
        alert('Outlook connected successfully! (Demo mode)');
      }
    } catch (error) {
      console.error('Error connecting Outlook:', error);
    }
  };

  const handleDisconnectGmail = async () => {
    if (confirm('Are you sure you want to disconnect Gmail?')) {
      setGmailConnected(false);
      try {
        await onUpdate({ emailGmailConnected: false });
      } catch (error) {
        console.error('Error disconnecting Gmail:', error);
      }
    }
  };

  const handleDisconnectOutlook = async () => {
    if (confirm('Are you sure you want to disconnect Outlook?')) {
      setOutlookConnected(false);
      try {
        await onUpdate({ emailOutlookConnected: false });
      } catch (error) {
        console.error('Error disconnecting Outlook:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate({
        emailSignature: signature,
        emailNotifications: notifications,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const hasChanges = 
    signature !== (settings.emailSignature || '') ||
    notifications !== (settings.emailNotifications ?? true);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: '0 0 4px 0' 
        }}>
          Email Settings
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: '#6B7280', 
          margin: 0 
        }}>
          Connect your email accounts and customize preferences
        </p>
      </div>

      {/* Connected Accounts */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '15px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: '0 0 12px 0'
        }}>
          Connected Accounts
        </h3>
        <p style={{ 
          fontSize: '12px', 
          color: '#6B7280', 
          margin: '0 0 16px 0' 
        }}>
          Link your email accounts to manage messages in EXEAI
        </p>

        {/* Gmail */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '10px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              border: '1px solid #E5E7EB'
            }}>
              📧
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                Gmail
              </div>
              <div style={{ fontSize: '11px', color: gmailConnected ? '#10B981' : '#6B7280' }}>
                {gmailConnected ? '✓ Connected' : 'Not connected'}
              </div>
            </div>
          </div>
          {gmailConnected ? (
            <button
              onClick={handleDisconnectGmail}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
                color: '#EF4444',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectGmail}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#F4B000',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Outlook */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              border: '1px solid #E5E7EB'
            }}>
              📮
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                Outlook
              </div>
              <div style={{ fontSize: '11px', color: outlookConnected ? '#10B981' : '#6B7280' }}>
                {outlookConnected ? '✓ Connected' : 'Not connected'}
              </div>
            </div>
          </div>
          {outlookConnected ? (
            <button
              onClick={handleDisconnectOutlook}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
                color: '#EF4444',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectOutlook}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#F4B000',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Email Signature */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '15px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: '0 0 12px 0'
        }}>
          Email Signature
        </h3>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter your email signature..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Notifications */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '15px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: '0 0 12px 0'
        }}>
          Notifications
        </h3>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          Enable email notifications
        </label>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F4B000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.6 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}