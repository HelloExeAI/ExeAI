'use client';

import React, { useState } from 'react';
import Calendar from './Calendar';
import { CalendarEvent } from '../../app/types';

interface LeftSidebarProps {
  calendarEvents?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export default function LeftSidebarComponent({ 
  calendarEvents = [], 
  onAddEvent, 
  onUpdateEvent, 
  onDeleteEvent 
}: LeftSidebarProps) {
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  
  const handleNewMeetingClick = () => {
    setShowAddEventModal(true);
  };
  
  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      backgroundColor: '#FAFAFA', 
      padding: '8px'
      // Width is controlled by the parent grid layout
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Logo Card - Compact */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid #E5E7EB', 
          borderRadius: '10px',
          padding: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '400', color: '#1F2937', margin: 0 }}>ExeAI</h1>
            <p style={{ fontSize: '7px', color: '#6B7280', marginTop: '2px', letterSpacing: '0.05em' }}>LET IT WORK FOR YOU</p>
          </div>
        </div>

       
        {/* Calendar */}
        <Calendar 
          events={calendarEvents} 
          onAddEvent={onAddEvent}
          onUpdateEvent={onUpdateEvent}
          onDeleteEvent={onDeleteEvent}
        />
       
        {/* Quick Actions Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px' }}>
          <div style={{ fontSize: '9px', fontWeight: '600', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ACTIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={handleNewMeetingClick}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: '#4B5563', 
                color: 'white', 
                fontSize: '11px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              📅 Meeting
            </button>
            <button style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: '#10B981', 
              color: 'white', 
              fontSize: '11px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}>
              ✅ Task
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Event Modal */}
      {showAddEventModal && onAddEvent && (
        <AddEventModal 
          onClose={() => setShowAddEventModal(false)} 
          onAddEvent={onAddEvent} 
        />
      )}
    </div>
  );
}

// Add Event Modal Component
interface AddEventModalProps {
  onClose: () => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  initialEvent?: Omit<CalendarEvent, 'id'>;
}

function AddEventModal({ onClose, onAddEvent, initialEvent }: AddEventModalProps) {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [eventType, setEventType] = useState<CalendarEvent['type']>(initialEvent?.type || 'meeting');
  const [startDate, setStartDate] = useState<string>(
    initialEvent?.start 
      ? new Date(initialEvent.start).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(
    initialEvent?.start 
      ? new Date(initialEvent.start).toTimeString().slice(0, 5)
      : '09:00'
  );
  const [endTime, setEndTime] = useState<string>(
    initialEvent?.end 
      ? new Date(initialEvent.end).toTimeString().slice(0, 5)
      : '10:00'
  );
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create date objects from form values
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);
    
    // Create the event object
    const newEvent = {
      title,
      type: eventType,
      start: startDateTime,
      end: endDateTime,
      description,
      location
    };
    
    // Add the event
    onAddEvent(newEvent);
    
    // Close the modal
    onClose();
  };
  
  return (
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
    onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '28px',
          width: '480px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>
          {initialEvent ? 'Edit Event' : 'Add New Event'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="title" 
              style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="eventType" 
              style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
            >
              Event Type
            </label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as CalendarEvent['type'])}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px'
              }}
            >
              <option value="meeting">Meeting</option>
              <option value="event">Event</option>
              <option value="travel">Travel</option>
              <option value="birthday">Birthday</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="startDate" 
                style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
              >
                Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="startTime" 
                style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
              >
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <label 
                htmlFor="endTime" 
                style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
              >
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="location" 
              style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
            >
              Location (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="description" 
              style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4B5563',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3B82F6',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {initialEvent ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}