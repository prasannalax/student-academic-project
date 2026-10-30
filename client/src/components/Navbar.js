import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  LogOut,
  User as UserIcon,
  Menu,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getRoleBadge = (u) => {
    if (!u) return null;
    if (u.role === 'teacher' || u.role === 'faculty') {
      return <span className="badge badge-teacher">CSE Faculty</span>;
    }
    if (u.role === 'admin') {
      return <span className="badge badge-admin">Administrator</span>;
    }
    return (
      <span
        style={{
          backgroundColor: '#e0e7ff',
          color: '#4338ca',
          padding: '0.15rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        {u.section ? `${u.section}` : 'CSE Student'}
      </span>
    );
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleSidebar}
          className="btn-icon btn-secondary"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-brand-icon">
            <GraduationCap size={22} />
          </div>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.1 }}>Academic Companion</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#6366f1', letterSpacing: '0.04em' }}>
              CSE DEPARTMENT PORTAL
            </span>
          </span>
        </Link>
      </div>

      {/* Global Quick Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          width: '380px',
          maxWidth: '100%',
        }}
        id="navbar-search"
      >
        <Search
          size={17}
          style={{
            position: 'absolute',
            left: '12px',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search subjects, topics, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 1rem 0.5rem 2.4rem',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.borderColor = '#6366f1';
            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </form>

      {/* Right actions: notifications and user profile */}
      <div className="navbar-actions">
        {user ? (
          <>
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                className="user-chip"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="user-avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {user.role === 'student'
                      ? `${user.section || 'CSE'} • Roll: ${user.rollNumber || user.rollOrEmployeeId || 'N/A'}`
                      : `${user.role ? user.role.toUpperCase() : ''} • CSE`}
                  </span>
                </div>
                <ChevronDown size={14} color="#94a3b8" />
              </div>

              {profileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '230px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 60,
                    padding: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid #f1f5f9',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                      {user.email}
                    </div>
                    {user.rollNumber && (
                      <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
                        Roll No: {user.rollNumber}
                      </div>
                    )}
                    <div style={{ marginTop: '0.35rem' }}>{getRoleBadge(user)}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      color: '#334155',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserIcon size={16} color="#64748b" /> My Profile & Uploads
                  </Link>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={16} color="#ef4444" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
