// src/components/dashboard/Calendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent as AppCalendarEvent } from '@/app/types';
import AddEventModal from '@/components/calendar/AddEventModal';
import EventDetailsModal from '@/components/calendar/EventDetailsModal';
import { CalendarEvent, EventTypeConfig, DEFAULT_EVENT_TYPES } from '@/components/calendar/CalendarTypes';

interface CalendarProps {
  events?: AppCalendarEvent[];
  onAddEvent?: (event: Omit<AppCalendarEvent, 'id'>) => void;
  onUpdateEvent?: (event: AppCalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export default function Calendar({ events = [], onAddEvent, onUpdateEvent, onDeleteEvent }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [eventTypes] = useState<EventTypeConfig[]>(DEFAULT_EVENT_TYPES);
  const [weekendMode, setWeekendMode] = useState<'all_saturdays_working' | 'alternate_saturdays_working' | 'no_saturdays_working'>('all_saturdays_working');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Fetch user settings from API
  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setWeekendMode(settings.calendarWeekendMode || 'all_saturdays_working');
        setSettingsLoaded(true);
      } else {
        console.error('Failed to fetch calendar settings');
        setSettingsLoaded(true);
      }
    } catch (error) {
      setSettingsLoaded(true);
    }
  };

  // Convert from app event format to internal format
  // We rely fully on props 'events' which should be passed from the parent (Dashboard)
  const convertedEvents: CalendarEvent[] = events.map(event => {
    const eventDate = new Date(event.start);
    // Ensure we have a valid end date
    const endDate = event.end ? new Date(event.end) : new Date(eventDate.getTime() + 60 * 60 * 1000);

    const typeConfig = eventTypes.find(t => t.type === event.type) || eventTypes.find(t => t.type === 'event')!;

    return {
      id: event.id,
      date: `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`,
      type: event.type as any,
      title: event.title,
      time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      color: typeConfig.color,
      description: event.description,
      // Store original objects for details view
      start: eventDate,
      end: endDate,
      // Extract metadata
      meetingLink: (event as any).metadata?.meetingLink,
      location: (event as any).metadata?.location,
      attendees: (event as any).metadata?.attendees,
      metadata: (event as any).metadata,
    };
  });

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  // Updated weekend logic based on settings
  const isWeekendDay = (date: Date, day: number): boolean => {
    const fullDate = new Date(date.getFullYear(), date.getMonth(), day);
    const dayOfWeek = fullDate.getDay();

    // Sunday is always a weekend (dayOfWeek === 0)
    if (dayOfWeek === 0) return true;

    // Saturday logic (dayOfWeek === 6)
    if (dayOfWeek === 6) {
      if (weekendMode === 'all_saturdays_working') {
        return false; // Saturdays are working days
      } else if (weekendMode === 'no_saturdays_working') {
        return true; // All Saturdays are off
      } else if (weekendMode === 'alternate_saturdays_working') {
        // Alternate Saturdays - calculate week number
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const weekNumber = Math.ceil((day + firstDayOfMonth.getDay()) / 7);
        return weekNumber % 2 === 0; // Even weeks are off, odd weeks are working
      }
    }

    return false;
  };

  // Check if day is a holiday
  const isHoliday = (date: Date, day: number): boolean => {
    const dayEvents = getEventsForDate(date, day);
    return dayEvents.some(event => event.type === 'holiday');
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

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setSelectedDate(new Date());
    setShowAddEventModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventDetails(false);
    setShowAddEventModal(true);
  };

  const handleSaveEvent = (eventData: any) => {
    const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
    const endDateTime = new Date(`${eventData.endDate}T${eventData.endTime}`);

    const eventPayload = {
      title: eventData.title,
      start: startDateTime,
      end: endDateTime,
      type: eventData.type as any,
      description: eventData.description,
      id: eventData.id,
      metadata: editingEvent?.metadata
    };

    if (eventData.id && onUpdateEvent) {
      onUpdateEvent(eventPayload as any);
    } else if (onAddEvent) {
      onAddEvent(eventPayload);
    }

    setShowAddEventModal(false);
    setEditingEvent(undefined);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
    setShowEventDetails(false);
  };

  const days = getDaysInMonth(currentDate);
  const years = generateYears();

  return (
    <>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '8px',
        position: 'relative'
      }}>
        {/* Ultra-Compact Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '6px', gap: '6px' }}>
          {/* Month Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#F3F4F6',
                color: '#1F2937',
                fontSize: '11px',
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
                padding: '3px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#F3F4F6',
                color: '#1F2937',
                fontSize: '11px',
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

          {/* Add Event Button */}
          <button
            onClick={handleAddEvent}
            title="Add Event"
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#F4B000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D99E00';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F4B000';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            +
          </button>
        </div>

        {/* Ultra-Compact Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div
              key={`header-${idx}`}
              style={{
                textAlign: 'center',
                fontSize: '8px',
                fontWeight: '700',
                color: idx === 0 || idx === 6 ? '#10B981' : '#6B7280',
                padding: '1px 0',
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
              return <div key={`empty-${idx}`} style={{ minHeight: '20px' }}></div>;
            }

            const dayEvents = getEventsForDate(currentDate, day);
            const isTodayDate = isToday(currentDate, day);
            const isWeekend = isWeekendDay(currentDate, day);
            const isHolidayDay = isHoliday(currentDate, day);
            const isSelected = selectedDate &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentDate.getMonth() &&
              selectedDate.getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={`day-${idx}`}
                onClick={() => handleDateClick(day)}
                style={{
                  minHeight: '20px',
                  padding: '2px 1px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isSelected ? '#EFF6FF' : (isTodayDate ? '#FEF3C7' : 'transparent'),
                  border: isTodayDate ? '1px solid #F59E0B' : (isSelected ? '1px solid #3B82F6' : '1px solid transparent'),
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
                  fontSize: '10px',
                  fontWeight: isTodayDate ? '700' : '500',
                  color: (isWeekend || isHolidayDay) ? '#10B981' : '#1F2937',
                  marginBottom: '1px'
                }}>
                  {day}
                </div>

                {/* Ultra-Compact Event Dots */}
                {dayEvents.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '1px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    minHeight: '4px'
                  }}>
                    {dayEvents.slice(0, 3).map((event, eventIdx) => (
                      <div
                        key={eventIdx}
                        style={{
                          width: '2px',
                          height: '2px',
                          borderRadius: '50%',
                          backgroundColor: event.color,
                          boxShadow: '0 0.5px 1px rgba(0,0,0,0.15)'
                        }}
                        title={event.title}
                      ></div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div style={{
                        fontSize: '5px',
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

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSave={handleSaveEvent}
        initialDate={selectedDate || new Date()}
        initialEvent={editingEvent}
        eventTypes={eventTypes}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={showEventDetails}
        onClose={() => setShowEventDetails(false)}
        events={selectedDateEvents}
        selectedDate={selectedDate}
        onDelete={handleDeleteEvent}
        onEdit={handleEditEvent}
        eventTypes={eventTypes}
      />
    </>
  );
}