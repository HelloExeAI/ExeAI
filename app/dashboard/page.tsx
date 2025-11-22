'use client';

import { useState, useEffect } from 'react';  
import { useSession } from 'next-auth/react';   
import { useRouter } from 'next/navigation';
import CenterPanel from '@/components/dashboard/CenterPanel';
import LeftSidebar from '@/components/dashboard/LeftSidebarComponent';
import RightSidebar from '@/components/dashboard/RightSidebar';
import TopBar from '@/components/dashboard/TopBar';
import { Page, CalendarEvent, Note } from '@/app/types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      setLoading(false);
      loadUserData();
    }
  }, [status, router]);
  
  // Load user's data from database
  const loadUserData = async () => {
    try {
      // Load calendar events from API
      const eventsResponse = await fetch('/api/calendar-events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setCalendarEvents(eventsData.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
      }
      
      // Load today's notes from API
      const today = new Date().toISOString().split('T')[0];
      const notesResponse = await fetch(`/api/notes?date=${today}`);
      if (notesResponse.ok) {
        const noteData = await notesResponse.json();
        if (noteData) {
          setCurrentPage(noteData);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };
  
  // Function to add a new calendar event
  const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (response.ok) {
        const newEvent = await response.json();
        setCalendarEvents(prev => [...prev, {
          ...newEvent,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end)
        }]);
        displayToast(`${event.title} added to calendar`);
      }
    } catch (error) {
      console.error('Failed to add calendar event:', error);
      displayToast('Failed to add event');
    }
  };
  
  // Function to update an existing calendar event
  const updateCalendarEvent = async (updatedEvent: CalendarEvent) => {
    try {
      const response = await fetch(`/api/calendar-events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      });
      
      if (response.ok) {
        setCalendarEvents(prev => 
          prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
        );
        displayToast(`${updatedEvent.title} updated`);
      }
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      displayToast('Failed to update event');
    }
  };
  
  // Function to delete a calendar event
  const deleteCalendarEvent = async (eventId: string) => {
    try {
      const eventToDelete = calendarEvents.find(e => e.id === eventId);
      const response = await fetch(`/api/calendar-events/${eventId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
        if (eventToDelete) {
          displayToast(`${eventToDelete.title} removed from calendar`);
        }
      }
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      displayToast('Failed to delete event');
    }
  };
  
  // Extract events from notes (existing logic)
  useEffect(() => {
    if (!currentPage) return;
    
    const eventNotes = currentPage.notes.filter((note: Note) => 
      note.type === 'event' || note.type === 'meeting' || 
      note.type === 'travel' || note.type === 'birthday'
    );
    
    eventNotes.forEach((note: Note) => {
      if (calendarEvents.some(event => event.sourceNoteId === note.id)) {
        return;
      }
      
      const dateMatch = note.content.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      const timeMatch = note.content.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      
      if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1;
        const day = parseInt(dateMatch[2]);
        let year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000;
        
        const eventDate = new Date(year, month, day);
        let hours = 9;
        let minutes = 0;
        
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          if (timeMatch[3] && timeMatch[3].toLowerCase() === 'pm' && hours < 12) {
            hours += 12;
          }
        }
        
        eventDate.setHours(hours, minutes);
        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + 1);
        
        addCalendarEvent({
          title: note.content,
          start: eventDate,
          end: endDate,
          type: note.type as 'travel' | 'meeting' | 'event' | 'birthday' | 'reminder',
          description: note.content,
          sourceNoteId: note.id
        });
      }
    });
  }, [currentPage]);
  
  // Handle completing a todo
  const handleCompleteTodo = async (noteId: string, completed: boolean) => {
    if (!currentPage) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      
      if (response.ok) {
        const allNotes = [...currentPage.notes];
        const updatedNotes = allNotes.map(note => 
          note.id === noteId ? { ...note, completed } : note
        );
        
        setCurrentPage({
          ...currentPage,
          notes: updatedNotes,
          lastModified: new Date()
        });
        
        if (completed) {
          displayToast("Task completed!");
        }
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  // Handle deleting a todo
  const handleDeleteTodo = async (noteId: string) => {
    if (!currentPage) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const allNotes = [...currentPage.notes];
        const filteredNotes = allNotes.filter(note => note.id !== noteId);
        
        setCurrentPage({
          ...currentPage,
          notes: filteredNotes,
          lastModified: new Date()
        });
        
        displayToast("Task deleted");
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  // Handle adding a new todo
  const handleAddTodo = (todo: Omit<Note, 'id' | 'createdAt'>) => {
    if (!currentPage) return;

    const newTodo: Note = {
      ...todo,
      id: `todo-${Date.now()}`,
      createdAt: new Date()
    };

    setCurrentPage({
      ...currentPage,
      notes: [...currentPage.notes, newTodo],
      lastModified: new Date()
    });

    displayToast("Task added!");
  };

  // Handle updating a todo
  const handleUpdateTodo = async (noteId: string, updates: Partial<Note>) => {
    if (!currentPage) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const allNotes = [...currentPage.notes];
        const updatedNotes = allNotes.map(note => 
          note.id === noteId ? { ...note, ...updates } : note
        );
        
        setCurrentPage({
          ...currentPage,
          notes: updatedNotes,
          lastModified: new Date()
        });
        
        displayToast("Task updated!");
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };
  
  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };
  
  const todoItems = currentPage?.notes.filter((note: Note) => note.type === 'todo') || [];

  // Show loading state
  if (loading || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center" style={{
        background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)'
      }}>
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ 
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%)'
    }}>
      {/* Top Bar */}
      <TopBar 
        username={session?.user?.name || 'User'}
        email={session?.user?.email || ''}
        profileImage={session?.user?.image || undefined}
        calendarEvents={calendarEvents}
      />
      
      {/* Main Dashboard */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - 208px width */}
        <div className="frosted-panel" style={{ width: '208px' }}>
          <LeftSidebar 
            calendarEvents={calendarEvents}
            todoItems={todoItems}
            onAddEvent={addCalendarEvent}
            onUpdateEvent={updateCalendarEvent}
            onDeleteEvent={deleteCalendarEvent}
            onCompleteTodo={handleCompleteTodo}
            onDeleteTodo={handleDeleteTodo}
            onAddTodo={handleAddTodo}
            onUpdateTodo={handleUpdateTodo}
          />
        </div>
        
        <div className="flex-1 flex">
          {/* CENTER PANEL */}
          <div className="flex-1 border-r border-gray-200 frosted-panel">
            <CenterPanel 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onAddCalendarEvent={addCalendarEvent}
            />
          </div>
          
          {/* RIGHT SIDEBAR - 208px width (same as left) */}
          <div className="frosted-panel" style={{ width: '208px' }}>
            <RightSidebar 
              onAddTodo={handleAddTodo}
            />
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}  
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