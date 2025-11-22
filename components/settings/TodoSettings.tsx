// src/components/settings/TodoSettings.tsx
'use client';

import { useState } from 'react';
import { UserSettings } from '@/types/settings';

interface TodoSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

export default function TodoSettings({ settings, onUpdate, isSaving }: TodoSettingsProps) {
  const [defaultPriority, setDefaultPriority] = useState(settings.todoDefaultPriority || 'medium');
  const [showCompleted, setShowCompleted] = useState(settings.todoShowCompleted ?? true);
  const [autoArchiveDays, setAutoArchiveDays] = useState(settings.todoAutoArchiveDays || 30);
  const [sortBy, setSortBy] = useState(settings.todoSortBy || 'date');
  const [remindersEnabled, setRemindersEnabled] = useState(settings.todoRemindersEnabled ?? true);

  const handleSave = async () => {
    await onUpdate({
      todoDefaultPriority: defaultPriority,
      todoShowCompleted: showCompleted,
      todoAutoArchiveDays: autoArchiveDays,
      todoSortBy: sortBy,
      todoRemindersEnabled: remindersEnabled,
    });
  };

  const hasChanges = 
    defaultPriority !== (settings.todoDefaultPriority || 'medium') ||
    showCompleted !== (settings.todoShowCompleted ?? true) ||
    autoArchiveDays !== (settings.todoAutoArchiveDays || 30) ||
    sortBy !== (settings.todoSortBy || 'date') ||
    remindersEnabled !== (settings.todoRemindersEnabled ?? true);

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
          To-Do List Settings
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: '#6B7280', 
          margin: 0 
        }}>
          Customize how your tasks are organized and displayed
        </p>
      </div>

      {/* Task Preferences */}
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
          Task Preferences
        </h3>

        {/* Default Priority */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Default Priority
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'low', label: 'Low', icon: '🟢' },
              { value: 'medium', label: 'Medium', icon: '🟡' },
              { value: 'high', label: 'High', icon: '🔴' }
            ].map((priority) => (
              <button
                key={priority.value}
                onClick={() => setDefaultPriority(priority.value as any)}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: defaultPriority === priority.value ? '2px solid #F4B000' : '1px solid #E5E7EB',
                  backgroundColor: defaultPriority === priority.value ? '#FFFBEB' : 'white',
                  color: defaultPriority === priority.value ? '#F4B000' : '#374151',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>{priority.icon}</span>
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Sort Tasks By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
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
            <option value="date">Date Created</option>
            <option value="priority">Priority Level</option>
            <option value="manual">Manual Order</option>
          </select>
        </div>
      </div>

      {/* Display Options */}
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
          Display Options
        </h3>

        {/* Show Completed Tasks */}
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
              Show Completed Tasks
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Display tasks you've already finished
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
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
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
              backgroundColor: showCompleted ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: showCompleted ? '23px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Auto-Archive Days */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Auto-Archive Completed Tasks After
          </label>
          <select
            value={autoArchiveDays}
            onChange={(e) => setAutoArchiveDays(Number(e.target.value))}
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
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={0}>Never</option>
          </select>
          <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', marginBottom: 0 }}>
            Automatically archive completed tasks after this period
          </p>
        </div>
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

        {/* Task Reminders */}
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
              Task Reminders
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Get notified about upcoming tasks
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
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
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
              backgroundColor: remindersEnabled ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: remindersEnabled ? '23px' : '3px',
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