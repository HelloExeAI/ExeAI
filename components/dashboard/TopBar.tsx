// components/dashboard/TopBar.tsx
'use client';

import React from 'react';
import Logo from './Logo';
import ClockWidget from './ClockWidget';
import UserProfile from './UserProfile';

interface TopBarProps {
  username?: string;
  email?: string;
  profileImage?: string;
}

export default function TopBar({ username = 'User', email = '', profileImage }: TopBarProps) {
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

      {/* Center-Left: Clock Widget */}
      <div style={{ 
        position: 'absolute',
        left: '260px'
      }}>
        <ClockWidget />
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