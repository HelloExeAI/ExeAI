// components/dashboard/TodoList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '../../app/types';

interface TodoListProps {
  todoItems: Note[];
  onCompleteTodo: (noteId: string, completed: boolean) => void;
  onDeleteTodo?: (noteId: string) => void; // Optional since we don't use it
  onAddTodo?: (content: string) => void; // New prop for adding todos
}

export default function TodoList({ 
  todoItems, 
  onCompleteTodo,
  onAddTodo
}: TodoListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [savedTodos, setSavedTodos] = useState<Note[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [showAddTodo, setShowAddTodo] = useState(false);
  
  // Load todos from localStorage on initial render
  useEffect(() => {
    const savedTodosString = localStorage.getItem('exeai-todos');
    if (savedTodosString) {
      try {
        const parsed = JSON.parse(savedTodosString);
        // Convert date strings back to Date objects if needed
        const formattedTodos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }));
        setSavedTodos(formattedTodos);
      } catch (e) {
        console.error('Error parsing saved todos', e);
      }
    }
  }, []);
  
  // Save todos to localStorage whenever todoItems changes
  useEffect(() => {
    // Combine new todos with saved todos
    const allTodos = [...savedTodos];
    
    // Add any new todos from todoItems that aren't already in savedTodos
    todoItems.forEach(todo => {
      if (!allTodos.some(savedTodo => savedTodo.id === todo.id)) {
        allTodos.push(todo);
      } else {
        // Update existing todo if its completion status changed
        const index = allTodos.findIndex(savedTodo => savedTodo.id === todo.id);
        if (index !== -1) {
          allTodos[index] = todo;
        }
      }
    });
    
    // Save the combined list to localStorage
    localStorage.setItem('exeai-todos', JSON.stringify(allTodos));
    setSavedTodos(allTodos);
  }, [todoItems]);
  
  // Handle completing a todo
  const handleCompleteTodo = (noteId: string, completed: boolean) => {
    onCompleteTodo(noteId, completed);
    
    // Also update the saved todos
    const updatedSavedTodos = savedTodos.map(todo => 
      todo.id === noteId ? { ...todo, completed } : todo
    );
    localStorage.setItem('exeai-todos', JSON.stringify(updatedSavedTodos));
    setSavedTodos(updatedSavedTodos);
  };
  
  // Handle adding a new todo
  const handleAddTodo = () => {
    if (newTodoText.trim() === '') return;
    
    // Create a new todo
    const newTodo: Note = {
      id: `todo-${Date.now()}`,
      content: newTodoText,
      type: 'todo',
      completed: false,
      createdAt: new Date(),
      pageId: 'local-page', // Default page ID for todos added directly
      linkedPages: [],
      children: [],
      parentId: null,
      indent: 0
    };
    
    // Add to saved todos
    const updatedSavedTodos = [...savedTodos, newTodo];
    localStorage.setItem('exeai-todos', JSON.stringify(updatedSavedTodos));
    setSavedTodos(updatedSavedTodos);
    
    // Call parent component's onAddTodo if provided
    if (onAddTodo) {
      onAddTodo(newTodoText);
    }
    
    // Clear the input and hide the add todo form
    setNewTodoText('');
    setShowAddTodo(false);
  };
  
  // Combine todoItems and savedTodos for display
  const combinedTodos = [...todoItems];
  
  // Add saved todos that aren't in todoItems
  savedTodos.forEach(savedTodo => {
    if (!combinedTodos.some(todo => todo.id === savedTodo.id)) {
      combinedTodos.push(savedTodo);
    }
  });
  
  // Filter todos based on selected filter
  const filteredTodos = combinedTodos.filter(note => {
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
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' }}>
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#1F2937', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: '#F4B000' }}>✓</span> To-Do List
        </h2>
        
        {/* Add todo button */}
        <button
          onClick={() => setShowAddTodo(true)}
          style={{
            backgroundColor: 'transparent',
            color: '#3B82F6',
            border: 'none',
            fontSize: '20px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          +
        </button>
      </div>
      
      {/* Add todo form */}
      {showAddTodo && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="What do you need to do?"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                paddingRight: '40px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '14px',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTodo();
                } else if (e.key === 'Escape') {
                  setShowAddTodo(false);
                }
              }}
            />
            <button
              onClick={handleAddTodo}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              +
            </button>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6B7280', 
            marginTop: '6px',
            display: 'flex',
            gap: '16px'
          }}>
            <span>Press Enter to add</span>
            <span>Esc to cancel</span>
          </div>
        </div>
      )}
      
      {/* Filter tabs */}
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          borderRadius: '8px', 
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          backgroundColor: 'white'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: '13px',
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
              padding: '6px 0',
              fontSize: '13px',
              fontWeight: '600',
              backgroundColor: filter === 'active' ? '#EFF6FF' : 'white',
              color: filter === 'active' ? '#3B82F6' : '#6B7280',
              border: 'none',
              borderRight: '1px solid #E5E7EB',
              cursor: 'pointer'
            }}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: '13px',
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
        
        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            fontSize: '13px',
            fontWeight: '500',
            color: '#4B5563',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '14px',
            paddingRight: '28px',
            width: '100%'
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>
      
      {/* Todo list */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        maxHeight: '300px', 
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {sortedTodos.length === 0 ? (
          <div style={{ 
            padding: '24px 16px', 
            textAlign: 'center', 
            color: '#9CA3AF',
            backgroundColor: 'white',
            borderRadius: '10px',
            border: '1px dashed #E5E7EB',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>✓</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Tasks will appear here...</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Use /todo to add new tasks
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
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
              >
                {/* Checkbox */}
                <div
                  onClick={() => handleCompleteTodo(todo.id, !todo.completed)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '5px',
                    border: todo.completed ? 'none' : '2px solid #D1D5DB',
                    backgroundColor: todo.completed ? '#10B981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {todo.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '14px',
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
                    fontSize: '12px',
                    color: '#6B7280',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>
                      {new Date(todo.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    
                    {isPriority && (
                      <span style={{
                        padding: '1px 4px',
                        backgroundColor: '#FEF2F2',
                        color: '#EF4444',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}