// src/components/settings/PreferencesSettings.tsx
'use client';

import { useState } from 'react';
import { UserSettings } from '@/types/settings';

interface PreferencesSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

export default function PreferencesSettings({ settings, onUpdate, isSaving }: PreferencesSettingsProps) {
  const [language, setLanguage] = useState(settings.language || 'en');
  const [dateFormat, setDateFormat] = useState(settings.dateFormat || 'DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat || '12h');
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled ?? true);

  const handleSave = async () => {
    await onUpdate({
      language: language,
      dateFormat: dateFormat,
      timeFormat: timeFormat,
      notificationsEnabled: notificationsEnabled,
      soundEnabled: soundEnabled,
    });
  };

  const hasChanges = 
    language !== (settings.language || 'en') ||
    dateFormat !== (settings.dateFormat || 'DD/MM/YYYY') ||
    timeFormat !== (settings.timeFormat || '12h') ||
    notificationsEnabled !== (settings.notificationsEnabled ?? true) ||
    soundEnabled !== (settings.soundEnabled ?? true);

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
          General Preferences
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: '#6B7280', 
          margin: 0 
        }}>
          Customize your general application preferences
        </p>
      </div>

      {/* Language & Regional */}
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
          Language & Regional
        </h3>

        {/* Language */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
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
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="zh">中文 (Chinese)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="ar">العربية (Arabic)</option>
          </select>
        </div>

        {/* Date Format */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Date Format
          </label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
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
            <option value="DD/MM/YYYY">DD/MM/YYYY (22/11/2025)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (11/22/2025)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-11-22)</option>
            <option value="DD-MMM-YYYY">DD-MMM-YYYY (22-Nov-2025)</option>
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Time Format
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: '12h', label: '12-hour (2:30 PM)' },
              { value: '24h', label: '24-hour (14:30)' }
            ].map((format) => (
              <button
                key={format.value}
                onClick={() => setTimeFormat(format.value as any)}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: timeFormat === format.value ? '2px solid #F4B000' : '1px solid #E5E7EB',
                  backgroundColor: timeFormat === format.value ? '#FFFBEB' : 'white',
                  color: timeFormat === format.value ? '#F4B000' : '#374151',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications & Sounds */}
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
          Notifications & Sounds
        </h3>

        {/* Enable Notifications */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '10px',
          marginBottom: '10px'
        }}>
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#1F2937',
              marginBottom: '2px'
            }}>
              Enable Notifications
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Get notifications for important updates
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
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
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
              backgroundColor: notificationsEnabled ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: notificationsEnabled ? '23px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Enable Sound */}
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
              Enable Sound
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Play sounds for notifications and alerts
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
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
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
              backgroundColor: soundEnabled ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: soundEnabled ? '23px' : '3px',
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