// src/components/calendar/EventDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarEvent, EventTypeConfig, DEFAULT_EVENT_TYPES } from './CalendarTypes';

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

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDelete?: (eventId: string) => void;
  onEdit?: (event: CalendarEvent) => void;
  eventTypes?: EventTypeConfig[];
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  events,
  selectedDate,
  onDelete,
  onEdit,
  eventTypes = DEFAULT_EVENT_TYPES
}: EventDetailsModalProps) {
  if (!isOpen || events.length === 0) return null;

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
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) || 'Event Details'}
            </h3>
            <button
              onClick={onClose}
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

          {/* Events List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map(event => {
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
                        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                          ⏰ {event.time}
                        </div>
                      )}
                      {event.location && (
                        <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📍 {event.location}
                        </div>
                      )}

                      {event.meetingLink && (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#2563EB',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            marginTop: '8px',
                            marginBottom: '4px'
                          }}
                        >
                          🎥 Join Meeting
                        </a>
                      )}

                      {event.attendees && event.attendees.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '12px' }}>
                          <div style={{ fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Attendees:</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {event.attendees.map((att: any, idx: number) => (
                              <div key={idx} style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>👤</span> {att.email} {att.responseStatus === 'accepted' ? '✅' : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {event.description && (
                        <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px', lineHeight: '1.5' }}>
                          {event.description}
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

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(event);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                              backgroundColor: 'white',
                              color: '#374151',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Edit
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this event?')) {
                                onDelete(event.id);
                              }
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#FEF2F2',
                              color: '#EF4444',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Portal>
  );
}