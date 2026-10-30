import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckSquare,
  Megaphone,
  UploadCloud,
  Search,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Users,
  ShieldCheck,
  Star,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NoteCard from '../components/NoteCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recentNotes, setRecentNotes] = useState([]);
  const [teacherMaterials, setTeacherMaterials] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [latestNotices, setLatestNotices] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [searchVal, setSearchVal] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch common recent notes
      const notesRes = await api.get('/notes?limit=6');
      setRecentNotes(notesRes.data.data || []);

      // Fetch teacher official materials
      const teacherRes = await api.get('/notes?isTeacherMaterial=true&limit=4');
      setTeacherMaterials(teacherRes.data.data || []);

      // Fetch assignments
      const assignRes = await api.get('/assignments');
      setUpcomingAssignments((assignRes.data.data || []).slice(0, 4));

      // Fetch announcements
      const noticeRes = await api.get('/announcements');
      setLatestNotices((noticeRes.data.data || []).slice(0, 3));

      // If admin, fetch system stats & pending reports
      if (user?.role === 'admin') {
        const [statsRes, reportsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/reports?status=Pending'),
        ]);
        setAdminStats(statsRes.data.data);
        setPendingReports(reportsRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/notes?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleToggleAssignment = async (id) => {
    try {
      await api.put(`/assignments/${id}/toggle-complete`);
      setUpcomingAssignments((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, isCompletedByMe: !a.isCompletedByMe } : a
        )
      );
    } catch (err) {
      console.error('Error toggling assignment:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '1rem', color: '#4f46e5', fontWeight: 600 }}>
          Loading dashboard insights...
        </div>
      </div>
    );
  }

  /* =====================================================================
     STUDENT VIEW
  ===================================================================== */
  if (user?.role === 'student') {
    return (
      <div>
        {/* Welcome Hero Banner */}
        <div className="hero-banner">
          <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              🎓 Student Academic Space • {user.department} ({user.semester})
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>
              Hello, {user.name}!
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Missed a class due to illness, placement, or project work? Find today's lecture notes, verified teacher slides, and active assignments below.
            </p>

            {/* In-Banner Quick Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="text"
                  placeholder="Find notes by subject or topic (e.g. Computer Networks)..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: '#0f172a',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                }}
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="stat-card">
            <div className="stat-icon primary">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-value">{recentNotes.length}+</div>
              <div className="stat-label">Available Notes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon accent">
              <Award size={24} />
            </div>
            <div>
              <div className="stat-value">{teacherMaterials.length}</div>
              <div className="stat-label">Teacher Materials</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon secondary">
              <CheckSquare size={24} />
            </div>
            <div>
              <div className="stat-value">{upcomingAssignments.length}</div>
              <div className="stat-label">Active Assignments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="stat-value">{latestNotices.length}</div>
              <div className="stat-label">College Notices</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left 2 Cols (Notes), Right 1 Col (Assignments & Notices) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div>
            {/* Section: Official Teacher Materials */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#b45309" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Official Faculty Materials
                  </h2>
                </div>
                <Link
                  to="/notes?isTeacherMaterial=true"
                  style={{
                    fontSize: '0.85rem',
                    color: '#4f46e5',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              {teacherMaterials.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No teacher materials uploaded yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {teacherMaterials.map((note) => (
                    <NoteCard key={note._id} note={note} onNoteUpdated={fetchDashboardData} />
                  ))}
                </div>
              )}
            </div>

            {/* Section: Recently Uploaded Notes */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="#4f46e5" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Recently Added Class Notes
                  </h2>
                </div>
                <Link
                  to="/notes"
                  style={{
                    fontSize: '0.85rem',
                    color: '#4f46e5',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Browse all <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {recentNotes.map((note) => (
                  <NoteCard key={note._id} note={note} onNoteUpdated={fetchDashboardData} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Upcoming Tasks & Notice Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Upcoming Assignments Card */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={18} color="#0ea5e9" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Tasks</h3>
                </div>
                <Link to="/assignments" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                  View All
                </Link>
              </div>

              {upcomingAssignments.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No pending assignments!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {upcomingAssignments.map((task) => (
                    <div
                      key={task._id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#0ea5e9',
                              backgroundColor: '#e0f2fe',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {task.subject}
                          </span>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '4px' }}>
                            {task.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleToggleAssignment(task._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: task.isCompletedByMe ? '#10b981' : '#cbd5e1',
                          }}
                          title={task.isCompletedByMe ? 'Completed' : 'Mark as done'}
                        >
                          <CheckCircle size={20} fill={task.isCompletedByMe ? '#d1fae5' : 'none'} />
                        </button>
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={12} /> Due: {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notice Board Card */}
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} color="#f59e0b" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notice Board</h3>
                </div>
                <Link to="/notice-board" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                  All Notices
                </Link>
              </div>

              {latestNotices.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No notices posted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {latestNotices.map((notice) => (
                    <div
                      key={notice._id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: notice.isImportant ? '#fffbeb' : '#f8fafc',
                        border: notice.isImportant ? '1px solid #fde68a' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '3px' }}>
                        <span
                          className={`badge ${
                            notice.category === 'Exam'
                              ? 'badge-danger'
                              : notice.category === 'Internship'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                          style={{ fontSize: '0.68rem', padding: '1px 6px' }}
                        >
                          {notice.category}
                        </span>
                        {notice.isImportant && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b45309' }}>
                            ★ Urgent
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                        {notice.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        {new Date(notice.createdAt).toLocaleDateString()} • {notice.creatorName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Upload CTA */}
            <div
              style={{
                background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #c7d2fe',
                textAlign: 'center',
              }}
            >
              <UploadCloud size={32} color="#4f46e5" style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#312e81', marginBottom: '0.25rem' }}>
                Attended class today?
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#4338ca', marginBottom: '1rem' }}>
                Upload your handwritten or typed notes to help classmates who missed out.
              </p>
              <Link to="/upload" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Upload Class Notes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================================
     TEACHER / FACULTY VIEW
  ===================================================================== */
  if (user?.role === 'teacher') {
    return (
      <div>
        <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              👩‍🏫 Faculty Academic Space • {user.department}
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome, {user.name}
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Upload official slides, lecture notes, post homework tasks, and notify your department students instantly.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/upload" className="btn btn-primary" style={{ backgroundColor: '#ffffff', color: '#1e3a8a' }}>
                <UploadCloud size={16} /> Upload Official Slides
              </Link>
              <Link to="/assignments" className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <CheckSquare size={16} /> Create Assignment
              </Link>
              <Link to="/notice-board" className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <Megaphone size={16} /> Publish Announcement
              </Link>
            </div>
          </div>
        </div>

        {/* Teacher Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div className="stat-card">
            <div className="stat-icon primary">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-value">{teacherMaterials.length}</div>
              <div className="stat-label">Official Materials</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon secondary">
              <CheckSquare size={24} />
            </div>
            <div>
              <div className="stat-value">{upcomingAssignments.length}</div>
              <div className="stat-label">Active Tasks Posted</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon accent">
              <Star size={24} />
            </div>
            <div>
              <div className="stat-value">4.9 ★</div>
              <div className="stat-label">Average Student Rating</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <Download size={24} />
            </div>
            <div>
              <div className="stat-value">120+</div>
              <div className="stat-label">Student Downloads</div>
            </div>
          </div>
        </div>

        {/* Teacher Materials Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>My Uploaded Course Materials</h2>
            <Link to="/upload" className="btn btn-primary btn-sm">
              <UploadCloud size={15} /> Upload More
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {teacherMaterials.map((note) => (
              <NoteCard key={note._id} note={note} onNoteUpdated={fetchDashboardData} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================================
     ADMINISTRATOR VIEW
  ===================================================================== */
  return (
    <div>
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #3b0764, #6b21a8)' }}>
        <div style={{ maxWidth: '650px', position: 'relative', zIndex: 1 }}>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
          >
            🛡️ Administration & Platform Moderation
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Admin Portal: {user.name}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            Inspect student reports, maintain academic material integrity, manage user roles, and monitor engagement.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin" className="btn btn-primary" style={{ backgroundColor: '#ffffff', color: '#581c87' }}>
              <ShieldCheck size={16} /> Open Moderation Console
            </Link>
            <Link to="/notes" className="btn" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <BookOpen size={16} /> Inspect All Notes
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{adminStats?.users?.students ?? 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon secondary">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{adminStats?.users?.teachers ?? 0}</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{adminStats?.notes?.total ?? 0}</div>
            <div className="stat-label">Academic Notes</div>
          </div>
        </div>

        <div className="stat-card" style={{ border: pendingReports.length > 0 ? '1px solid #fca5a5' : '1px solid #e2e8f0' }}>
          <div className="stat-icon danger">
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div>
            <div className="stat-value" style={{ color: pendingReports.length > 0 ? '#dc2626' : 'inherit' }}>
              {pendingReports.length}
            </div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>
      </div>

      {/* Pending Reports Moderation Card */}
      {pendingReports.length > 0 && (
        <div
          className="card"
          style={{
            border: '1px solid #fecaca',
            backgroundColor: '#fffaf0',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#dc2626" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b' }}>
                Content Reports Requiring Moderation ({pendingReports.length})
              </h3>
            </div>
            <Link to="/admin" className="btn btn-danger btn-sm">
              Review in Moderation Tab
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingReports.map((report) => (
              <div
                key={report._id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-danger">{report.reason}</span>
                    <strong style={{ fontSize: '0.9rem' }}>{report.noteTitle}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Reported by <strong>{report.reporterName}</strong>: "{report.description || 'No comment provided'}"
                  </div>
                </div>
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  Take Action
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes Overview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Uploads across Departments</h2>
          <Link to="/notes" className="btn btn-secondary btn-sm">
            View All Notes
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {recentNotes.map((note) => (
            <NoteCard key={note._id} note={note} onNoteUpdated={fetchDashboardData} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
