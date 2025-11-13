// components/dashboard/TodoList.tsx
'use client';

import React, { useState } from 'react';
import { Note } from '../../app/types';

interface TodoListProps {
  todoItems: Note[];
  onCompleteTodo: (noteId: string, completed: boolean) => void;
  onDeleteTodo: (noteId: string) => void;
}

export default function TodoList({ 
  todoItems, 
  onCompleteTodo, 
  onDeleteTodo 
}: TodoListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  
  // Filter todos based on selected filter
  const filteredTodos = todoItems.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'active') return !note.completed;
    if (filter === 'completed') return note.completed;
    return true;
  });
  
  // Sort todos based on selected criteria
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
    } else {
      // Priority sorting: high -> medium -> low
      const getPriorityValue = (note: Note) => {
        const content = note.content.toLowerCase();
        if (content.includes('urgent') || content.includes('asap') || content.includes('critical')) {
          return 3;
        } else if (content.includes('important') || content.includes('priority')) {
          return 2;
        }
        return 1;
      };
      return getPriorityValue(b) - getPriorityValue(a);
    }
  });
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '160px' }}>
      {/* Ultra-Compact Header */}
      <div style={{ 
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ color: '#F4B000' }}>✓</span> To-Do List
        </h2>
        
        {/* Filter tabs in even more compact layout */}
        <div style={{ 
          display: 'flex', 
          borderRadius: '6px', 
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          backgroundColor: 'white'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '3px 0',
              fontSize: '10px',
              fontWeight: '600',
              backgroundColor: filter === 'all' ? '#EFF6FF' : 'white',
              color: filter === 'all' ? '#3B82F6' : '#6B7280',
              border: 'none',
              borderRight: '1px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            style={{
              flex: 1,
              padding: '3px 0',
              fontSize: '10px',
              fontWeight: '600',
              backgroundColor: filter === 'active' ? '#EFF6FF' : 'white',
              color: filter === 'active' ? '#3B82F6' : '#6B7280',
              border: 'none',
              borderRight: '1px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            Act
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              flex: 1,
              padding: '3px 0',
              fontSize: '10px',
              fontWeight: '600',
              backgroundColor: filter === 'completed' ? '#EFF6FF' : 'white',
              color: filter === 'completed' ? '#3B82F6' : '#6B7280',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
        
        {/* Sort dropdown - ultra compact */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
          style={{
            padding: '3px 6px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            fontSize: '10px',
            fontWeight: '500',
            color: '#4B5563',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 6px center',
            backgroundSize: '10px',
            paddingRight: '20px',
            width: '100%'
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>
      
      {/* Todo list - ultra compact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'auto', flex: 1 }}>
        {sortedTodos.length === 0 ? (
          <div style={{ 
            padding: '16px 8px', 
            textAlign: 'center', 
            color: '#9CA3AF',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            border: '1px dashed #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>✓</div>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>Tasks will appear here...</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              Use /todo to add tasks
            </div>
          </div>
        ) : (
          sortedTodos.map(todo => {
            const isPriority = todo.content.toLowerCase().includes('urgent') || 
                              todo.content.toLowerCase().includes('asap') ||
                              todo.content.toLowerCase().includes('critical');
            
            return (
              <div 
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(5px)',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
              >
                {/* Checkbox - smaller */}
                <div
                  onClick={() => onCompleteTodo(todo.id, !todo.completed)}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    border: todo.completed ? 'none' : '1px solid #D1D5DB',
                    backgroundColor: todo.completed ? '#10B981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {todo.completed && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                
                {/* Content - more compact */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '11px',
                    color: todo.completed ? '#9CA3AF' : '#1F2937',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {todo.content}
                  </div>
                  
                  <div style={{ 
                    fontSize: '9px',
                    color: '#6B7280',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>
                      {new Date(todo.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    
                    {isPriority && (
                      <span style={{
                        padding: '1px 3px',
                        backgroundColor: '#FEF2F2',
                        color: '#EF4444',
                        borderRadius: '2px',
                        fontSize: '8px',
                        fontWeight: '600'
                      }}>
                        !
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Delete button - smaller */}
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '3px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0.5,
                    transition: 'opacity 0.2s',
                    color: '#6B7280',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                >
                  <span style={{ fontSize: '14px' }}>×</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}