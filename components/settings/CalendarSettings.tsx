// src/components/settings/CalendarSettings.tsx
'use client';

import { useState } from 'react';
import { UserSettings } from '@/types/settings';

interface CalendarSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

export default function CalendarSettings({ settings, onUpdate, isSaving }: CalendarSettingsProps) {
  const [googleConnected, setGoogleConnected] = useState(settings.calendarGoogleConnected);
  const [outlookConnected, setOutlookConnected] = useState(settings.calendarOutlookConnected);
  const [appleConnected, setAppleConnected] = useState(settings.calendarAppleConnected);
  const [defaultDuration, setDefaultDuration] = useState(settings.calendarDefaultDuration);
  const [weekendMode, setWeekendMode] = useState(settings.calendarWeekendMode);

  const handleSave = async () => {
    await onUpdate({
      calendarGoogleConnected: googleConnected,
      calendarOutlookConnected: outlookConnected,
      calendarAppleConnected: appleConnected,
      calendarDefaultDuration: defaultDuration,
      calendarWeekendMode: weekendMode,
    });
  };

  const hasChanges = 
    googleConnected !== settings.calendarGoogleConnected ||
    outlookConnected !== settings.calendarOutlookConnected ||
    appleConnected !== settings.calendarAppleConnected ||
    defaultDuration !== settings.calendarDefaultDuration ||
    weekendMode !== settings.calendarWeekendMode;

  return (
    <div>
      {/* Compact Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: '0 0 4px 0' 
        }}>
          Calendar Settings
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: '#6B7280', 
          margin: 0 
        }}>
          Connect external calendars and customize preferences
        </p>
      </div>

      {/* Connect Calendars - Compact */}
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
          Connect Calendars
        </h3>
        <p style={{ 
          fontSize: '12px', 
          color: '#6B7280', 
          margin: '0 0 16px 0' 
        }}>
          Sync your external calendars to view all events in one place
        </p>

        {/* Google Calendar - Compact */}
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
              📅
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                Google Calendar
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                Sync with your Google account
              </div>
            </div>
          </div>
          {googleConnected ? (
            <div style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>✓</span> Connected
            </div>
          ) : (
            <button
              onClick={() => setGoogleConnected(true)}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#3B82F6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Microsoft Outlook - Compact */}
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
                Microsoft Outlook
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                Sync with your Microsoft account
              </div>
            </div>
          </div>
          {outlookConnected ? (
            <div style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>✓</span> Connected
            </div>
          ) : (
            <button
              onClick={() => setOutlookConnected(true)}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#3B82F6',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Apple Calendar - Compact */}
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
              🍎
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1F2937', marginBottom: '2px' }}>
                Apple Calendar
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                Sync with your iCloud account
              </div>
            </div>
          </div>
          {appleConnected ? (
            <div style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>✓</span> Connected
            </div>
          ) : (
            <button
              onClick={() => setAppleConnected(true)}
              disabled={isSaving}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1F2937',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Calendar Preferences - Compact */}
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
          Calendar Preferences
        </h3>
        <p style={{ 
          fontSize: '12px', 
          color: '#6B7280', 
          margin: '0 0 16px 0' 
        }}>
          Customize how your calendar displays and behaves
        </p>

        {/* Default Event Duration - Compact */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Default Event Duration
          </label>
          <select
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(Number(e.target.value))}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: isSaving ? '#F9FAFB' : 'white',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#F4B000';
              e.target.style.boxShadow = '0 0 0 2px rgba(244, 176, 0, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        {/* Weekend Schedule - Compact */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Weekend Schedule
          </label>
          <select
            value={weekendMode}
            onChange={(e) => setWeekendMode(e.target.value as 'all_working' | 'alternate_sat' | 'both_off')}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: isSaving ? '#F9FAFB' : 'white',
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#F4B000';
              e.target.style.boxShadow = '0 0 0 2px rgba(244, 176, 0, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="all_saturdays_working">All Saturdays Working</option>
            <option value="alternate_saturdays_working">Alternate Saturdays Working</option>
            <option value="no_saturdays_working">No Saturdays Working</option>
          </select>
        </div>
      </div>

      {/* Compact Save Button */}
      {hasChanges && (
        <div style={{
          position: 'sticky',
          bottom: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isSaving ? '#FCD34D' : '#F4B000',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isSaving ? 'none' : '0 2px 8px rgba(244, 176, 0, 0.25)'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = '#D99E00';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 176, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4B000';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(244, 176, 0, 0.25)';
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}