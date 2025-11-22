// src/components/dashboard/TodoPopupModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Note } from '@/app/types';

interface TodoPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  todoItems: Note[];
  onCompleteTodo: (noteId: string, completed: boolean) => void;
  onDeleteTodo: (noteId: string) => void;
  onAddTodo: (todo: Omit<Note, 'id' | 'createdAt'>) => void;
  onUpdateTodo: (noteId: string, updates: Partial<Note>) => void;
}

export default function TodoPopupModal({
  isOpen,
  onClose,
  todoItems,
  onCompleteTodo,
  onDeleteTodo,
  onAddTodo,
  onUpdateTodo
}: TodoPopupModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'today'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    content: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      content: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
    setShowAddForm(false);
    setEditingTodo(null);
  };

  // Handle add/edit todo
  const handleSubmit = () => {
    if (!formData.content.trim()) return;

    if (editingTodo) {
      onUpdateTodo(editingTodo, {
        content: formData.content,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      });
    } else {
      onAddTodo({
        content: formData.content,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        type: 'todo',
        completed: false,
        pageId: 'default',
        linkedPages: [],
        children: [],
        parentId: null,
        indent: 0
      });
    }

    resetForm();
  };

  // Edit todo
  const handleEdit = (todo: Note) => {
    setFormData({
      content: todo.content,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
    });
    setEditingTodo(todo.id);
    setShowAddForm(true);
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Filter and sort todos
  const getFilteredTodos = () => {
    let filtered = [...todoItems];

    if (activeTab === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(todo => {
        if (todo.dueDate) {
          return new Date(todo.dueDate).toDateString() === today;
        }
        return new Date(todo.createdAt).toDateString() === today;
      });
    }

    const high = filtered.filter(t => t.priority === 'high');
    const medium = filtered.filter(t => t.priority === 'medium');
    const low = filtered.filter(t => t.priority === 'low');
    const none = filtered.filter(t => !t.priority);

    return [...high, ...medium, ...low, ...none];
  };

  // Group todos by page for follow-ups
  const getFollowUpsByPage = () => {
    const followups = todoItems.filter(todo => 
      todo.type === 'followup' || todo.linkedPages.length > 0
    );

    const grouped: { [key: string]: Note[] } = {};
    
    followups.forEach(todo => {
      const page = todo.linkedPages[0] || 'Unlinked';
      if (!grouped[page]) grouped[page] = [];
      grouped[page].push(todo);
    });

    return grouped;
  };

  if (!isOpen || !mounted) return null;

  const filteredTodos = getFilteredTodos();
  const followupsByPage = getFollowUpsByPage();

  // Render modal using Portal to document.body
  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1F2937',
              margin: 0
            }}>
              To-Do List
            </h2>
            <span style={{
              backgroundColor: '#F4B000',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {todoItems.length}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'all' ? '#F4B000' : '#F3F4F6',
              color: activeTab === 'all' ? 'white' : '#6B7280',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All Tasks
          </button>
          <button
            onClick={() => setActiveTab('today')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'today' ? '#F4B000' : '#F3F4F6',
              color: activeTab === 'today' ? 'white' : '#6B7280',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Today & Follow-ups
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '16px' }}>+</span>
            Add Task
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 12px 0'
            }}>
              {editingTodo ? 'Edit Task' : 'New Task'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Task title *"
                autoFocus
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description (optional)"
                rows={3}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>

                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={resetForm}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#F4B000',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingTodo ? 'Update' : 'Add'} Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px'
        }}>
          {activeTab === 'all' && (
            <div>
              {filteredTodos.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9CA3AF'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    No tasks yet
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Click "Add Task" to create your first task
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredTodos.map(todo => (
                    <div
                      key={todo.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div
                          onClick={() => onCompleteTodo(todo.id, !todo.completed)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            border: todo.completed ? 'none' : '2px solid #D1D5DB',
                            backgroundColor: todo.completed ? '#10B981' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}
                        >
                          {todo.completed && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: todo.completed ? '#9CA3AF' : '#1F2937',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            marginBottom: '6px'
                          }}>
                            {todo.content}
                          </div>

                          {todo.description && (
                            <div style={{
                              fontSize: '13px',
                              color: '#6B7280',
                              marginBottom: '8px'
                            }}>
                              {todo.description}
                            </div>
                          )}

                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: `${getPriorityColor(todo.priority)}20`,
                              color: getPriorityColor(todo.priority)
                            }}>
                              {getPriorityIcon(todo.priority)} {todo.priority || 'medium'}
                            </span>

                            {todo.dueDate && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: '#F3F4F6',
                                color: '#6B7280'
                              }}>
                                📅 {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleEdit(todo)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#F3F4F6',
                              color: '#6B7280',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteTodo(todo.id)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#FEE2E2',
                              color: '#EF4444',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1F2937',
                  margin: '0 0 12px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  📌 TODAY'S PRIORITY ({filteredTodos.filter(t => !t.completed).length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredTodos.filter(t => !t.completed).length === 0 ? (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                      fontSize: '14px'
                    }}>
                      No tasks for today
                    </div>
                  ) : (
                    filteredTodos.filter(t => !t.completed).map(todo => (
                      <div
                        key={todo.id}
                        style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div
                          onClick={() => onCompleteTodo(todo.id, !todo.completed)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '5px',
                            border: '2px solid #D1D5DB',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>
                            {todo.content}
                          </div>
                        </div>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          backgroundColor: `${getPriorityColor(todo.priority)}20`,
                          color: getPriorityColor(todo.priority)
                        }}>
                          {todo.priority || 'medium'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1F2937',
                  margin: '0 0 12px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  📂 FOLLOW-UPS BY PAGE
                </h3>
                {Object.keys(followupsByPage).length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#9CA3AF',
                    fontSize: '14px'
                  }}>
                    No follow-ups yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {Object.entries(followupsByPage).map(([page, todos]) => (
                      <div key={page}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#4B5563',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          👤 {page} ({todos.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '20px' }}>
                          {todos.map(todo => (
                            <div
                              key={todo.id}
                              style={{
                                padding: '10px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#1F2937'
                              }}
                            >
                              {todo.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use Portal to render at document.body level
  return createPortal(modalContent, document.body);
}