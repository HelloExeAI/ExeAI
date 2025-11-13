'use client';

import { useState, useEffect } from 'react';
import CenterPanel from '@/components/dashboard/CenterPanel';
import LeftSidebarComponent from '@/components/dashboard/LeftSidebarComponent';
import RightSidebar from '@/components/dashboard/RightSidebar';
import { Page, Note, CalendarEvent } from '@/app/types';

export default function Dashboard() {
  // TODO: Add state for the current page   TODO: Add state for the calendar events
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);  // TODO: Add state for the success toast
  const [toastMessage, setToastMessage] = useState('');  // TODO: Add state for the toast message
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);  // TODO: Add state for the calendar events
  
  const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };
  
  const handleUpdateCalendarEvent = (updatedEvent: CalendarEvent) => {
    setCalendarEvents(prev => 
      prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
    );
  };
  
  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
  };
  
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
    <div className="flex h-screen">
      <LeftSidebarComponent 
        calendarEvents={calendarEvents}
        onAddEvent={handleAddCalendarEvent}
        onUpdateEvent={handleUpdateCalendarEvent}
        onDeleteEvent={handleDeleteCalendarEvent}
      />
      <div className="flex-1 flex">
        <div className="flex-1 border-r border-gray-200">
          <CenterPanel 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onAddCalendarEvent={handleAddCalendarEvent}
          />
        </div>
        <div className="w-[350px] right-sidebar-gradient">
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
        .right-sidebar-gradient {
          background: linear-gradient(135deg, #f5f7ff 0%, #e9ecff 25%, #e5e8ff 50%, #dbe3ff 75%, #d8e0ff 100%);
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