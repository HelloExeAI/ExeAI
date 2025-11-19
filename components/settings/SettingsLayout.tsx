// src/components/settings/SettingsLayout.tsx
'use client';

import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface SettingsLayoutProps {
  children: ReactNode;
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

const TABS: Tab[] = [
  { id: 'calendar', label: 'Calendar', icon: '🗓️' },
  { id: 'clock', label: 'Clock & Time', icon: '⏰' },
  { id: 'workspace', label: 'Workspace', icon: '💼' },
  { id: 'todos', label: 'To-Do List', icon: '✅' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
];

export default function SettingsLayout({ children, currentTab, onTabChange }: SettingsLayoutProps) {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#F9FAFB'
    }}>
      {/* Left Sidebar - Tabs */}
      <div style={{
        width: '260px',
        backgroundColor: 'white',
        borderRight: '1px solid #E5E7EB',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1F2937',
            marginBottom: '4px'
          }}>
            Settings
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6B7280'
          }}>
            Manage your EXEAI preferences
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: currentTab === tab.id ? '#FFFBEB' : 'transparent',
                color: currentTab === tab.id ? '#1F2937' : '#6B7280',
                fontSize: '14px',
                fontWeight: currentTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (currentTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }
              }}
              onMouseLeave={(e) => {
                if (currentTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div style={{
        marginLeft: '260px',
        flex: 1,
        padding: '40px',
        maxWidth: '1200px'
      }}>
        {children}
      </div>
    </div>
  );
}