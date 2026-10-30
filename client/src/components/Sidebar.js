import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FolderTree,
  UploadCloud,
  CheckSquare,
  Megaphone,
  ShieldCheck,
  Award,
  HelpCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isFaculty = user?.role === 'teacher' || user?.role === 'faculty';

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <div className="sidebar-section-title">ACADEMIC HUB</div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          <Search size={19} />
          <span>Notes Library</span>
        </NavLink>

        <NavLink
          to="/organize"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          <FolderTree size={19} />
          <span>Organized Hierarchy</span>
        </NavLink>

        {user?.role === 'student' && (
          <NavLink
            to="/notes-requests"
            className={({ isActive }) =>
              `nav-link-item ${isActive ? 'active' : ''}`
            }
          >
            <HelpCircle size={19} color="#6366f1" />
            <span>Class Notes Requests</span>
          </NavLink>
        )}

        <div className="sidebar-section-title">TASKS & NOTICES</div>

        <NavLink
          to="/assignments"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          <CheckSquare size={19} />
          <span>Assignments & Tasks</span>
        </NavLink>

        <NavLink
          to="/notice-board"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          <Megaphone size={19} />
          <span>Notice Board</span>
        </NavLink>

        <div className="sidebar-section-title">CONTRIBUTE</div>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          <UploadCloud size={19} />
          <span>{isFaculty ? 'Upload Faculty Material' : 'Upload Class Notes'}</span>
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <div className="sidebar-section-title">ADMINISTRATION</div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'active' : ''}`
              }
            >
              <ShieldCheck size={19} color="#7c3aed" />
              <span>Admin Moderation</span>
            </NavLink>
          </>
        )}
      </div>

      {/* User Information Card in Sidebar Footer */}
      {user && (
        <div
          style={{
            padding: '0.85rem 1rem',
            margin: '0.75rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Award size={16} color="#6366f1" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
              Academic Profile
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
            <div>
              <strong>Dept:</strong> CSE (Computer Science)
            </div>
            {user.role === 'student' ? (
              <>
                <div>
                  <strong>Section:</strong>{' '}
                  <span
                    style={{
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    {user.section || 'CSE Section'}
                  </span>
                </div>
                <div>
                  <strong>Roll:</strong> {user.rollNumber || user.rollOrEmployeeId}
                </div>
              </>
            ) : (
              <div>
                <strong>Role:</strong> {isFaculty ? 'CSE Faculty' : 'Administrator'}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
