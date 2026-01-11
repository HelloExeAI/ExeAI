'use client';

import { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';
import Portal from '@/components/ui/Portal';

interface MessagesSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

export default function MessagesSettings({ settings, onUpdate, isSaving }: MessagesSettingsProps) {
  const [whatsappConnected, setWhatsappConnected] = useState(settings.messageWhatsAppConnected || false);
  const [slackConnected, setSlackConnected] = useState(settings.messageSlackConnected || false);
  const [readReceipts, setReadReceipts] = useState(settings.messageReadReceipts ?? true);
  const [notifications, setNotifications] = useState(settings.messageNotifications ?? true);

  useEffect(() => {
    setWhatsappConnected(settings.messageWhatsAppConnected || false);
    setSlackConnected(settings.messageSlackConnected || false);
    setReadReceipts(settings.messageReadReceipts ?? true);
    setNotifications(settings.messageNotifications ?? true);
  }, [settings]);

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Poll for status if modal is open
    let interval: any;
    if (showQrModal) {
      interval = setInterval(async () => {
        const res = await fetch('/api/whatsapp');
        const data = await res.json();
        if (data.qrImage) {
          setQrCodeData(data.qrImage);
        }
        if (data.status === 'open') {
          setWhatsappConnected(true);
          setShowQrModal(false);
          onUpdate({ messageWhatsAppConnected: true });
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [showQrModal]);

  const handleConnectWhatsApp = async () => {
    setShowQrModal(true);
    setConnectionStatus('connecting');

    // Trigger initialization
    await fetch('/api/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ action: 'connect' })
    });
  };

  const handleConnectSlack = async () => {
    const newStatus = !slackConnected;
    setSlackConnected(newStatus);

    try {
      await onUpdate({
        messageSlackConnected: newStatus,
      });

      if (newStatus) {
        alert('Slack connected successfully! (Demo mode)\n\nIn production, this will use Slack OAuth.');
      }
    } catch (error) {
      console.error('Error connecting Slack:', error);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (confirm('Are you sure you want to disconnect WhatsApp?')) {
      setWhatsappConnected(false);
      try {
        await onUpdate({ messageWhatsAppConnected: false });
      } catch (error) {
        console.error('Error disconnecting WhatsApp:', error);
      }
    }
  };

  const handleDisconnectSlack = async () => {
    if (confirm('Are you sure you want to disconnect Slack?')) {
      setSlackConnected(false);
      try {
        await onUpdate({ messageSlackConnected: false });
      } catch (error) {
        console.error('Error disconnecting Slack:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate({
        messageReadReceipts: readReceipts,
        messageNotifications: notifications,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
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

      {/* WhatsApp QR Modal */}
      {showQrModal && (
        <Portal>
          <div style={{
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
          }} onClick={() => setShowQrModal(false)}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              textAlign: 'center',
              maxWidth: '400px'
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Scan to Connect</h3>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Open WhatsApp on your phone, go to Settings &gt; Linked Devices, and scan this code.
              </p>
              {qrCodeData ? (
                <img src={qrCodeData} alt="WhatsApp QR Code" style={{ width: '250px', height: '250px' }} />
              ) : (
                <div style={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p>Generating QR Code...</p>
                </div>
              )}
              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: '#eee',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}