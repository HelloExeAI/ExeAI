// components/dashboard/Logo.tsx
'use client';

import React from 'react';
import Image from 'next/image';

export default function Logo() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      width: '120px',
      minWidth: '120px',
      maxWidth: '120px',
      height: '40px'
    }}>
      <Image 
        src="/assets/images/Ex_AI.png" 
        alt="ExeAI Logo" 
        width={120} 
        height={40}
        priority
        style={{ 
          objectFit: 'contain',
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}