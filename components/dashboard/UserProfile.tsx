// components/dashboard/UserProfile.tsx
'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserProfileProps {
  username?: string;
  email?: string;
  profileImage?: string;
}

export default function UserProfile({ username = 'User', email = '', profileImage }: UserProfileProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 12px 6px 6px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          backgroundColor: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          height: '48px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB';
          e.currentTarget.style.borderColor = '#D1D5DB';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#E5E7EB';
        }}
      >
        {/* Profile Image */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#F4B000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          overflow: 'hidden'
        }}>
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={username}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            <span>{username.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* User Name */}
        <div style={{ 
          fontSize: '15px', 
          fontWeight: '600', 
          color: '#1F2937'
        }}>
          {username}
        </div>

        {/* Dropdown Arrow */}
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 16 16" 
          fill="none"
          style={{
            transition: 'transform 0.2s',
            transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke="#6B7280" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Profile Dropdown Menu */}
      {showProfileMenu && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setShowProfileMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
          />
          
          {/* Menu */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            minWidth: '240px',
            zIndex: 999,
            overflow: 'hidden'
          }}>
            {/* User Info Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #F3F4F6',
              backgroundColor: '#F9FAFB'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1F2937',
                marginBottom: '4px'
              }}>
                {username}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6B7280'
              }}>
                {email}
              </div>
            </div>

            {/* Trial Info */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>⏳</span>
              <div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#92400E'
                }}>
                  14 Days Trial Remaining
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#B45309'
                }}>
                  Upgrade to unlock all features
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={() => {
                  router.push('/dashboard/settings');
                  setShowProfileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#1F2937',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '18px' }}>⚙️</span>
                <span style={{ fontWeight: '500' }}>Settings</span>
              </button>

              <button
                onClick={() => {
                  router.push('/dashboard/billing');
                  setShowProfileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#1F2937',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '18px' }}>💳</span>
                <span style={{ fontWeight: '500' }}>Billing & Plans</span>
              </button>

              <button
                onClick={() => {
                  window.open('https://help.exeai.com', '_blank');
                  setShowProfileMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#1F2937',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '18px' }}>❓</span>
                <span style={{ fontWeight: '500' }}>Help & Support</span>
              </button>
            </div>

            {/* Sign Out */}
            <div style={{
              padding: '8px',
              borderTop: '1px solid #F3F4F6'
            }}>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#EF4444',
                  textAlign: 'left',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ fontSize: '18px' }}>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}