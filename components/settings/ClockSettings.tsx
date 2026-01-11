// src/components/settings/ClockSettings.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { UserSettings } from '@/types/settings';

interface ClockSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

// ALL TIMEZONES from UTC-12 to UTC+14
const TIMEZONES = [
  // UTC-12 to UTC-11
  { value: 'Etc/GMT+12', label: '(UTC-12:00) International Date Line West', offset: -12 },
  { value: 'Pacific/Midway', label: '(UTC-11:00) Midway Island, Samoa', offset: -11 },
  { value: 'Pacific/Niue', label: '(UTC-11:00) Niue', offset: -11 },
  { value: 'Pacific/Pago_Pago', label: '(UTC-11:00) Pago Pago', offset: -11 },

  // UTC-10
  { value: 'Pacific/Honolulu', label: '(UTC-10:00) Hawaii', offset: -10 },
  { value: 'Pacific/Rarotonga', label: '(UTC-10:00) Cook Islands', offset: -10 },
  { value: 'Pacific/Tahiti', label: '(UTC-10:00) Tahiti', offset: -10 },

  // UTC-09:30
  { value: 'Pacific/Marquesas', label: '(UTC-09:30) Marquesas Islands', offset: -9.5 },

  // UTC-09
  { value: 'America/Anchorage', label: '(UTC-09:00) Alaska', offset: -9 },
  { value: 'Pacific/Gambier', label: '(UTC-09:00) Gambier Islands', offset: -9 },

  // UTC-08
  { value: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (US & Canada)', offset: -8 },
  { value: 'America/Tijuana', label: '(UTC-08:00) Tijuana, Baja California', offset: -8 },
  { value: 'America/Vancouver', label: '(UTC-08:00) Vancouver', offset: -8 },

  // UTC-07
  { value: 'America/Denver', label: '(UTC-07:00) Mountain Time (US & Canada)', offset: -7 },
  { value: 'America/Phoenix', label: '(UTC-07:00) Arizona', offset: -7 },
  { value: 'America/Chihuahua', label: '(UTC-07:00) Chihuahua, La Paz, Mazatlan', offset: -7 },

  // UTC-06
  { value: 'America/Chicago', label: '(UTC-06:00) Central Time (US & Canada)', offset: -6 },
  { value: 'America/Mexico_City', label: '(UTC-06:00) Guadalajara, Mexico City, Monterrey', offset: -6 },
  { value: 'America/Regina', label: '(UTC-06:00) Saskatchewan', offset: -6 },
  { value: 'America/Guatemala', label: '(UTC-06:00) Central America', offset: -6 },

  // UTC-05
  { value: 'America/New_York', label: '(UTC-05:00) Eastern Time (US & Canada)', offset: -5 },
  { value: 'America/Toronto', label: '(UTC-05:00) Toronto', offset: -5 },
  { value: 'America/Bogota', label: '(UTC-05:00) Bogota, Lima, Quito', offset: -5 },
  { value: 'America/Lima', label: '(UTC-05:00) Lima', offset: -5 },
  { value: 'America/Panama', label: '(UTC-05:00) Panama', offset: -5 },

  // UTC-04
  { value: 'America/Caracas', label: '(UTC-04:00) Caracas', offset: -4 },
  { value: 'America/La_Paz', label: '(UTC-04:00) La Paz', offset: -4 },
  { value: 'America/Santiago', label: '(UTC-04:00) Santiago', offset: -4 },
  { value: 'America/Halifax', label: '(UTC-04:00) Atlantic Time (Canada)', offset: -4 },
  { value: 'America/Manaus', label: '(UTC-04:00) Manaus', offset: -4 },

  // UTC-03:30
  { value: 'America/St_Johns', label: '(UTC-03:30) Newfoundland', offset: -3.5 },

  // UTC-03
  { value: 'America/Sao_Paulo', label: '(UTC-03:00) Brasilia', offset: -3 },
  { value: 'America/Argentina/Buenos_Aires', label: '(UTC-03:00) Buenos Aires', offset: -3 },
  { value: 'America/Montevideo', label: '(UTC-03:00) Montevideo', offset: -3 },
  { value: 'America/Godthab', label: '(UTC-03:00) Greenland', offset: -3 },

  // UTC-02
  { value: 'America/Noronha', label: '(UTC-02:00) Mid-Atlantic', offset: -2 },
  { value: 'Atlantic/South_Georgia', label: '(UTC-02:00) South Georgia', offset: -2 },

  // UTC-01
  { value: 'Atlantic/Azores', label: '(UTC-01:00) Azores', offset: -1 },
  { value: 'Atlantic/Cape_Verde', label: '(UTC-01:00) Cape Verde Islands', offset: -1 },

  // UTC+00
  { value: 'Europe/London', label: '(UTC+00:00) London, Dublin, Lisbon', offset: 0 },
  { value: 'Europe/Lisbon', label: '(UTC+00:00) Lisbon', offset: 0 },
  { value: 'Africa/Casablanca', label: '(UTC+00:00) Casablanca', offset: 0 },
  { value: 'Atlantic/Reykjavik', label: '(UTC+00:00) Reykjavik', offset: 0 },
  { value: 'UTC', label: '(UTC+00:00) Coordinated Universal Time', offset: 0 },

  // UTC+01
  { value: 'Europe/Paris', label: '(UTC+01:00) Paris, Brussels, Copenhagen, Madrid', offset: 1 },
  { value: 'Europe/Berlin', label: '(UTC+01:00) Berlin, Rome, Stockholm, Vienna', offset: 1 },
  { value: 'Europe/Amsterdam', label: '(UTC+01:00) Amsterdam', offset: 1 },
  { value: 'Europe/Rome', label: '(UTC+01:00) Rome', offset: 1 },
  { value: 'Africa/Lagos', label: '(UTC+01:00) West Central Africa', offset: 1 },

  // UTC+02
  { value: 'Europe/Athens', label: '(UTC+02:00) Athens, Bucharest, Istanbul', offset: 2 },
  { value: 'Europe/Helsinki', label: '(UTC+02:00) Helsinki, Kiev, Riga, Sofia', offset: 2 },
  { value: 'Africa/Cairo', label: '(UTC+02:00) Cairo', offset: 2 },
  { value: 'Africa/Johannesburg', label: '(UTC+02:00) Johannesburg, Pretoria', offset: 2 },
  { value: 'Asia/Jerusalem', label: '(UTC+02:00) Jerusalem', offset: 2 },

  // UTC+03
  { value: 'Europe/Moscow', label: '(UTC+03:00) Moscow, St. Petersburg', offset: 3 },
  { value: 'Asia/Baghdad', label: '(UTC+03:00) Baghdad', offset: 3 },
  { value: 'Asia/Kuwait', label: '(UTC+03:00) Kuwait, Riyadh', offset: 3 },
  { value: 'Africa/Nairobi', label: '(UTC+03:00) Nairobi', offset: 3 },

  // UTC+03:30
  { value: 'Asia/Tehran', label: '(UTC+03:30) Tehran', offset: 3.5 },

  // UTC+04
  { value: 'Asia/Dubai', label: '(UTC+04:00) Abu Dhabi, Dubai, Muscat', offset: 4 },
  { value: 'Asia/Baku', label: '(UTC+04:00) Baku', offset: 4 },
  { value: 'Asia/Tbilisi', label: '(UTC+04:00) Tbilisi', offset: 4 },
  { value: 'Asia/Yerevan', label: '(UTC+04:00) Yerevan', offset: 4 },

  // UTC+04:30
  { value: 'Asia/Kabul', label: '(UTC+04:30) Kabul', offset: 4.5 },

  // UTC+05
  { value: 'Asia/Karachi', label: '(UTC+05:00) Islamabad, Karachi', offset: 5 },
  { value: 'Asia/Tashkent', label: '(UTC+05:00) Tashkent', offset: 5 },

  // UTC+05:30
  { value: 'Asia/Kolkata', label: '(UTC+05:30) India (Chennai, Kolkata, Mumbai, New Delhi)', offset: 5.5 },
  { value: 'Asia/Colombo', label: '(UTC+05:30) Sri Jayawardenepura', offset: 5.5 },

  // UTC+05:45
  { value: 'Asia/Kathmandu', label: '(UTC+05:45) Kathmandu', offset: 5.75 },

  // UTC+06
  { value: 'Asia/Dhaka', label: '(UTC+06:00) Dhaka', offset: 6 },
  { value: 'Asia/Almaty', label: '(UTC+06:00) Almaty', offset: 6 },

  // UTC+06:30
  { value: 'Asia/Yangon', label: '(UTC+06:30) Yangon (Rangoon)', offset: 6.5 },

  // UTC+07
  { value: 'Asia/Bangkok', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta', offset: 7 },
  { value: 'Asia/Jakarta', label: '(UTC+07:00) Jakarta', offset: 7 },

  // UTC+08
  { value: 'Asia/Shanghai', label: '(UTC+08:00) Beijing, Chongqing, Hong Kong, Shanghai', offset: 8 },
  { value: 'Asia/Singapore', label: '(UTC+08:00) Singapore', offset: 8 },
  { value: 'Asia/Taipei', label: '(UTC+08:00) Taipei', offset: 8 },
  { value: 'Australia/Perth', label: '(UTC+08:00) Perth', offset: 8 },
  { value: 'Asia/Kuala_Lumpur', label: '(UTC+08:00) Kuala Lumpur', offset: 8 },

  // UTC+09
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Tokyo, Osaka, Sapporo', offset: 9 },
  { value: 'Asia/Seoul', label: '(UTC+09:00) Seoul', offset: 9 },

  // UTC+09:30
  { value: 'Australia/Adelaide', label: '(UTC+09:30) Adelaide', offset: 9.5 },
  { value: 'Australia/Darwin', label: '(UTC+09:30) Darwin', offset: 9.5 },

  // UTC+10
  { value: 'Australia/Sydney', label: '(UTC+10:00) Sydney, Melbourne, Canberra', offset: 10 },
  { value: 'Australia/Brisbane', label: '(UTC+10:00) Brisbane', offset: 10 },
  { value: 'Australia/Hobart', label: '(UTC+10:00) Hobart', offset: 10 },
  { value: 'Pacific/Guam', label: '(UTC+10:00) Guam, Port Moresby', offset: 10 },

  // UTC+11
  { value: 'Pacific/Noumea', label: '(UTC+11:00) Solomon Islands, New Caledonia', offset: 11 },
  { value: 'Asia/Magadan', label: '(UTC+11:00) Magadan', offset: 11 },

  // UTC+12
  { value: 'Pacific/Auckland', label: '(UTC+12:00) Auckland, Wellington', offset: 12 },
  { value: 'Pacific/Fiji', label: '(UTC+12:00) Fiji, Marshall Islands', offset: 12 },
  { value: 'Asia/Kamchatka', label: '(UTC+12:00) Kamchatka', offset: 12 },

  // UTC+13
  { value: 'Pacific/Tongatapu', label: '(UTC+13:00) Nuku\'alofa', offset: 13 },
  { value: 'Pacific/Apia', label: '(UTC+13:00) Samoa', offset: 13 },

  // UTC+14
  { value: 'Pacific/Kiritimati', label: '(UTC+14:00) Kiritimati Island', offset: 14 },
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

interface CityResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export default function ClockSettings({ settings, onUpdate, isSaving }: ClockSettingsProps) {
  const [showSeconds, setShowSeconds] = useState(settings.clockShowSeconds);
  const [timezone, setTimezone] = useState(settings.clockTimezone);
  const [timerDuration, setTimerDuration] = useState(settings.timerDefaultDuration);
  const [timerSound, setTimerSound] = useState(settings.timerSoundEnabled);

  const handleSave = async () => {
    await onUpdate({
      clockShowSeconds: showSeconds,
      clockTimezone: timezone,
      // Weather location is derived from timezone
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