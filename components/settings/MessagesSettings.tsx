'use client';

import { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';

interface MessagesSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
}

export default function MessagesSettings({ settings, onUpdate }: MessagesSettingsProps) {
  const [whatsappConnected, setWhatsappConnected] = useState(settings.messageWhatsAppConnected || false);
  const [slackConnected, setSlackConnected] = useState(settings.messageSlackConnected || false);
  const [readReceipts, setReadReceipts] = useState(settings.messageReadReceipts ?? true);
  const [notifications, setNotifications] = useState(settings.messageNotifications ?? true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWhatsappConnected(settings.messageWhatsAppConnected || false);
    setSlackConnected(settings.messageSlackConnected || false);
    setReadReceipts(settings.messageReadReceipts ?? true);
    setNotifications(settings.messageNotifications ?? true);
  }, [settings]);

  const handleConnectWhatsApp = async () => {
    const newStatus = !whatsappConnected;
    setWhatsappConnected(newStatus);
    
    setIsSaving(true);
    try {
      await onUpdate({
        messageWhatsAppConnected: newStatus,
      });
      
      if (newStatus) {
        alert('WhatsApp connected successfully! (Demo mode)\n\nIn production, this will use WhatsApp Web QR code scanning.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectSlack = async () => {
    const newStatus = !slackConnected;
    setSlackConnected(newStatus);
    
    setIsSaving(true);
    try {
      await onUpdate({
        messageSlackConnected: newStatus,
      });
      
      if (newStatus) {
        alert('Slack connected successfully! (Demo mode)\n\nIn production, this will use Slack OAuth.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (confirm('Are you sure you want to disconnect WhatsApp?')) {
      setWhatsappConnected(false);
      setIsSaving(true);
      try {
        await onUpdate({ messageWhatsAppConnected: false });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDisconnectSlack = async () => {
    if (confirm('Are you sure you want to disconnect Slack?')) {
      setSlackConnected(false);
      setIsSaving(true);
      try {
        await onUpdate({ messageSlackConnected: false });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        messageReadReceipts: readReceipts,
        messageNotifications: notifications,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    readReceipts !== (settings.messageReadReceipts ?? true) ||
    notifications !== (settings.messageNotifications ?? true);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', margin: '0 0 4px 0' }}>
          Messages Settings
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          Connect your messaging platforms and customize preferences
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', margin: '0 0 12px 0' }}>
          Connected Platforms
        </h3>
        <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px 0' }}>
          Link your messaging platforms to see all messages in one place
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#F9FAFB',
            borderRadius: '10px',
            marginBottom: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              💬
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                WhatsApp
              </div>
              <div style={{ fontSize: '11px', color: whatsappConnected ? '#10B981' : '#6B7280' }}>
                {whatsappConnected ? '✓ Connected' : 'Not connected'}
              </div>
            </div>
          </div>
          {whatsappConnected ? (
            <button
              onClick={handleDisconnectWhatsApp}
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
              onClick={handleConnectWhatsApp}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#25D366',
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#F9FAFB',
            borderRadius: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#4A154B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              💼
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                Slack
              </div>
              <div style={{ fontSize: '11px', color: slackConnected ? '#10B981' : '#6B7280' }}>
                {slackConnected ? '✓ Connected' : 'Not connected'}
              </div>
            </div>
          </div>
          {slackConnected ? (
            <button
              onClick={handleDisconnectSlack}
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
              onClick={handleConnectSlack}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#4A154B',
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

      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1F2937', margin: '0 0 12px 0' }}>
          Message Preferences
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#374151'
            }}
          >
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => setReadReceipts(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Send read receipts
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#374151'
            }}
          >
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Enable message notifications
          </label>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', margin: '0 0 8px 0' }}>
          💡 Integration Guide
        </h3>
        <div style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>WhatsApp:</strong> Uses WhatsApp Web API with QR code scanning for secure connection.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Slack:</strong> Uses Slack OAuth for workspace integration. You'll be redirected to authorize access.
          </p>
        </div>
      </div>

      {hasChanges && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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