// src/components/settings/WorkspaceSettings.tsx
'use client';

import { useState } from 'react';
import { UserSettings } from '@/types/settings';

interface WorkspaceSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

export default function WorkspaceSettings({ settings, onUpdate, isSaving }: WorkspaceSettingsProps) {
  const [themeMode, setThemeMode] = useState(settings.workspaceThemeMode || 'light');
  const [accentColor, setAccentColor] = useState(settings.workspaceAccentColor || '#F4B000');
  const [fontSize, setFontSize] = useState(settings.workspaceFontSize || 'medium');
  const [sidebarWidth, setSidebarWidth] = useState(settings.workspaceSidebarWidth || 'default');
  const [showLeftSidebar, setShowLeftSidebar] = useState(settings.workspaceShowLeftSidebar ?? true);
  const [showRightSidebar, setShowRightSidebar] = useState(settings.workspaceShowRightSidebar ?? true);

  const handleSave = async () => {
    await onUpdate({
      workspaceThemeMode: themeMode,
      workspaceAccentColor: accentColor,
      workspaceFontSize: fontSize,
      workspaceSidebarWidth: sidebarWidth,
      workspaceShowLeftSidebar: showLeftSidebar,
      workspaceShowRightSidebar: showRightSidebar,
    });
  };

  const hasChanges = 
    themeMode !== (settings.workspaceThemeMode || 'light') ||
    accentColor !== (settings.workspaceAccentColor || '#F4B000') ||
    fontSize !== (settings.workspaceFontSize || 'medium') ||
    sidebarWidth !== (settings.workspaceSidebarWidth || 'default') ||
    showLeftSidebar !== (settings.workspaceShowLeftSidebar ?? true) ||
    showRightSidebar !== (settings.workspaceShowRightSidebar ?? true);

  const ACCENT_COLORS = [
    { value: '#F4B000', name: 'Yellow (Default)' },
    { value: '#3B82F6', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: '#EF4444', name: 'Red' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#EC4899', name: 'Pink' },
  ];

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
          Workspace Settings
        </h2>
        <p style={{ 
          fontSize: '13px', 
          color: '#6B7280', 
          margin: 0 
        }}>
          Customize your workspace appearance and layout
        </p>
      </div>

      {/* Theme Mode */}
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
          Theme
        </h3>

        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Theme Mode
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['light', 'dark', 'auto'].map((mode) => (
              <button
                key={mode}
                onClick={() => setThemeMode(mode as any)}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: themeMode === mode ? '2px solid #F4B000' : '1px solid #E5E7EB',
                  backgroundColor: themeMode === mode ? '#FFFBEB' : 'white',
                  color: themeMode === mode ? '#F4B000' : '#374151',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {mode === 'auto' ? '🌓 Auto' : mode === 'light' ? '☀️ Light' : '🌙 Dark'}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Accent Color
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                disabled={isSaving}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: accentColor === color.value ? '2px solid ' + color.value : '1px solid #E5E7EB',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  backgroundColor: color.value,
                  border: '1px solid rgba(0,0,0,0.1)'
                }}></div>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Settings */}
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
          Layout
        </h3>

        {/* Font Size */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Font Size
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
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
            <option value="small">Small</option>
            <option value="medium">Medium (Default)</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Sidebar Width */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Sidebar Width
          </label>
          <select
            value={sidebarWidth}
            onChange={(e) => setSidebarWidth(e.target.value as any)}
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
            <option value="compact">Compact</option>
            <option value="default">Default</option>
            <option value="wide">Wide</option>
          </select>
        </div>

        {/* Show Left Sidebar */}
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
              Show Left Sidebar
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              Calendar and quick actions
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
              checked={showLeftSidebar}
              onChange={(e) => setShowLeftSidebar(e.target.checked)}
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
              backgroundColor: showLeftSidebar ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: showLeftSidebar ? '23px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Show Right Sidebar */}
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
              Show Right Sidebar
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>
              To-do list and inbox
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
              checked={showRightSidebar}
              onChange={(e) => setShowRightSidebar(e.target.checked)}
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
              backgroundColor: showRightSidebar ? '#F4B000' : '#D1D5DB',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: showRightSidebar ? '23px' : '3px',
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