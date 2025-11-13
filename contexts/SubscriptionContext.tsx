'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SubscriptionTier = 'free_trial' | 'pro' | 'business' | 'expired';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  trialDaysLeft: number;
  isTrialActive: boolean;
  hasProAccess: boolean;
  hasBusinessAccess: boolean;
  updateTier: (newTier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>('free_trial');
  const [trialStartDate] = useState<Date>(new Date());
  
  const calculateTrialDaysLeft = (): number => {
    const now = new Date();
    const diffTime = 14 * 24 * 60 * 60 * 1000 - (now.getTime() - trialStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const [trialDaysLeft, setTrialDaysLeft] = useState(calculateTrialDaysLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      const daysLeft = calculateTrialDaysLeft();
      setTrialDaysLeft(daysLeft);
      
      if (daysLeft === 0 && tier === 'free_trial') {
        setTier('expired');
      }
    }, 3600000);

    return () => clearInterval(interval);
  }, [tier]);

  const isTrialActive = tier === 'free_trial' && trialDaysLeft > 0;
  const hasProAccess = tier === 'pro' || tier === 'business' || isTrialActive;
  const hasBusinessAccess = tier === 'business' || isTrialActive;

  const updateTier = (newTier: SubscriptionTier) => {
    setTier(newTier);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        trialDaysLeft,
        isTrialActive,
        hasProAccess,
        hasBusinessAccess,
        updateTier,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}