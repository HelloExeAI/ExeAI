'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent as AppCalendarEvent } from '@/app/dashboard/types';
import { createPortal } from 'react-dom';

// Portal component to render modals at document.body level
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

interface CalendarProps {
  events?: AppCalendarEvent[];
  onAddEvent?: (event: Omit<AppCalendarEvent, 'id'>) => void;
  onUpdateEvent?: (event: AppCalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

// Define internal event type to be compatible with our current implementation
interface CalendarEvent {
  id: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'internal_meeting' | 'client_meeting' | 'call_reminder' | 'travel' | 'vacation' | 'weekend' | 'holiday' | 'reminder' | 'event' | 'meeting';
  title: string;
  time?: string;
  color: string;
}

interface EventTypeConfig {
  type: string;
  label: string;
  color: string;
  icon: string;
}

const DEFAULT_EVENT_TYPES: EventTypeConfig[] = [
  { type: 'birthday', label: 'Birthday', color: '#EC4899', icon: '🎂' },
  { type: 'anniversary', label: 'Anniversary', color: '#8B5CF6', icon: '💍' },
  { type: 'internal_meeting', label: 'Internal Meeting', color: '#3B82F6', icon: '👥' },
  { type: 'client_meeting', label: 'Client Meeting', color: '#1E40AF', icon: '🤝' },
  { type: 'call_reminder', label: 'Call Reminder', color: '#F59E0B', icon: '📞' },
  { type: 'travel', label: 'Travel', color: '#14B8A6', icon: '✈️' },
  { type: 'vacation', label: 'Vacation', color: '#10B981', icon: '🏖️' },
  { type: 'weekend', label: 'Weekend', color: '#34D399', icon: '🎉' },
  { type: 'holiday', label: 'Holiday', color: '#EF4444', icon: '🏛️' },
  { type: 'reminder', label: 'Reminder', color: '#F4B000', icon: '⏰' },
  // Add support for our app's event types
  { type: 'meeting', label: 'Meeting', color: '#8B5CF6', icon: '👥' },
  { type: 'event', label: 'Event', color: '#F59E0B', icon: '📅' },
];

export default function Calendar({ events = [], onAddEvent, onUpdateEvent, onDeleteEvent }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeConfig[]>(DEFAULT_EVENT_TYPES);
  const [connectedCalendars, setConnectedCalendars] = useState({
    google: false,
    microsoft: false,
    apple: false,
  });

  // Convert from app event format to internal format
  const convertedEvents: CalendarEvent[] = [
    // Keep the existing events
    { id: '1', date: '2025-11-01', type: 'holiday', title: 'All Saints Day', color: '#EF4444' },
    { id: '2', date: '2025-11-08', type: 'internal_meeting', title: 'Team Standup', time: '10:00 AM', color: '#3B82F6' },
    { id: '3', date: '2025-11-08', type: 'client_meeting', title: 'Client Call', time: '2:00 PM', color: '#1E40AF' },
    { id: '4', date: '2025-11-15', type: 'birthday', title: "John's Birthday", color: '#EC4899' },
    { id: '5', date: '2025-11-22', type: 'travel', title: 'Flight to Dubai', time: '6:00 AM', color: '#14B8A6' },
    { id: '6', date: '2025-11-23', type: 'vacation', title: 'Dubai Trip', color: '#10B981' },
    { id: '7', date: '2025-11-24', type: 'vacation', title: 'Dubai Trip', color: '#10B981' },
    
    // Add events from props
    ...events.map(event => {
      const eventDate = new Date(event.start);
      const typeConfig = DEFAULT_EVENT_TYPES.find(t => t.type === event.type) || DEFAULT_EVENT_TYPES.find(t => t.type === 'event')!;
      
      return {
        id: event.id,
        date: `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`,
        type: event.type as any,
        title: event.title,
        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        color: typeConfig.color
      };
    })
  ];

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Generate years from 1900 to current year + 100
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 1900; i <= currentYear + 100; i++) {
      years.push(i);
    }
    return years;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDate = (date: Date, day: number): CalendarEvent[] => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return convertedEvents.filter(event => event.date === dateStr);
  };

  const isToday = (date: Date, day: number): boolean => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const isWeekend = (dayIndex: number): boolean => {
    return dayIndex % 7 === 0 || dayIndex % 7 === 6;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    const dayEvents = getEventsForDate(currentDate, day);
    if (dayEvents.length > 0) {
      setSelectedDateEvents(dayEvents);
      setShowEventDetails(true);
    }
  };

  const handleMonthChange = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const handleConnectCalendar = (provider: 'google' | 'microsoft' | 'apple') => {
    setConnectedCalendars({ ...connectedCalendars, [provider]: true });
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar connection initiated!`);
  };

  const handleColorChange = (type: string, newColor: string) => {
    setEventTypes(eventTypes.map(et => 
      et.type === type ? { ...et, color: newColor } : et
    ));
  };

  const handleDeleteEvent = (eventId: string) => {
    // Call the parent component's delete function if provided
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
    
    // Close the event details modal
    setShowEventDetails(false);
  };
  
  const days = getDaysInMonth(currentDate);
  const years = generateYears();

  // Get today's events
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayEvents = convertedEvents.filter(event => event.date === todayDateStr);

  return (
    <>
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        border: '1px solid #E5E7EB', 
        borderRadius: '12px',
        padding: '12px',
        position: 'relative'
      }}>
        {/* Ultra-Compact Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
          {/* Month Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                border: 'none', 
                backgroundColor: '#F3F4F6', 
                color: '#1F2937', 
                fontSize: '12px', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              {monthNamesShort[currentDate.getMonth()]}
            </button>
            
            {showMonthPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100,
                maxHeight: '200px',
                overflowY: 'auto',
                width: '110px'
              }}>
                {monthNames.map((month, index) => (
                  <div
                    key={month}
                    onClick={() => handleMonthChange(index)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: currentDate.getMonth() === index ? '600' : '400',
                      color: currentDate.getMonth() === index ? '#3B82F6' : '#1F2937',
                      backgroundColor: currentDate.getMonth() === index ? '#EFF6FF' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentDate.getMonth() !== index) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentDate.getMonth() !== index) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Year Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowYearPicker(!showYearPicker)}
              style={{ 
                padding: '4px 10px', 
                borderRadius: '6px', 
                border: 'none', 
                backgroundColor: '#F3F4F6', 
                color: '#1F2937', 
                fontSize: '12px', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              {currentDate.getFullYear()}
            </button>
            
            {showYearPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 100,
                maxHeight: '200px',
                overflowY: 'auto',
                width: '85px'
              }}>
                {years.map(year => (
                  <div
                    key={year}
                    onClick={() => handleYearChange(year)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: currentDate.getFullYear() === year ? '600' : '400',
                      color: currentDate.getFullYear() === year ? '#3B82F6' : '#1F2937',
                      backgroundColor: currentDate.getFullYear() === year ? '#EFF6FF' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentDate.getFullYear() !== year) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentDate.getFullYear() !== year) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button 
            onClick={() => setShowSettings(true)}
            style={{ 
              padding: '4px', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: '#F3F4F6', 
              color: '#1F2937', 
              fontSize: '13px', 
              cursor: 'pointer',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          >⚙️</button>
        </div>

        {/* Ultra-Compact Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '2px' }}>
          {['S','M','T','W','T','F','S'].map((d, idx) => (
            <div 
              key={`header-${idx}`} 
              style={{ 
                textAlign: 'center', 
                fontSize: '9px', 
                fontWeight: '700', 
                color: idx === 0 || idx === 6 ? '#EF4444' : '#6B7280',
                padding: '2px 0',
                letterSpacing: '0.03em'
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Ultra-Compact Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} style={{ minHeight: '28px' }}></div>;
            }

            const dayEvents = getEventsForDate(currentDate, day);
            const isTodayDate = isToday(currentDate, day);
            const isWeekendDay = isWeekend(idx);
            const isSelected = selectedDate && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === currentDate.getMonth() &&
              selectedDate.getFullYear() === currentDate.getFullYear();

            return (
              <div 
                key={`day-${idx}`}
                onClick={() => handleDateClick(day)}
                style={{
                  minHeight: '28px',
                  padding: '3px 1px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isSelected ? '#EFF6FF' : (isTodayDate ? '#FEF3C7' : 'transparent'),
                  border: isTodayDate ? '1.5px solid #F59E0B' : (isSelected ? '1.5px solid #3B82F6' : '1.5px solid transparent'),
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && !isTodayDate) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && !isTodayDate) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: isTodayDate ? '700' : '500',
                  color: isWeekendDay ? '#EF4444' : '#1F2937',
                  marginBottom: '1px'
                }}>
                  {day}
                </div>

                {/* Ultra-Compact Event Dots */}
                {dayEvents.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '1.5px', 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    minHeight: '6px'
                  }}>
                    {dayEvents.slice(0, 3).map((event, eventIdx) => (
                      <div
                        key={eventIdx}
                        style={{
                          width: '3px',
                          height: '3px',
                          borderRadius: '50%',
                          backgroundColor: event.color,
                          boxShadow: '0 0.5px 1px rgba(0,0,0,0.15)'
                        }}
                        title={event.title}
                      ></div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{
                        fontSize: '6px',
                        color: '#6B7280',
                        fontWeight: '600',
                        lineHeight: 1
                      }}>
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Events Section */}
      <div style={{ 
        marginTop: '16px',
        backgroundColor: '#FFFFFF', 
        border: '1px solid #E5E7EB', 
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#6B7280', 
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>TODAY'S EVENTS</span>
          {onAddEvent && (
            <button
              onClick={() => {
                if (onAddEvent) {
                  // Create a default event for today
                  const now = new Date();
                  const later = new Date(now);
                  later.setHours(later.getHours() + 1);
                  
                  onAddEvent({
                    title: "New Event",
                    start: now,
                    end: later,
                    type: 'event',
                    description: ""
                  });
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '14px',
                color: '#3B82F6',
                cursor: 'pointer'
              }}
            >
              +
            </button>
          )}
        </div>
        
        {todayEvents.length === 0 ? (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center',
            color: '#9CA3AF', 
            fontSize: '13px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            border: '1px dashed #E5E7EB'
          }}>
            No events scheduled for today
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayEvents.map(event => {
              const eventTypeConfig = eventTypes.find(et => et.type === event.type);
              return (
                <div
                  key={event.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    borderLeft: `4px solid ${event.color}`,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedDateEvents([event]);
                    setShowEventDetails(true);
                  }}
                >
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1F2937',
                    marginBottom: '2px'
                  }}>
                    {event.title}
                  </div>
                  {event.time && (
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {event.time}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings Modal - FIXED: Using Portal for proper positioning */}
      {showSettings && (
        <Portal>
          {/* Backdrop Layer */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => setShowSettings(false)}
          />
          
          {/* Modal Content Layer */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '85vh'
          }}>
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1F2937' }}>
                Calendar Settings
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '28px', 
                  cursor: 'pointer', 
                  color: '#6B7280',
                  padding: 0,
                  lineHeight: 1
                }}
              >×</button>
            </div>

            {/* Connect Calendars Section */}
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#6B7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                marginBottom: '16px'
              }}>
                CONNECT CALENDARS
              </h4>
              
              {[
                { id: 'google', name: 'Google Calendar', icon: '📅', color: '#4285F4' },
                { id: 'microsoft', name: 'Microsoft Outlook', icon: '📧', color: '#0078D4' },
                { id: 'apple', name: 'Apple Calendar', icon: '🍎', color: '#000000' }
              ].map(provider => (
                <div 
                  key={provider.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#F9FAFB',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{provider.icon}</span>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>
                      {provider.name}
                    </span>
                  </div>
                  
                  {connectedCalendars[provider.id as keyof typeof connectedCalendars] ? (
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#D1FAE5',
                      color: '#047857',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      ✓ Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnectCalendar(provider.id as 'google' | 'microsoft' | 'apple')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: provider.color,
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Event Colors Section */}
            <div>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#6B7280', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                marginBottom: '16px'
              }}>
                EVENT COLORS
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {eventTypes.map(eventType => (
                  <div 
                    key={eventType.type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: '#F9FAFB'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{eventType.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: '#1F2937' }}>
                        {eventType.label}
                      </span>
                    </div>
                    <input
                      type="color"
                      value={eventType.color}
                      onChange={(e) => handleColorChange(eventType.type, e.target.value)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#3B82F6',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '24px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
        </Portal>
      )}

      {/* Event Details Modal - FIXED: Using Portal for proper positioning */}
      {showEventDetails && selectedDateEvents.length > 0 && (
        <Portal>
          {/* Backdrop Layer */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              backdropFilter: 'blur(2px)'
            }}
            onClick={() => setShowEventDetails(false)}
          />
          
          {/* Modal Content Layer */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '85vh'
          }}>
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxHeight: '85vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) || 'Event Details'}
              </h3>
              <button 
                onClick={() => setShowEventDetails(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '28px', 
                  cursor: 'pointer', 
                  color: '#6B7280',
                  padding: 0,
                  lineHeight: 1
                }}
              >×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDateEvents.map(event => {
                const eventTypeConfig = eventTypes.find(et => et.type === event.type);
                return (
                  <div 
                    key={event.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      borderLeft: `4px solid ${event.color}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{eventTypeConfig?.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937', marginBottom: '4px' }}>
                          {event.title}
                        </div>
                        {event.time && (
                          <div style={{ fontSize: '14px', color: '#6B7280' }}>
                            ⏰ {event.time}
                          </div>
                        )}
                        <div style={{ 
                          fontSize: '12px', 
                          color: event.color, 
                          fontWeight: '600',
                          marginTop: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {eventTypeConfig?.label}
                        </div>
                        
                        {/* Event actions */}
                        {onDeleteEvent && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#FEF2F2',
                                color: '#EF4444',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}