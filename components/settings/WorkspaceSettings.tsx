'use client';

import React, { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';

export interface WorkspaceSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => Promise<void>;
  isSaving: boolean;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ settings, onUpdate, isSaving }) => {
  const [analysisMode, setAnalysisMode] = useState<'manual' | 'automatic' | 'off'>('manual');

  useEffect(() => {
    // Load saved settings from props or localStorage
    const savedMode = settings.workspaceThemeMode || localStorage.getItem('aiAnalysisMode');
    if (savedMode && ['manual', 'automatic', 'off'].includes(savedMode)) {
      setAnalysisMode(savedMode as 'manual' | 'automatic' | 'off');
    }
  }, [settings.workspaceThemeMode]);

  const handleSave = async () => {
    // Save to localStorage
    localStorage.setItem('aiAnalysisMode', analysisMode);
    
    // Update settings via onUpdate prop
    await onUpdate({ workspaceThemeMode: analysisMode });
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>
        Workspace Settings
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
        Configure how your workspace behaves
      </p>

      {/* AI Analysis Mode */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
          🤖 AI Analysis
        </h3>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          Choose how AI analyzes your notes and provides suggestions
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            border: `2px solid ${analysisMode === 'automatic' ? '#F4B000' : '#E5E7EB'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            backgroundColor: analysisMode === 'automatic' ? '#FEF3C7' : 'white',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="analysisMode"
              value="automatic"
              checked={analysisMode === 'automatic'}
              onChange={(e) => setAnalysisMode(e.target.value as 'automatic')}
              style={{ marginRight: '12px', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                Automatic Analysis
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                AI analyzes every line as you type and provides real-time suggestions
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            border: `2px solid ${analysisMode === 'manual' ? '#F4B000' : '#E5E7EB'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            backgroundColor: analysisMode === 'manual' ? '#FEF3C7' : 'white',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="analysisMode"
              value="manual"
              checked={analysisMode === 'manual'}
              onChange={(e) => setAnalysisMode(e.target.value as 'manual')}
              style={{ marginRight: '12px', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                Manual Analysis (Recommended)
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                AI only analyzes when you explicitly use commands like /todo, /call, etc.
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            border: `2px solid ${analysisMode === 'off' ? '#F4B000' : '#E5E7EB'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            backgroundColor: analysisMode === 'off' ? '#FEF3C7' : 'white',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="analysisMode"
              value="off"
              checked={analysisMode === 'off'}
              onChange={(e) => setAnalysisMode(e.target.value as 'off')}
              style={{ marginRight: '12px', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                Off
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Disable all AI analysis and suggestions
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '12px 32px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#F4B000',
            color: 'white',
            fontSize: '14px',
            fontWeight: '700',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.backgroundColor = '#D49A00';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F4B000';
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;