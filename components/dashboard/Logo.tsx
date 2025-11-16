// components/dashboard/Logo.tsx
'use client';

import React from 'react';

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src="/assets/images/Ex_AI.png" 
        alt="ExeAI Logo" 
        width={80} 
        height={32}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}