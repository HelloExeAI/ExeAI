// components/dashboard/ClockWidget.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; 
import Logo from './Logo';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  timezone: number; // Timezone offset in seconds
}

interface ClockSettings {
  location: string;
  format24: boolean;
}

interface LocationSuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export default function ClockWidget() {
  const [showClockSettings, setShowClockSettings] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [settings, setSettings] = useState<ClockSettings>({
    location: 'Bengaluru,IN',
    format24: false
  });

  // Clock timer - updates every second
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
            icon: getWeatherIcon(data.weather[0].main),
            timezone: data.timezone // Store timezone offset
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

  // Location search with OpenWeather Geocoding API
  useEffect(() => {
    if (locationInput.trim().length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const API_KEY = 'a3418c431a042bf88b50016c0204f927';
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${locationInput}&limit=10&appid=${API_KEY}`
          );
          const data = await response.json();
          setLocationSuggestions(data);
        } catch (error) {
          console.error('Location search error:', error);
        }
      }, 300);
    } else {
      setLocationSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationInput]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Complete! ⏰', {
                body: 'Your timer has finished!',
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

  // Get time adjusted for the location's timezone
  const getLocalTime = (): Date => {
    if (!weather?.timezone) {
      return new Date(); // Fallback to system time if no weather data yet
    }
    
    // Get current UTC time in milliseconds
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // Add location's timezone offset (weather.timezone is in seconds, convert to milliseconds)
    const localTime = new Date(utcTime + (weather.timezone * 1000));
    
    return localTime;
  };

  // Update local time every second
  const [localTime, setLocalTime] = useState(getLocalTime());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(getLocalTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [weather?.timezone]); // Re-run when timezone changes

  const getWeatherConditionText = (condition: string, localTime: Date): string => {
    const hours = localTime.getHours();
    const isNight = hours >= 19 || hours < 6;
    
    if (isNight) return 'Night';
    
    switch (condition?.toLowerCase()) {
      case 'clear': return 'Sunny';
      case 'clouds': return 'Cloudy';
      case 'rain': return 'Rainy';
      case 'drizzle': return 'Drizzling';
      case 'thunderstorm': return 'Stormy';
      case 'snow': return 'Snowy';
      case 'mist': return 'Misty';
      case 'fog': return 'Foggy';
      default: return 'Clear';
    }
  };

  const getWeatherGradient = (condition: string, localTime: Date): string => {
    const hours = localTime.getHours();
    const isNight = hours >= 19 || hours < 6;
    
    // Night time gradient (dark blue/purple)
    if (isNight) {
      return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    }
    
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
        return 'linear-gradient(135deg, #B0BEC5 0%, #90A4AE 100%)';
      default:
        return 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)';
    }
  };

  const renderWeatherAnimation = (condition: string, localTime: Date) => {
    const weatherType = condition?.toLowerCase();
    const hours = localTime.getHours();
    const isNight = hours >= 19 || hours < 6;
    
    // Night time - no animation, just clean gradient
    if (isNight) {
      return null;
    }
    
    switch (weatherType) {
      case 'clear':
        return (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: '80px',
                  width: '3px',
                  height: '80px',
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent)',
                  transformOrigin: 'top center',
                  transform: `rotate(${i * 30}deg)`,
                  animation: 'sunRays 4s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '68px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
              animation: 'sunGlow 3s ease-in-out infinite'
            }} />
          </div>
        );
      
      case 'clouds':
        return (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                style={{
                  position: 'absolute',
                  top: `${15 + i * 15}%`,
                  left: '-15%',
                  width: '100px',
                  height: '40px',
                  opacity: 0.3,
                  animation: `cloudFloat ${10 + i * 3}s linear infinite`,
                  animationDelay: `${i * 3}s`
                }}
                viewBox="0 0 100 40"
              >
                <ellipse cx="25" cy="25" rx="20" ry="15" fill="white" />
                <ellipse cx="45" cy="20" rx="25" ry="18" fill="white" />
                <ellipse cx="70" cy="25" rx="20" ry="15" fill="white" />
                <ellipse cx="55" cy="28" rx="15" ry="10" fill="white" />
              </svg>
            ))}
          </div>
        );
      
      case 'rain':
      case 'drizzle':
        return (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-5%',
                  left: `${(i * 5) % 100}%`,
                  width: '2px',
                  height: '20px',
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2))',
                  animation: `rainFall ${0.4 + Math.random() * 0.4}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'snow':
        return (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-5%',
                  left: `${(i * 7) % 100}%`,
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  animation: `snowFall ${2.5 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              >
                ❄
              </div>
            ))}
          </div>
        );
      
      case 'thunderstorm':
        return (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.4)',
                animation: 'lightning 5s ease-in-out infinite'
              }}
            />
          </div>
        );
      
      default:
        return null;
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

  const formatTimerDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    const locationString = `${location.name},${location.country}`;
    setSettings({ ...settings, location: locationString });
    setLocationInput(locationString);
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  const primaryTime = formatTime(localTime, settings.format24);

  return (
    <>
      {/* Clock Widget */}
      <div style={{ position: 'relative' }}>
        <div 
          style={{ 
            background: getWeatherGradient(weather?.condition || 'clear', localTime),
            borderRadius: '12px',
            padding: '0 20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            height: '48px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Weather Animation Overlay */}
          {renderWeatherAnimation(weather?.condition || 'clear', localTime)}

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
            {/* Location */}
            <div style={{ 
              fontSize: '9px', 
              fontWeight: '700', 
              letterSpacing: '0.05em', 
              opacity: 0.9,
              textTransform: 'uppercase',
              minWidth: '70px'
            }}>
              {settings.location.split(',')[0]}
            </div>
            
            {/* Time Display */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: '6px',
              minWidth: '140px'
            }}>
              <span style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                lineHeight: 1,
                letterSpacing: '-0.02em'
              }}>
                {primaryTime.time}
              </span>
              {primaryTime.period && (
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  opacity: 0.95
                }}>
                  {primaryTime.period}
                </span>
              )}
            </div>

            {/* Weather Info */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              borderLeft: '1px solid rgba(255,255,255,0.3)',
              paddingLeft: '16px',
              minWidth: '120px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1 }}>
                  {weather?.temp || '--'}°C
                </span>
                <span style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                  {getWeatherConditionText(weather?.condition || 'clear', localTime)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ 
              width: '1px', 
              height: '28px', 
              background: 'rgba(255,255,255,0.3)' 
            }}></div>

            {/* Timer Button */}
            <button 
              onClick={() => setShowTimer(true)}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                fontSize: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              title="Timer"
            >
              ⏱️
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setShowClockSettings(true)}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                fontSize: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              title="Clock Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Timer Modal */}
      {showTimer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setShowTimer(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              width: '340px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              position: 'relative',
              zIndex: 10001
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>⏱️ Timer</h3>
              <button 
                onClick={() => setShowTimer(false)}
                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6B7280', padding: 0 }}
              >×</button>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', fontWeight: '300', color: '#1F2937', marginBottom: '24px', fontFamily: 'monospace' }}>
                {formatTimerDisplay(timerSeconds)}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[1, 5, 10, 15, 30, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setTimerSeconds(mins * 60)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: '2px solid #E5E7EB',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#1F2937',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3B82F6';
                      e.currentTarget.style.backgroundColor = '#EFF6FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (timerSeconds > 0) {
                      setTimerRunning(!timerRunning);
                    }
                  }}
                  disabled={timerSeconds === 0}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: timerSeconds === 0 ? '#E5E7EB' : (timerRunning ? '#EF4444' : '#10B981'),
                    color: 'white',
                    cursor: timerSeconds === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '700',
                    transition: 'all 0.2s'
                  }}
                >
                  {timerRunning ? '⏸ Pause' : '▶ Start'}
                </button>
                <button
                  onClick={() => {
                    setTimerSeconds(0);
                    setTimerRunning(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '10px',
                    border: '2px solid #E5E7EB',
                    backgroundColor: 'white',
                    color: '#1F2937',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '700',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clock Settings Modal */}
      {showClockSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setShowClockSettings(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              width: '360px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              position: 'relative',
              zIndex: 10001
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>⚙️ Clock Settings</h3>
              <button 
                onClick={() => setShowClockSettings(false)}
                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#6B7280', padding: 0 }}
              >×</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Location Input with API Autocomplete */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#6B7280', marginBottom: '10px' }}>
                  Primary Location
                </label>
                <input
                  ref={locationInputRef}
                  type="text"
                  value={locationInput || settings.location}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => {
                    setLocationInput('');
                    setShowLocationDropdown(true);
                  }}
                  placeholder="Type city name..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '2px solid #E5E7EB',
                    fontSize: '15px',
                    color: '#1F2937',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocusCapture={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlurCapture={(e) => {
                    setTimeout(() => {
                      e.target.style.borderColor = '#E5E7EB';
                      setShowLocationDropdown(false);
                    }, 200);
                  }}
                />
                
                {/* Location Autocomplete Dropdown */}
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {locationSuggestions.map((location, index) => (
                      <div
                        key={`${location.lat}-${location.lon}-${index}`}
                        onClick={() => handleLocationSelect(location)}
                        style={{
                          padding: '12px 14px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#1F2937',
                          transition: 'background-color 0.2s',
                          borderBottom: index < locationSuggestions.length - 1 ? '1px solid #F3F4F6' : 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                          📍 {location.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {location.state ? `${location.state}, ` : ''}{location.country}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>
                  24-Hour Format
                </label>
                <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px', cursor: 'pointer' }}>
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
                    borderRadius: '28px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      height: '22px',
                      width: '22px',
                      left: settings.format24 ? '27px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      transition: '0.3s',
                      borderRadius: '50%'
                    }}></span>
                  </span>
                </label>
              </div>

              <button
                onClick={() => {
                  if (locationInput) {
                    setSettings({ ...settings, location: locationInput });
                  }
                  setShowClockSettings(false);
                  setLocationInput('');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginTop: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weather Animation Keyframes */}
      <style jsx global>{`
        @keyframes sunRays {
          0%, 100% { 
            opacity: 0.4;
            transform: rotate(0deg) scaleY(1);
          }
          50% { 
            opacity: 0.7;
            transform: rotate(0deg) scaleY(1.2);
          }
        }
        
        @keyframes sunGlow {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
          }
          50% { 
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
          }
        }
        
        @keyframes cloudFloat {
          0% { 
            left: -15%; 
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
          100% { 
            left: 115%; 
            opacity: 0.3;
          }
        }
        
        @keyframes rainFall {
          0% { 
            top: -5%; 
            opacity: 0.8;
          }
          100% { 
            top: 105%; 
            opacity: 0.2;
          }
        }
        
        @keyframes snowFall {
          0% { 
            top: -5%; 
            transform: translateX(0) rotate(0deg);
            opacity: 0.9;
          }
          100% { 
            top: 105%; 
            transform: translateX(30px) rotate(360deg);
            opacity: 0.5;
          }
        }
        
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          92%, 96% { opacity: 1; }
        }
      `}</style>
    </>
  );
}