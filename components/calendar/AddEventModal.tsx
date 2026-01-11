// src/components/calendar/AddEventModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EventTypeConfig, DEFAULT_EVENT_TYPES, CalendarEvent } from './CalendarTypes';

interface Portal {
  children: React.ReactNode;
}

function Portal({ children }: Portal) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: {
    id?: string;
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    type: string;
    description: string;
    allDay: boolean;
  }) => void;
  initialDate?: Date;
  initialEvent?: CalendarEvent;
  eventTypes?: EventTypeConfig[];
}

export default function AddEventModal({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialEvent,
  eventTypes = DEFAULT_EVENT_TYPES
}: AddEventModalProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState('event');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize dates when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title);
        setDescription(initialEvent.description || '');
        setType(initialEvent.type);

        const start = new Date(initialEvent.start || new Date());
        const end = new Date(initialEvent.end || new Date());

        setStartDate(start.toISOString().split('T')[0]);
        setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })); // HH:mm

        setEndDate(end.toISOString().split('T')[0]);
        setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

        // Rough all-day check (if times are 00:00 and 23:59)
        // Adjust logic if needed based on your conventions

      } else if (initialDate) {
        const dateStr = initialDate.toISOString().split('T')[0];
        setStartDate(dateStr);
        setEndDate(dateStr);
      }
    }
  }, [isOpen, initialDate, initialEvent]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle('');
        setStartDate('');
        setStartTime('09:00');
        setEndDate('');
        setEndTime('10:00');
        setType('event');
        setDescription('');
        setAllDay(false);
        setErrors({});
        setIsSaving(false);
      }, 300);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Title is required
    if (!title.trim()) {
      newErrors.title = 'Event title is required';
    }

    // Start date is required
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    // End date is required
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    // End date must be after or equal to start date
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    // If same day, end time must be after start time
    if (startDate && endDate && startDate === endDate && !allDay) {
      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim(),
        startDate,
        startTime: allDay ? '00:00' : startTime,
        endDate,
        endTime: allDay ? '23:59' : endTime,
        type,
        description: description.trim(),
        allDay
      });

      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
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
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '540px',
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1F2937' }}>
              Add New Event
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                color: '#6B7280',
                padding: 0,
                lineHeight: 1,
                opacity: isSaving ? 0.5 : 1
              }}
            >×</button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Event Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Event Title <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Meeting"
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: `2px solid ${errors.title ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: isSaving ? '#F9FAFB' : 'white'
                }}
                onFocus={(e) => {
                  if (!errors.title) {
                    e.target.style.borderColor = '#3B82F6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.title ? '#EF4444' : '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.title && (
                <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Event Type <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: isSaving ? '#F9FAFB' : 'white',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {eventTypes.map(eventType => (
                  <option key={eventType.type} value={eventType.type}>
                    {eventType.icon} {eventType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* All Day Toggle */}
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '12px'
            }}>
              <input
                type="checkbox"
                id="allDay"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                disabled={isSaving}
                style={{
                  width: '18px',
                  height: '18px',
                  marginRight: '12px',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              />
              <label
                htmlFor="allDay"
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                All-day event
              </label>
            </div>

            {/* Start Date & Time */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Start <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSaving}
                  style={{
                    flex: allDay ? 1 : 2,
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: `2px solid ${errors.startDate ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: isSaving ? '#F9FAFB' : 'white'
                  }}
                  onFocus={(e) => {
                    if (!errors.startDate) {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.startDate ? '#EF4444' : '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {!allDay && (
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: isSaving ? '#F9FAFB' : 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>
              {errors.startDate && (
                <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date & Time */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                End <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSaving}
                  style={{
                    flex: allDay ? 1 : 2,
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: `2px solid ${errors.endDate ? '#EF4444' : '#E5E7EB'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: isSaving ? '#F9FAFB' : 'white'
                  }}
                  onFocus={(e) => {
                    if (!errors.endDate) {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.endDate ? '#EF4444' : '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {!allDay && (
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isSaving}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: `2px solid ${errors.endTime ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: isSaving ? '#F9FAFB' : 'white'
                    }}
                    onFocus={(e) => {
                      if (!errors.endTime) {
                        e.target.style.borderColor = '#3B82F6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.endTime ? '#EF4444' : '#E5E7EB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>
              {(errors.endDate || errors.endTime) && (
                <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                  {errors.endDate || errors.endTime}
                </p>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add event details, agenda, or notes..."
                disabled={isSaving}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: isSaving ? '#F9FAFB' : 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '20px',
                border: '1px solid #FECACA'
              }}>
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isSaving ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isSaving ? '#93C5FD' : '#3B82F6',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSaving ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3B82F6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isSaving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}