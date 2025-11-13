'use client';

import { useState, useEffect } from 'react';

interface ClockSettings {
  location: string;
  dualClock: boolean;
  timezone2: string;
  format24: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

const TIMEZONES = [
  { label: 'New York (EST)', value: 'America/New_York', offset: -5 },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles', offset: -8 },
  { label: 'London (GMT)', value: 'Europe/London', offset: 0 },
  { label: 'Paris (CET)', value: 'Europe/Paris', offset: 1 },
  { label: 'Dubai (GST)', value: 'Asia/Dubai', offset: 4 },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore', offset: 8 },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo', offset: 9 },
  { label: 'Sydney (AEDT)', value: 'Australia/Sydney', offset: 11 },
];

const getCountryCode = (timezone: string): string => {
  switch (timezone) {
    case 'America/New_York':
    case 'America/Los_Angeles':
      return 'USA';
    case 'Europe/London':
      return 'UK';
    case 'Europe/Paris':
      return 'FR';
    case 'Asia/Dubai':
      return 'UAE';
    case 'Asia/Singapore':
      return 'SGP';
    case 'Asia/Tokyo':
      return 'JPN';
    case 'Australia/Sydney':
      return 'AUS';
    default:
      return 'INT';
  }
};

export default function Clock() {
  // Removed the subscription destructuring
  // Instead, hardcode access for now
  const hasProAccess = true;
  const tier = 'pro';
  const trialDaysLeft = 0;
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTimerComplete, setShowTimerComplete] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const [settings, setSettings] = useState<ClockSettings>({
    location: 'Bengaluru,IN',
    dualClock: false,
    timezone2: 'America/New_York',
    format24: false
  });

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather fetch
  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = 'a3418c431a042bf88b50016c0204f927';
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${settings.location}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        
        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            icon: getWeatherIcon(data.weather[0].main)
          });
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [settings.location]);

  // Timer countdown with notification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            setShowTimer(false);
            setShowTimerComplete(true);
            
            // Play notification sound
            if (typeof Audio !== 'undefined') {
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=');
                audio.play().catch(() => {});
              } catch (e) {
                console.log('Audio not supported');
              }
            }
            
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Complete! ⏰', {
                body: 'Your timer has finished. Time to take a break!',
                requireInteraction: true
              });
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getWeatherIcon = (condition: string): string => {
    switch (condition.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'drizzle': return '🌦️';
      case 'thunderstorm': return '⛈️';
      case 'snow': return '❄️';
      case 'mist':
      case 'fog': return '🌫️';
      default: return '🌤️';
    }
  };

  const getWeatherGradient = (condition: string): string => {
    switch (condition?.toLowerCase()) {
      case 'clear':
        return 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)';
      case 'clouds':
        return 'linear-gradient(135deg, #90A4AE 0%, #78909C 100%)';
      case 'rain':
      case 'drizzle':
        return 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)';
      case 'thunderstorm':
        return 'linear-gradient(135deg, #424242 0%, #212121 100%)';
      case 'snow':
        return 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)';
      case 'mist':
      case 'fog':
        return 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)';
      default:
        return 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)';
    }
  };

  const formatTime = (date: Date, format24: boolean) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    if (format24) {
      return {
        time: `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`,
        period: ''
      };
    } else {
      const displayHours = hours % 12 || 12;
      const period = hours >= 12 ? 'PM' : 'AM';
      return {
        time: `${displayHours}:${minutes}:${seconds}`,
        period
      };
    }
  };

  const getSecondaryTime = () => {
    const tz = TIMEZONES.find(t => t.value === settings.timezone2);
    if (!tz) return formatTime(currentTime, settings.format24);
    
    const offset = tz.offset - 5.5;
    const secondaryDate = new Date(currentTime.getTime() + offset * 3600000);
    return formatTime(secondaryDate, settings.format24);
  };

  const formatTimerDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProFeatureClick = (feature: string) => {
    // Since we're setting hasProAccess to true, this will always show the requested feature
    if (feature === 'timer') setShowTimer(true);
    if (feature === 'settings') setShowSettings(true);
  };

  const primaryTime = formatTime(currentTime, settings.format24);
  const secondaryTime = (settings.dualClock && hasProAccess) ? getSecondaryTime() : null;

  return (
    <>
      {/* Clock Widget */}
      <div 
        style={{ 
          background: getWeatherGradient(weather?.condition || 'clear'),
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '16px',
          color: 'white',
          position: 'relative',
          minHeight: '140px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '0.05em', opacity: 0.9 }}>
            {settings.location.split(',')[0].toUpperCase()}
            {settings.dualClock && hasProAccess && (
              <div style={{ marginTop: '2px', opacity: 0.8 }}>
                {TIMEZONES.find(t => t.value === settings.timezone2)?.label.split('(')[0].trim().toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => handleProFeatureClick('timer')}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                fontSize: '12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ⏱️
            </button>
            <button 
              onClick={() => handleProFeatureClick('settings')}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                fontSize: '12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >⚙️</button>
          </div>
        </div>
        
        {!settings.dualClock || !hasProAccess ? (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '32px', fontWeight: '300', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {primaryTime.time}
            </div>
            {primaryTime.period && (
              <div style={{ fontSize: '16px', fontWeight: '300', marginTop: '2px' }}>
                {primaryTime.period}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: '300', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                {primaryTime.time}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '300', opacity: 0.9 }}>
                {primaryTime.period}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7, marginLeft: '2px' }}>
                IND
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: '300', opacity: 0.85 }}>
                {secondaryTime?.time}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '300', opacity: 0.8 }}>
                {secondaryTime?.period}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '600', opacity: 0.7, marginLeft: '2px' }}>
                {getCountryCode(settings.timezone2)}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>{weather?.icon || '🌤️'}</span>
          <span style={{ fontSize: '20px', fontWeight: '300' }}>{weather?.temp || '--'}°C</span>
          <span style={{ fontSize: '11px', opacity: 0.9 }}>{weather?.condition || 'Loading...'}</span>
        </div>
      </div>

      {/* Timer Modal */}
      {showTimer && hasProAccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowTimer(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '300px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>Timer</h3>
              <button 
                onClick={() => setShowTimer(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280', padding: 0 }}
              >×</button>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '300', color: '#1F2937', marginBottom: '20px' }}>
                {formatTimerDisplay(timerSeconds)}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                {[1, 5, 10, 15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setTimerSeconds(mins * 60)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1F2937'
                    }}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (timerSeconds > 0) {
                      setTimerRunning(!timerRunning);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: timerRunning ? '#EF4444' : '#10B981',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setTimerSeconds(0);
                    setTimerRunning(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    color: '#1F2937',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowSettings(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '320px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>Clock Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280', padding: 0 }}
              >×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                  Primary Location
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  placeholder="City,Country"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    color: '#1F2937',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    cursor: 'text'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                    Dual Clock
                  </label>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.dualClock}
                    onChange={(e) => setSettings({ ...settings, dualClock: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: settings.dualClock ? '#10B981' : '#E5E7EB',
                    transition: '0.3s',
                    borderRadius: '26px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: settings.dualClock ? '25px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.3s',
                      borderRadius: '50%'
                    }}></span>
                  </span>
                </label>
              </div>

              {settings.dualClock && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                    Secondary Timezone
                  </label>
                  <select
                    value={settings.timezone2}
                    onChange={(e) => setSettings({ ...settings, timezone2: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#1F2937' }}>
                  24-Hour Format
                </label>
                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.format24}
                    onChange={(e) => setSettings({ ...settings, format24: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: settings.format24 ? '#10B981' : '#E5E7EB',
                    transition: '0.3s',
                    borderRadius: '26px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: settings.format24 ? '25px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.3s',
                      borderRadius: '50%'
                    }}></span>
                  </span>
                </label>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '8px'
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Complete Notification */}
      {showTimerComplete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
        onClick={() => setShowTimerComplete(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '40px',
              width: '380px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              textAlign: 'center',
              border: '3px solid #10B981'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>⏰</div>
            
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#1F2937',
              letterSpacing: '-0.02em'
            }}>
              Time's Up!
            </h3>
            
            <p style={{ 
              color: '#6B7280', 
              fontSize: '16px', 
              marginBottom: '32px',
              lineHeight: 1.6
            }}>
              Your timer has completed successfully.<br/>
              Great job staying focused! 🎯
            </p>
            
            <div style={{ 
              backgroundColor: '#F0FDF4', 
              padding: '16px', 
              borderRadius: '12px',
              marginBottom: '24px',
              border: '2px solid #10B981'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#059669',
                marginBottom: '4px'
              }}>
                ✓ Session Complete
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#047857'
              }}>
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowTimerComplete(false);
                  setShowTimer(true);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: '2px solid #10B981',
                  backgroundColor: 'white',
                  color: '#10B981',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Start New Timer
              </button>
              <button
                onClick={() => setShowTimerComplete(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#10B981',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}