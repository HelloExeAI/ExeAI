// src/components/settings/SettingsLayout.tsx
'use client';

import { useRouter } from 'next/navigation';

interface SettingsLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const TABS = [
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'clock', label: 'Clock', icon: '🕐' },
  { id: 'workspace', label: 'Workspace', icon: '💼' },
  { id: 'todos', label: 'Todo List', icon: '✅' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
];

export default function SettingsLayout({ currentTab, onTabChange, children }: SettingsLayoutProps) {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)',
        padding: '16px 16px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
      }}>
        {/* Floating Close Button */}
        <button
          onClick={handleBackToDashboard}
          title="Back to Dashboard"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            color: '#6B7280',
            fontSize: '20px',
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 101,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F4B000';
            e.currentTarget.style.backgroundColor = '#FFFBEB';
            e.currentTarget.style.color = '#F4B000';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 176, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          }}
        >
          ×
        </button>

        {/* Compact Header Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#1F2937',
              margin: 0
            }}>
              Settings
            </h1>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6B7280',
            margin: 0,
            paddingLeft: '30px'
          }}>
            Manage your EXEAI workspace preferences
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
      }}>
        {/* Main Container - Compact */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '16px'
        }}>
          {/* Sidebar Tabs - Sticky */}
          <div style={{
            height: 'fit-content',
            position: 'sticky',
            top: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: currentTab === tab.id ? '#F4B000' : 'transparent',
                      color: currentTab === tab.id ? 'white' : '#374151',
                      fontSize: '13px',
                      fontWeight: currentTab === tab.id ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (currentTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            minHeight: '500px'
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}