// src/components/dashboard/ClockWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TimerModal from './TimerModal';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  timezone: number;
}

interface ClockSettings {
  location: string;
  showSeconds: boolean;
  timezone: string;
  timerDefaultDuration: number;
  timerSoundEnabled: boolean;
}

export default function ClockWidget() {
  const [showTimer, setShowTimer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [settings, setSettings] = useState<ClockSettings>({
    location: 'Bengaluru,IN',
    showSeconds: true,
    timezone: 'Asia/Kolkata',
    timerDefaultDuration: 300,
    timerSoundEnabled: true
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Fetch user settings from API
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          location: data.clockWeatherLocation || 'Bengaluru,IN',
          showSeconds: data.clockShowSeconds ?? true,
          timezone: data.clockTimezone || 'Asia/Kolkata',
          timerDefaultDuration: data.timerDefaultDuration || 300,
          timerSoundEnabled: data.timerSoundEnabled ?? true
        });
        setSettingsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to fetch clock settings:', error);
      setSettingsLoaded(true);
    }
  };

  // Clock timer - updates every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Weather fetch
  useEffect(() => {
    const fetchWeather = async () => {
      const API_KEY = 'a3418c431a042bf88b50016c0204f927';
      const city = getCityFromTimezone(settings.timezone);

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            icon: getWeatherIcon(data.weather[0].main),
            timezone: data.timezone
          });
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };

    if (settingsLoaded) {
      fetchWeather();
      const interval = setInterval(fetchWeather, 600000);
      return () => clearInterval(interval);
    }
  }, [settings.timezone, settingsLoaded]);

  const getCityFromTimezone = (timezone: string): string => {
    if (!timezone || timezone === 'UTC') return 'London';

    // Handle "Region/City" format
    const parts = timezone.split('/');
    if (parts.length > 1) {
      // Clean up city name (e.g., "New_York" -> "New York")
      return parts[parts.length - 1].replace(/_/g, ' ');
    }

    return 'London'; // Default fallback
  };

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

  // Time update effect
  useEffect(() => {
    // Update immediately
    updateTime();

    // Then every second
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [settings.timezone]);

  const updateTime = () => {
    // Current UTC time
    const now = new Date();

    // Format options for the target timezone
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: settings.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: settings.showSeconds ? '2-digit' : undefined,
      hour12: true
    };

    // Format options for 24h hour extraction (for gradient/weather text)
    const hourOptions: Intl.DateTimeFormatOptions = {
      timeZone: settings.timezone,
      hour: 'numeric',
      hour12: false
    };

    try {
      const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
      const hourStr = new Intl.DateTimeFormat('en-US', hourOptions).format(now);
      const hour = parseInt(hourStr);

      setDisplayTime(timeStr);
      setCurrentHour(hour);
    } catch (e) {
      // Fallback to local time if timezone is invalid
      console.error('Invalid timezone:', settings.timezone);
      const fallbackTime = now.toLocaleTimeString();
      setDisplayTime(fallbackTime);
      setCurrentHour(now.getHours());
    }
  };

  const [displayTime, setDisplayTime] = useState('');
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // We don't need getLocalTime shift hack anymore

  const getWeatherConditionText = (condition: string, hour: number): string => {
    const isNight = hour >= 19 || hour < 6;

    if (isNight && ['clear', 'clouds'].includes(condition?.toLowerCase())) return 'Night';

    switch (condition?.toLowerCase()) {
      case 'clear': return isNight ? 'Clear' : 'Sunny';
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

  const getWeatherGradient = (condition: string, hour: number): string => {
    const isNight = hour >= 19 || hour < 6;

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

  const [timeStr, period] = displayTime.split(' '); // Split "10:30 PM"


  return (
    <>
      {/* Clock Widget - Compact */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            background: getWeatherGradient(weather?.condition || 'clear', currentHour),
            borderRadius: '10px',
            padding: '0 14px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            height: '38px',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%'
          }}>
            {/* Location */}
            <div style={{
              fontSize: '8px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              opacity: 0.85,
              textTransform: 'uppercase',
              minWidth: '55px'
            }}>
              {settings.location.split(',')[0]}
            </div>

            {/* Time Display */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              minWidth: settings.showSeconds ? '110px' : '75px'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                lineHeight: 1,
                letterSpacing: '-0.02em'
              }}>
                {timeStr}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                opacity: 0.9
              }}>
                {period}
              </span>
            </div>

            {/* Weather Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderLeft: '1px solid rgba(255,255,255,0.25)',
              paddingLeft: '12px',
              minWidth: '85px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', lineHeight: 1 }}>
                  {weather?.temp || '--'}°C
                </span>
                <span style={{
                  fontSize: '9px',
                  opacity: 0.85,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  fontWeight: '600'
                }}>
                  {getWeatherConditionText(weather?.condition || 'clear', currentHour)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              width: '1px',
              height: '22px',
              background: 'rgba(255,255,255,0.25)',
              marginLeft: 'auto'
            }}></div>

            {/* Timer Button */}
            <button
              onClick={() => setShowTimer(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
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
          </div>
        </div>
      </div>

      {/* Timer Modal */}
      <TimerModal
        isOpen={showTimer}
        onClose={() => setShowTimer(false)}
        defaultDuration={settings.timerDefaultDuration}
        soundEnabled={settings.timerSoundEnabled}
      />
    </>
  );
}