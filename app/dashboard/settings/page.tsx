// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';      
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SettingsLayout from '@/components/settings/SettingsLayout';
import CalendarSettings from '@/components/settings/CalendarSettings';
import ClockSettings from '@/components/settings/ClockSettings';
import WorkspaceSettings from '@/components/settings/WorkspaceSettings';
import TodoSettings from '@/components/settings/TodoSettings';    
import EmailSettings from '@/components/settings/EmailSettings';
import MessagesSettings from '@/components/settings/MessagesSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';
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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch settings:', response.status, errorData);
        displayToast('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      displayToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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

  // Error state - only show if loading is complete and settings is still null
  if (!loading && !settings) {
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

        {/* Workspace Settings Tab */}
        {currentTab === 'workspace' && (
          <WorkspaceSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
        )}

        {/* Todo Settings Tab */}
        {currentTab === 'todos' && (
          <TodoSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
        )}

        {/* Email Settings Tab */}
        {currentTab === 'email' && (
          <EmailSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
        )}

        {/* Messages Settings Tab */}
        {currentTab === 'messages' && (
          <MessagesSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
        )}

        {/* Preferences Tab */}
        {currentTab === 'preferences' && (
          <PreferencesSettings 
            settings={settings} 
            onUpdate={handleUpdateSettings}
            isSaving={isSaving}
          />
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