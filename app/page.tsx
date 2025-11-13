'use client';

import { useState, useEffect } from 'react';
import CenterPanel from '../components/dashboard/CenterPanel';
import LeftSidebar from '../components/dashboard/LeftSidebarComponent';
import RightSidebar from '../components/dashboard/RightSidebar';
import { Page, Note, CalendarEvent } from '../app/types';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Add state for calendar events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Load saved events on initial render
  useEffect(() => {
    // In a real app, you would load from localStorage or an API
    // For now, we'll just set some demo events
    const demoEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        start: new Date(2025, 10, 13, 10, 0), // Nov 13, 2025, 10:00 AM
        end: new Date(2025, 10, 13, 11, 0),   // Nov 13, 2025, 11:00 AM
        type: 'meeting',
        description: 'Weekly team sync',
        location: 'Conference Room A'
      }
    ];
    setCalendarEvents(demoEvents);
  }, []);
  
  // Function to add a new calendar event
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString() // Generate a unique ID
    };
    
    setCalendarEvents(prev => [...prev, newEvent]);
    displayToast(`${event.title} added to calendar`);
  };
  
  // Function to update an existing calendar event
  const updateCalendarEvent = (updatedEvent: CalendarEvent) => {
    setCalendarEvents(prev => 
      prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
    );
    displayToast(`${updatedEvent.title} updated`);
  };
  
  // Function to delete a calendar event
  const deleteCalendarEvent = (eventId: string) => {
    const eventToDelete = calendarEvents.find(e => e.id === eventId);
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
    if (eventToDelete) {
      displayToast(`${eventToDelete.title} removed from calendar`);
    }
  };
  
  // Extract events from notes
  useEffect(() => {
    if (!currentPage) return;
    
    // Find notes that are events, meetings, or other calendar-related types
    const eventNotes = currentPage.notes.filter(note => 
      note.type === 'event' || note.type === 'meeting' || 
      note.type === 'travel' || note.type === 'birthday'
    );
    
    // Convert relevant notes to calendar events if they're not already in the calendar
    eventNotes.forEach(note => {
      // Skip if this note is already represented as a calendar event
      if (calendarEvents.some(event => event.sourceNoteId === note.id)) {
        return;
      }
      
      // Try to extract date/time information from the note content
      // This is a simplified example - in a real app, you'd use a more robust date parsing
      const dateMatch = note.content.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      const timeMatch = note.content.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1; // JS months are 0-indexed
        const day = parseInt(dateMatch[2]);
        let year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000; // Convert 2-digit years
        
        const today = new Date();
        const eventDate = new Date(year, month, day);
        
        // Set time if it was found, otherwise default to 9 AM
        let hours = 9;
        let minutes = 0;
        
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          
          // Handle AM/PM
          if (timeMatch[3] && timeMatch[3].toLowerCase() === 'pm' && hours < 12) {
            hours += 12;
          }
        }
        
        eventDate.setHours(hours, minutes);
        
        // Create an end time 1 hour later
        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + 1);
        
        // Create the new calendar event
        const newEvent: CalendarEvent = {
          id: `note-${note.id}`,
          title: note.content,
          start: eventDate,
          end: endDate,
          type: note.type as 'travel' | 'meeting' | 'event' | 'birthday' | 'reminder',
          description: note.content,
          sourceNoteId: note.id
        };
        
        // Add to calendar events
        setCalendarEvents(prev => [...prev, newEvent]);
      }
    });
  }, [currentPage, calendarEvents]);
  
  const handleCompleteTodo = (noteId: string, completed: boolean) => {
    if (!currentPage) return;
    
    const allNotes = [...currentPage.notes];
    const updatedNotes = allNotes.map(note => 
      note.id === noteId 
        ? { ...note, completed }
        : note
    );
    
    setCurrentPage({
      ...currentPage,
      notes: updatedNotes,
      lastModified: new Date()
    });
    
    if (completed) {
      displayToast("Task completed!");
    }
  };

  const handleDeleteTodo = (noteId: string) => {
    if (!currentPage) return;
    
    const allNotes = [...currentPage.notes];
    const filteredNotes = allNotes.filter(note => note.id !== noteId);
    
    setCurrentPage({
      ...currentPage,
      notes: filteredNotes,
      lastModified: new Date()
    });
    
    displayToast("Task deleted");
  };
  
  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };
  
  // Get todo items for the current page
  const todoItems = currentPage?.notes.filter(note => note.type === 'todo') || [];

  return (
    <div className="flex h-screen" style={{ 
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)'
    }}>
      <div className="frosted-panel" style={{ width: '160px' }}>
        <LeftSidebar 
          calendarEvents={calendarEvents} 
          onAddEvent={addCalendarEvent}
          onUpdateEvent={updateCalendarEvent}
          onDeleteEvent={deleteCalendarEvent}
        />
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 border-r border-gray-200 frosted-panel">
          <CenterPanel 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onAddCalendarEvent={addCalendarEvent}
          />
        </div>
        <div className="frosted-panel" style={{ width: '160px' }}>
          <RightSidebar 
            todoItems={todoItems}
            onCompleteTodo={handleCompleteTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        </div>
      </div>
      
      {/* Toast */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease'
        }}>
          <span style={{ fontSize: '20px' }}>✓</span>
          {toastMessage}
        </div>
      )}
      
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%);
          margin: 0;
          padding: 0;
        }
        
        .frosted-panel {
          backdrop-filter: blur(10px);
          background-color: rgba(255, 255, 255, 0.7);
          box-shadow: 0 1px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.3);
          overflow: hidden;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}