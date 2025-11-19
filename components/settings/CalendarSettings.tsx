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
  const [localSettings, setLocalSettings] = useState({
    calendarDefaultDuration: settings.calendarDefaultDuration,
    calendarWeekendMode: settings.calendarWeekendMode,
    calendarFirstDayOfWeek: settings.calendarFirstDayOfWeek,
    calendarGoogleConnected: settings.calendarGoogleConnected,
    calendarOutlookConnected: settings.calendarOutlookConnected,
    calendarAppleConnected: settings.calendarAppleConnected,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onUpdate(localSettings);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setLocalSettings({
      calendarDefaultDuration: settings.calendarDefaultDuration,
      calendarWeekendMode: settings.calendarWeekendMode,
      calendarFirstDayOfWeek: settings.calendarFirstDayOfWeek,
      calendarGoogleConnected: settings.calendarGoogleConnected,
      calendarOutlookConnected: settings.calendarOutlookConnected,
      calendarAppleConnected: settings.calendarAppleConnected,
    });
    setHasChanges(false);
  };

  const handleConnectCalendar = async (provider: 'google' | 'outlook' | 'apple') => {
    // TODO: Implement OAuth flow
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar connection will be implemented with OAuth`);
    
    // For now, just toggle the connection status
    const key = `calendar${provider.charAt(0).toUpperCase() + provider.slice(1)}Connected` as keyof typeof localSettings;
    handleChange(key, !localSettings[key]);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Connect Calendars Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#1F2937', 
          marginBottom: '8px' 
        }}>
          Connect Calendars
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: '#6B7280', 
          marginBottom: '20px' 
        }}>
          Sync your external calendars to view all events in one place
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Google Calendar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                fontSize: '32px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
              }}>
                📅
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                  Google Calendar
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  Sync with your Google account
                </div>
              </div>
            </div>
            
            {localSettings.calendarGoogleConnected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#D1FAE5',
                color: '#047857',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <span>✓</span>
                <span>Connected</span>
              </div>
            ) : (
              <button
                onClick={() => handleConnectCalendar('google')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3367D6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4285F4'}
              >
                Connect
              </button>
            )}
          </div>

          {/* Microsoft Outlook */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                fontSize: '32px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
              }}>
                📧
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                  Microsoft Outlook
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  Sync with your Microsoft account
                </div>
              </div>
            </div>
            
            {localSettings.calendarOutlookConnected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#D1FAE5',
                color: '#047857',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <span>✓</span>
                <span>Connected</span>
              </div>
            ) : (
              <button
                onClick={() => handleConnectCalendar('outlook')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0078D4',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#106EBE'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0078D4'}
              >
                Connect
              </button>
            )}
          </div>

          {/* Apple Calendar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                fontSize: '32px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
              }}>
                🍎
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                  Apple Calendar
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  Sync with your iCloud account
                </div>
              </div>
            </div>
            
            {localSettings.calendarAppleConnected ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#D1FAE5',
                color: '#047857',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <span>✓</span>
                <span>Connected</span>
              </div>
            ) : (
              <button
                onClick={() => handleConnectCalendar('apple')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#000000',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Preferences Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#1F2937', 
          marginBottom: '8px' 
        }}>
          Calendar Preferences
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: '#6B7280', 
          marginBottom: '20px' 
        }}>
          Customize how your calendar displays and behaves
        </p>

        <div style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid #E5E7EB', 
          borderRadius: '12px', 
          padding: '24px' 
        }}>
          {/* Default Event Duration */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Default Event Duration
            </label>
            <select
              value={localSettings.calendarDefaultDuration}
              onChange={(e) => handleChange('calendarDefaultDuration', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Weekend Schedule */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '12px' 
            }}>
              Weekend Schedule
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: localSettings.calendarWeekendMode === 'all_working' ? '#F4B000' : '#E5E7EB',
                backgroundColor: localSettings.calendarWeekendMode === 'all_working' ? '#FFFBEB' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="weekendMode"
                  value="all_working"
                  checked={localSettings.calendarWeekendMode === 'all_working'}
                  onChange={(e) => handleChange('calendarWeekendMode', e.target.value)}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                    All Saturdays Working
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    6-day work week (Monday - Saturday)
                  </div>
                </div>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: localSettings.calendarWeekendMode === 'alternate_sat' ? '#F4B000' : '#E5E7EB',
                backgroundColor: localSettings.calendarWeekendMode === 'alternate_sat' ? '#FFFBEB' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="weekendMode"
                  value="alternate_sat"
                  checked={localSettings.calendarWeekendMode === 'alternate_sat'}
                  onChange={(e) => handleChange('calendarWeekendMode', e.target.value)}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                    Alternate Saturdays Working
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    First, third, fifth Saturday working
                  </div>
                </div>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: localSettings.calendarWeekendMode === 'both_off' ? '#F4B000' : '#E5E7EB',
                backgroundColor: localSettings.calendarWeekendMode === 'both_off' ? '#FFFBEB' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="weekendMode"
                  value="both_off"
                  checked={localSettings.calendarWeekendMode === 'both_off'}
                  onChange={(e) => handleChange('calendarWeekendMode', e.target.value)}
                  style={{ marginRight: '12px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                    Saturday & Sunday Off
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    5-day work week (Monday - Friday)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* First Day of Week */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '12px' 
            }}>
              First Day of Week
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ 
                flex: 1,
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: localSettings.calendarFirstDayOfWeek === 'sunday' ? '#F4B000' : '#E5E7EB',
                backgroundColor: localSettings.calendarFirstDayOfWeek === 'sunday' ? '#FFFBEB' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="firstDayOfWeek"
                  value="sunday"
                  checked={localSettings.calendarFirstDayOfWeek === 'sunday'}
                  onChange={(e) => handleChange('calendarFirstDayOfWeek', e.target.value)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                  Sunday
                </span>
              </label>

              <label style={{ 
                flex: 1,
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: localSettings.calendarFirstDayOfWeek === 'monday' ? '#F4B000' : '#E5E7EB',
                backgroundColor: localSettings.calendarFirstDayOfWeek === 'monday' ? '#FFFBEB' : '#F9FAFB',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="firstDayOfWeek"
                  value="monday"
                  checked={localSettings.calendarFirstDayOfWeek === 'monday'}
                  onChange={(e) => handleChange('calendarFirstDayOfWeek', e.target.value)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                  Monday
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      {hasChanges && (
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '20px',
          backgroundColor: '#F9FAFB',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              backgroundColor: 'white',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F4B000',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(244, 176, 0, 0.3)'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}