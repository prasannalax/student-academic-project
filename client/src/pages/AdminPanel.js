import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  BarChart3,
  CheckCircle2,
  Trash2,
  Eye,
  Search,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(true);

  // Tab 1: Reports
  const [reports, setReports] = useState([]);
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  const [resolvingId, setResolvingId] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Tab 2: Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Tab 3: Stats
  const [stats, setStats] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get(`/reports?status=${reportStatusFilter}`);
      setReports(res.data.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?search=${userSearch}`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchReports(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [reportStatusFilter]);

  const handleResolveReport = async (reportId, status, shouldDeleteNote = false) => {
    try {
      await api.put(`/reports/${reportId}`, {
        status,
        adminNotes: adminNoteInput || `Marked as ${status} by admin`,
        deleteNote: shouldDeleteNote,
      });
      setResolvingId(null);
      setAdminNoteInput('');
      fetchReports();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating report');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Error updating user role');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert('Error changing user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user? All their records will be removed.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
        fetchStats();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Administration & Moderation Center
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Review reported notes, manage student & faculty user roles, and inspect platform health.
        </p>
      </div>

      {/* Admin Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reports' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'reports' ? '#4f46e5' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} color={activeTab === 'reports' ? '#ef4444' : '#64748b'} />
          <span>Reported Notes Moderation</span>
          {reports.filter((r) => r.status === 'Pending').length > 0 && (
            <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', padding: '2px 7px', borderRadius: '10px' }}>
              {reports.filter((r) => r.status === 'Pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'users' ? '#4f46e5' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={18} />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stats' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'stats' ? '#4f46e5' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BarChart3 size={18} />
          <span>Platform Analytics</span>
        </button>
      </div>

      {/* TAB 1: REPORTS MODERATION */}
      {activeTab === 'reports' && (
        <div>
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['All', 'Pending', 'Reviewed', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setReportStatusFilter(st)}
                className={`btn btn-sm ${reportStatusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              >
                {st}
              </button>
            ))}
          </div>

          {reports.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={40} color="#10b981" />
              <h3 className="empty-state-title">No reports found in this status</h3>
              <p className="empty-state-text">All academic materials are currently verified and clean.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="card"
                  style={{
                    borderLeft: report.status === 'Pending' ? '4px solid #ef4444' : '4px solid #10b981',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-danger">{report.reason}</span>
                      <span
                        className={`badge ${
                          report.status === 'Resolved'
                            ? 'badge-success'
                            : report.status === 'Reviewed'
                            ? 'badge-student'
                            : 'badge-warning'
                        }`}
                      >
                        Status: {report.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Reported on {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Target Note: "{report.noteTitle}"
                  </h3>

                  <p style={{ color: '#334155', fontSize: '0.9rem', marginBottom: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                    <strong>Reporter Remark:</strong> "{report.description || 'No detailed remark provided'}"
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                    Reported by: <strong>{report.reporterName}</strong> ({report.reporterEmail})
                  </div>

                  {report.adminNotes && (
                    <div style={{ fontSize: '0.8rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                      <strong>Resolution Note:</strong> {report.adminNotes}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    {report.note?._id && (
                      <Link
                        to={`/notes/${report.note._id}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={14} /> Inspect Target Note
                      </Link>
                    )}

                    {report.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleResolveReport(report._id, 'Resolved')}
                          className="btn btn-primary btn-sm"
                        >
                          Mark as Resolved (Keep Note)
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete note and resolve report?')) {
                              handleResolveReport(report._id, 'Resolved', true);
                            }
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} /> Remove Note & Resolve
                        </button>

                        <button
                          onClick={() => handleResolveReport(report._id, 'Reviewed')}
                          className="btn btn-secondary btn-sm"
                        >
                          Dismiss (Mark Reviewed)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ maxWidth: '350px' }}>
              <Search size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Search user by name, email, or ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchUsers();
                }}
              />
            </div>
            <button onClick={fetchUsers} className="btn btn-secondary btn-sm">
              Search Users
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Semester / ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="form-select"
                        style={{ padding: '3px 8px', fontSize: '0.8rem', width: '110px' }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>{u.department}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {u.semester || 'N/A'} • {u.rollOrEmployeeId || '-'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete user"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM ANALYTICS */}
      {activeTab === 'stats' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon primary">
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.users.total}</div>
                <div className="stat-label">Total Registered Users</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.notes.total}</div>
                <div className="stat-label">Academic Documents</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon secondary">
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.notes.totalDownloads}</div>
                <div className="stat-label">Total Document Downloads</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon accent">
                <AlertTriangle size={24} color="#f59e0b" />
              </div>
              <div>
                <div className="stat-value">{stats.moderation.pendingReports}</div>
                <div className="stat-label">Pending Reports</div>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Academic Notes by Department
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.departmentBreakdown?.map((d) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 600 }}>{d._id}</span>
                  <span className="badge badge-student">{d.count} notes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
