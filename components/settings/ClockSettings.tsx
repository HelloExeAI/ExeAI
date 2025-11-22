// src/components/settings/ClockSettings.tsx
'use client';

import { useState } from 'react';
import { UserSettings } from '@/types/settings';

interface ClockSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
];

const TIMER_DURATIONS = [
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1200, label: '20 minutes' },
  { value: 1500, label: '25 minutes (Pomodoro)' },
  { value: 1800, label: '30 minutes' },
  { value: 2700, label: '45 minutes' },
  { value: 3600, label: '1 hour' },
];

export default function ClockSettings({ settings, onUpdate, isSaving }: ClockSettingsProps) {
  const [showSeconds, setShowSeconds] = useState(settings.clockShowSeconds);
  const [timezone, setTimezone] = useState(settings.clockTimezone);
  const [timerDuration, setTimerDuration] = useState(settings.timerDefaultDuration);
  const [timerSound, setTimerSound] = useState(settings.timerSoundEnabled);

  const handleSave = async () => {
    await onUpdate({
      clockShowSeconds: showSeconds,
      clockTimezone: timezone,
      timerDefaultDuration: timerDuration,
      timerSoundEnabled: timerSound,
    });
  };

  const hasChanges = 
    showSeconds !== settings.clockShowSeconds ||
    timezone !== settings.clockTimezone ||
    timerDuration !== settings.timerDefaultDuration ||
    timerSound !== settings.timerSoundEnabled;

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
          Clock & Time Settings
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: '#6B7280', 
          margin: 0 
        }}>
          Configure your clock display, timezone, and timer preferences
        </p>
      </div>

      {/* Clock Display Settings - Compact */}
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
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>🕐</span>
          Clock Display
        </h3>

        {/* Show Seconds Toggle - Compact */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '10px',
          marginBottom: '14px'
        }}>
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#1F2937',
              marginBottom: '2px'
            }}>
              Show Seconds
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Display seconds in the clock
            </div>
          </div>
          <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '44px', 
            height: '24px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.5 : 1
          }}>
            <input
              type="checkbox"
              checked={showSeconds}
              onChange={(e) => setShowSeconds(e.target.checked)}
              disabled={isSaving}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: showSeconds ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: showSeconds ? '23px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Timezone Selection - Compact */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
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
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
            Current time will be displayed in this timezone
          </p>
        </div>
      </div>

      {/* Timer Settings - Compact */}
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
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>⏱️</span>
          Timer Preferences
        </h3>

        {/* Default Timer Duration - Compact */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Default Timer Duration
          </label>
          <select
            value={timerDuration}
            onChange={(e) => setTimerDuration(Number(e.target.value))}
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
            {TIMER_DURATIONS.map(duration => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
            Default duration when you start a new timer
          </p>
        </div>

        {/* Timer Sound Toggle - Compact */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '10px'
        }}>
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#1F2937',
              marginBottom: '2px'
            }}>
              Timer Sound
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Play sound when timer completes
            </div>
          </div>
          <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '44px', 
            height: '24px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.5 : 1
          }}>
            <input
              type="checkbox"
              checked={timerSound}
              onChange={(e) => setTimerSound(e.target.checked)}
              disabled={isSaving}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: timerSound ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: timerSound ? '23px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
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