'use client';

import React, { useState } from 'react';
import Calendar from './Calendar';
import { CalendarEvent, Note } from '../../app/types';
import TodoPopupModal from './TodoPopupModal';

interface LeftSidebarProps {
  calendarEvents?: CalendarEvent[];
  todoItems?: Note[];
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onCompleteTodo?: (noteId: string, completed: boolean) => void;
  onDeleteTodo?: (noteId: string) => void;
  onAddTodo?: (todo: Omit<Note, 'id' | 'createdAt'>) => void;
  onUpdateTodo?: (noteId: string, updates: Partial<Note>) => void;
}

export default function LeftSidebarComponent({ 
  calendarEvents = [],
  todoItems = [],
  onAddEvent, 
  onUpdateEvent, 
  onDeleteEvent,
  onCompleteTodo = () => {},
  onDeleteTodo = () => {},
  onAddTodo = () => {},
  onUpdateTodo = () => {}
}: LeftSidebarProps) {
  const [showTodoModal, setShowTodoModal] = useState(false);
  
  // Get top 5 active todos
  const activeTodos = todoItems.filter(todo => !todo.completed).slice(0, 5);

  return (
    <div style={{ 
      height: '100%', 
      overflowY: 'auto', 
      backgroundColor: '#FAFAFA', 
      padding: '12px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Calendar */}
        <Calendar 
          events={calendarEvents} 
          onAddEvent={onAddEvent}
          onUpdateEvent={onUpdateEvent}
          onDeleteEvent={onDeleteEvent}
        />
       
        {/* Compact To-Do List */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid #E5E7EB', 
          borderRadius: '10px', 
          padding: '12px' 
        }}>
          {/* Header with + button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            cursor: 'pointer'
          }}
          onClick={() => setShowTodoModal(true)}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#F4B000' }}>✅</span>
              To-Do ({todoItems.filter(t => !t.completed).length})
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTodoModal(true);
              }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#F4B000',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D99E00'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F4B000'}
            >
              +
            </button>
          </div>

          {/* Todo List - Compact */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {activeTodos.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '12px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>✓</div>
                <div>No tasks yet</div>
              </div>
            ) : (
              activeTodos.map(todo => {
                const getPriorityIcon = (priority?: string) => {
                  switch (priority) {
                    case 'high': return '🔴';
                    case 'medium': return '🟡';
                    case 'low': return '🟢';
                    default: return '';
                  }
                };

                return (
                  <div
                    key={todo.id}
                    onClick={() => setShowTodoModal(true)}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }}
                  >
                    <span style={{ fontSize: '10px', flexShrink: 0 }}>
                      {getPriorityIcon(todo.priority)}
                    </span>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1F2937',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1
                    }}>
                      {todo.content}
                    </div>
                  </div>
                );
              })
            )}

            {/* View All Link */}
            {activeTodos.length > 0 && (
              <button
                onClick={() => setShowTodoModal(true)}
                style={{
                  marginTop: '4px',
                  padding: '6px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#F4B000',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFBEB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                View All →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Todo Popup Modal */}
      <TodoPopupModal
        isOpen={showTodoModal}
        onClose={() => setShowTodoModal(false)}
        todoItems={todoItems}
        onCompleteTodo={onCompleteTodo}
        onDeleteTodo={onDeleteTodo}
        onAddTodo={onAddTodo}
        onUpdateTodo={onUpdateTodo}
      />
    </div>
  );
}