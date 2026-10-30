import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Calendar,
  ExternalLink,
  Download,
  Trash2,
  X,
  Search,
  AlertCircle,
  Briefcase,
  BookOpen,
  CalendarDays,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New notice form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    targetSection: 'All CSE Sections',
    expiryDate: '',
    link: '',
    isImportant: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isTeacherOrAdmin =
    user?.role === 'teacher' || user?.role === 'faculty' || user?.role === 'admin';

  const categories = [
    'All',
    'Exam',
    'Internship',
    'Workshop',
    'Seminar',
    'Holiday',
    'General',
  ];

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const res = await api.get(`/announcements?${params.toString()}`);
      setNotices(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await api.delete(`/announcements/${id}`);
        setNotices((prev) => prev.filter((n) => n._id !== id));
      } catch (err) {
        alert('Failed to delete notice');
      }
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/announcements', {
        ...formData,
        targetDepartment: 'CSE',
      });
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'General',
        targetSection: 'All CSE Sections',
        expiryDate: '',
        link: '',
        isImportant: false,
      });
      fetchNotices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Exam':
        return 'badge-danger';
      case 'Internship':
        return 'badge-success';
      case 'Workshop':
      case 'Seminar':
        return 'badge-teacher';
      case 'Holiday':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            CSE Academic Notice Board
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Official announcements, timetables, and section-specific circulars.
          </p>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Publish Notice
          </button>
        )}
      </div>

      {/* Section Isolation Notice */}
      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          fontSize: '0.825rem',
          color: '#1e40af',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ShieldCheck size={18} color="#2563eb" />
        <span>
          {isTeacherOrAdmin
            ? 'Faculty mode: You can target announcements to specific CSE sections or publish college-wide to All CSE Sections.'
            : `Showing notices targeted to ${user?.section || 'your section'} and All CSE Sections.`}
        </span>
      </div>

      {/* Category Pills & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', fontSize: '0.8rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="search-input-wrapper" style={{ maxWidth: '280px' }}>
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Notice Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#4f46e5' }}>
          Loading notices...
        </div>
      ) : notices.length === 0 ? (
        <div className="empty-state">
          <Megaphone size={36} color="#94a3b8" />
          <h3 className="empty-state-title">No notices found</h3>
          <p className="empty-state-text">There are currently no active announcements in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map((notice) => {
            const canDelete =
              user && (user.id === notice.createdBy?._id || user.id === notice.createdBy || user.role === 'admin');

            return (
              <div
                key={notice._id}
                className="card"
                style={{
                  borderLeft: notice.isImportant ? '4px solid #ef4444' : '4px solid #4f46e5',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${getCategoryBadgeClass(notice.category)}`} style={{ fontSize: '0.75rem' }}>
                      {notice.category}
                    </span>

                    <span
                      style={{
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '1px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      Target: {notice.targetSection || 'All CSE Sections'}
                    </span>

                    {notice.isImportant && (
                      <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                        <Sparkles size={11} /> High Priority
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={13} />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteNotice(notice._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        title="Delete notice"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  {notice.title}
                </h3>

                <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.85rem', whiteSpace: 'pre-wrap' }}>
                  {notice.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                  <div>
                    Published by: <strong>{notice.creatorName}</strong> ({notice.creatorRole})
                  </div>

                  {notice.link && (
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#4f46e5',
                        fontWeight: 600,
                      }}
                    >
                      Visit Official Portal / Apply Link <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Notice Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Publish Academic Notice</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateNotice}>
              <div className="form-group">
                <label className="form-label">Notice Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CSE Mid-Term Theory Examination Timetable"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Exam">Exam</option>
                    <option value="Internship">Internship</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Holiday">Holiday</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Section</label>
                  <select
                    className="form-select"
                    value={formData.targetSection}
                    onChange={(e) => setFormData({ ...formData, targetSection: e.target.value })}
                  >
                    <option value="All CSE Sections">All CSE Sections</option>
                    <option value="CSE 1">CSE 1</option>
                    <option value="CSE 2">CSE 2</option>
                    <option value="CSE 3">CSE 3</option>
                    <option value="CSE 4">CSE 4</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Details *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide comprehensive details, instructions, or schedules..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">External Link or Portal URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    style={{ accentColor: '#ef4444' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                    Mark as Urgent / High Priority Notice
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
