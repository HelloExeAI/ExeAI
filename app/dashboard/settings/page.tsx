// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SettingsLayout from '@/components/settings/SettingsLayout';
import CalendarSettings from '@/components/settings/CalendarSettings';
import ClockSettings from '@/components/settings/ClockSettings';
import { UserSettings } from '@/types/settings';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('calendar');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch settings on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error('Failed to fetch settings');
        displayToast('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      displayToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<UserSettings>) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        displayToast('Settings saved successfully', 'success');
      } else {
        console.error('Failed to update settings');
        displayToast('Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      displayToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const displayToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Loading state
  if (loading || status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F9FAFB'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
          <p style={{ fontSize: '16px', color: '#6B7280' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!settings) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F9FAFB'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '16px' }}>
            Failed to load settings
          </p>
          <button
            onClick={fetchSettings}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F4B000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SettingsLayout currentTab={currentTab} onTabChange={setCurrentTab}>
        {/* Calendar Settings Tab */}
        {currentTab === 'calendar' && (
          <CalendarSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
        )}

        {/* Clock Settings Tab */}
        {currentTab === 'clock' && (
          <ClockSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
        )}

        {/* Workspace Settings Tab - Coming Soon */}
        {currentTab === 'workspace' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💼</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Workspace Settings
            </h2>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              Coming soon...
            </p>
          </div>
        )}

        {/* Todos Settings Tab - Coming Soon */}
        {currentTab === 'todos' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              To-Do List Settings
            </h2>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              Coming soon...
            </p>
          </div>
        )}

        {/* Email Settings Tab - Coming Soon */}
        {currentTab === 'email' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Email Settings
            </h2>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              Coming soon...
            </p>
          </div>
        )}

        {/* Messages Settings Tab - Coming Soon */}
        {currentTab === 'messages' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              Messages Settings
            </h2>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              Coming soon...
            </p>
          </div>
        )}

        {/* Preferences Tab - Coming Soon */}
        {currentTab === 'preferences' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚙️</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
              General Preferences
            </h2>
            <p style={{ fontSize: '16px', color: '#6B7280' }}>
              Coming soon...
            </p>
          </div>
        )}
      </SettingsLayout>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          backgroundColor: toastMessage.includes('Failed') ? '#EF4444' : '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease'
        }}>
          <span style={{ fontSize: '20px' }}>
            {toastMessage.includes('Failed') ? '⚠️' : '✓'}
          </span>
          {toastMessage}
        </div>
      )}

      <style jsx global>{`
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
    </>
  );
}