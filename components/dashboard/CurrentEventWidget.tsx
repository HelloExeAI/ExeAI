// src/components/dashboard/CurrentEventWidget.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
}

interface CurrentEventWidgetProps {
  events: CalendarEvent[];
}

export default function CurrentEventWidget({ events }: CurrentEventWidgetProps) {
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);
  const [showCurrentEvent, setShowCurrentEvent] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch setting for showing current event
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setShowCurrentEvent(settings.calendarShowCurrentEvent ?? true);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  // Update current, next, and today's events every minute
  useEffect(() => {
    const updateEvents = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find current event (happening now)
      const current = events.find(event => {
        const start = new Date(event.start);
        const end = new Date(event.end);
        return start <= now && end > now;
      });

      // Find next upcoming event
      const upcoming = events
        .filter(event => new Date(event.start) > now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

      // Get all events for today
      const eventsToday = events
        .filter(event => {
          const eventStart = new Date(event.start);
          return eventStart >= today && eventStart < tomorrow;
        })
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      setCurrentEvent(current || null);
      setNextEvent(upcoming || null);
      setTodayEvents(eventsToday);
    };

    updateEvents();
    const interval = setInterval(updateEvents, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [events]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Don't show if setting is disabled
  if (!showCurrentEvent) {
    return null;
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  };

  const formatTimeRange = (start: Date, end: Date) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getTimeUntilNext = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `in ${hours}h ${minutes % 60}m`;
    }
    return `in ${minutes}m`;
  };

  const isEventNow = (event: CalendarEvent): boolean => {
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);
    return start <= now && end > now;
  };

  const isEventPast = (event: CalendarEvent): boolean => {
    const now = new Date();
    const end = new Date(event.end);
    return end < now;
  };

  // Check if text needs scrolling (more than ~25 characters)
  const needsScroll = (text: string) => text.length > 25;

  return (
    <>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px 0 16px',
          height: '38px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          width: '310px', // Slightly wider for dropdown button
          overflow: 'hidden'
        }}>
          {/* Current Event Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden'
          }}>
            {currentEvent ? (
              <>
                <div style={{
                  width: '3px',
                  height: '20px',
                  backgroundColor: '#10B981',
                  borderRadius: '2px',
                  flexShrink: 0
                }}></div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '2px',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  {needsScroll(currentEvent.title) ? (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#1F2937',
                      overflow: 'hidden',
                      position: 'relative',
                      width: '200px'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        animation: 'scroll-text 10s linear infinite'
                      }}>
                        {currentEvent.title}
                        <span style={{ marginLeft: '50px' }}>{currentEvent.title}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#1F2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {currentEvent.title}
                    </div>
                  )}
                  <div style={{
                    fontSize: '10px',
                    color: '#6B7280',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}>
                    Until {formatTime(new Date(currentEvent.end))}
                  </div>
                </div>
              </>
            ) : nextEvent ? (
              <>
                <div style={{
                  width: '3px',
                  height: '20px',
                  backgroundColor: '#F4B000',
                  borderRadius: '2px',
                  flexShrink: 0
                }}></div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '2px',
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  {needsScroll(nextEvent.title) ? (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#1F2937',
                      overflow: 'hidden',
                      position: 'relative',
                      width: '200px'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        whiteSpace: 'nowrap',
                        animation: 'scroll-text 10s linear infinite'
                      }}>
                        {nextEvent.title}
                        <span style={{ marginLeft: '50px' }}>{nextEvent.title}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#1F2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {nextEvent.title}
                    </div>
                  )}
                  <div style={{
                    fontSize: '10px',
                    color: '#6B7280',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}>
                    {getTimeUntilNext(new Date(nextEvent.start))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: '3px',
                  height: '20px',
                  backgroundColor: '#10B981',
                  borderRadius: '2px',
                  flexShrink: 0
                }}></div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#10B981',
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap'
                }}>
                  You're available — make it count
                </div>
              </>
            )}
          </div>

          {/* Dropdown Toggle Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              padding: '4px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: showDropdown ? '#F3F4F6' : 'transparent',
              color: '#6B7280',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
              width: '24px',
              height: '24px'
            }}
            onMouseEnter={(e) => {
              if (!showDropdown) {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }
            }}
            onMouseLeave={(e) => {
              if (!showDropdown) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {showDropdown ? '▲' : '▼'}
          </button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            width: '100%',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '8px'
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 12px 8px 12px',
              borderBottom: '1px solid #E5E7EB',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#1F2937'
              }}>
                Today's Events
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6B7280',
                marginTop: '2px'
              }}>
                {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'} scheduled
              </div>
            </div>

            {/* Events List */}
            {todayEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {todayEvents.map((event, index) => {
                  const isPast = isEventPast(event);
                  const isNow = isEventNow(event);
                  
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isNow ? '#ECFDF5' : isPast ? '#F9FAFB' : '#FFFBEB',
                        border: isNow ? '1px solid #10B981' : isPast ? '1px solid #E5E7EB' : '1px solid #F4B000',
                        transition: 'all 0.2s',
                        cursor: 'default'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '3px',
                          height: '40px',
                          backgroundColor: isNow ? '#10B981' : isPast ? '#9CA3AF' : '#F4B000',
                          borderRadius: '2px',
                          flexShrink: 0
                        }}></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: isPast ? '#6B7280' : '#1F2937',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {event.title}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6B7280',
                            fontWeight: '500'
                          }}>
                            {formatTimeRange(new Date(event.start), new Date(event.end))}
                          </div>
                          {isNow && (
                            <div style={{
                              fontSize: '10px',
                              color: '#10B981',
                              fontWeight: '600',
                              marginTop: '4px'
                            }}>
                              ● Happening now
                            </div>
                          )}
                          {isPast && (
                            <div style={{
                              fontSize: '10px',
                              color: '#9CA3AF',
                              fontWeight: '600',
                              marginTop: '4px'
                            }}>
                              ✓ Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '32px',
                  marginBottom: '8px'
                }}>
                  📅
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6B7280'
                }}>
                  No events scheduled today
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrolling Animation */}
      <style jsx>{`
        @keyframes scroll-text {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
}
