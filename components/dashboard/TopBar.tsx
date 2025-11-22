// src/components/dashboard/TopBar.tsx
'use client';

import React from 'react';
import Logo from './Logo';
import ClockWidget from './ClockWidget';
import CurrentEventWidget from './CurrentEventWidget';
import UserProfile from './UserProfile';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
}

interface TopBarProps {
  username?: string;
  email?: string;
  profileImage?: string;
  calendarEvents?: CalendarEvent[];
}

export default function TopBar({ 
  username = 'User', 
  email = '', 
  profileImage,
  calendarEvents = []
}: TopBarProps) {
  return (
    <div style={{
      height: '60px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Left: Logo */}
      <Logo />

      {/* Center-Left: Clock Widget + Current Event */}
      <div style={{ 
        position: 'absolute',
        left: '260px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ClockWidget />
        <CurrentEventWidget events={calendarEvents} />
      </div>

      {/* Right: User Profile */}
      <UserProfile 
        username={username}
        email={email}
        profileImage={profileImage}
      />
    </div>
  );
}