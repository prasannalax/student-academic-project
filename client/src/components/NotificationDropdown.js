import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, BookOpen, AlertCircle, Calendar, Megaphone, HelpCircle, FileCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'teacher_material':
      case 'note':
        return <BookOpen size={16} color="#4f46e5" />;
      case 'assignment':
        return <Calendar size={16} color="#0ea5e9" />;
      case 'announcement':
        return <Megaphone size={16} color="#f59e0b" />;
      case 'report':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'notes_request':
        return <HelpCircle size={16} color="#8b5cf6" />;
      case 'request_fulfilled':
        return <FileCheck size={16} color="#10b981" />;
      default:
        return <Bell size={16} color="#64748b" />;
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
    setIsOpen(false);

    if (item.type === 'note' || item.type === 'teacher_material') {
      if (item.relatedId) navigate(`/notes/${item.relatedId}`);
    } else if (item.type === 'assignment') {
      navigate('/assignments');
    } else if (item.type === 'announcement') {
      navigate('/notice-board');
    } else if (item.type === 'notes_request') {
      navigate('/notes-requests');
    } else if (item.type === 'request_fulfilled') {
      if (item.relatedId) navigate(`/notes/${item.relatedId}`);
      else navigate('/notes-requests');
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? '#eef2ff' : '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.15s ease',
        }}
        title="Notifications"
      >
        <Bell size={20} color="#475569" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '9999px',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid white',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '360px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 60,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                }}
              >
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: item.isRead ? 'white' : '#f8faff',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = item.isRead ? 'white' : '#f8faff')
                  }
                >
                  <div
                    style={{
                      marginTop: '2px',
                      padding: '6px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: item.isRead ? 600 : 700,
                        color: '#1e293b',
                        marginBottom: '2px',
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.message}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Clock size={11} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {!item.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#4f46e5',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
