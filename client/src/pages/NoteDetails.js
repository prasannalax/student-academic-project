import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Download,
  Eye,
  Star,
  Award,
  AlertTriangle,
  User,
  ArrowLeft,
  Trash2,
  Share2,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilePreviewModal from '../components/FilePreviewModal';
import RatingModal from '../components/RatingModal';
import ReportModal from '../components/ReportModal';

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const fetchNoteAndReviews = async () => {
    try {
      setLoading(true);
      const [noteRes, reviewsRes] = await Promise.all([
        api.get(`/notes/${id}`),
        api.get(`/notes/${id}/reviews`),
      ]);
      setNote(noteRes.data.data);
      setReviews(reviewsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load note details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteAndReviews();
  }, [id]);

  const handleDeleteNote = async () => {
    if (window.confirm('Are you sure you want to permanently delete this note?')) {
      try {
        await api.delete(`/notes/${id}`);
        navigate('/notes');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete note');
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete your review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        fetchNoteAndReviews();
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ color: '#4f46e5', fontWeight: 600 }}>Loading note details...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="empty-state">
        <AlertTriangle size={36} color="#ef4444" />
        <h3 className="empty-state-title">Note Not Found</h3>
        <p className="empty-state-text">{error || 'This resource may have been deleted.'}</p>
        <Link to="/notes" className="btn btn-primary btn-sm">
          Return to Library
        </Link>
      </div>
    );
  }

  const isOwnerOrAdmin =
    user && (user.id === note.uploader?._id || user.id === note.uploader || user.role === 'admin');

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
        {/* Left Column: Note Details & Reviews */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  backgroundColor: '#eef2ff',
                  padding: '3px 10px',
                  borderRadius: '6px',
                }}
              >
                {note.subject}
              </span>

              {note.isTeacherMaterial ? (
                <span className="badge badge-teacher">
                  <Award size={14} /> Official Faculty Material
                </span>
              ) : (
                <span className="badge badge-neutral">Student Contributed</span>
              )}
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.5rem' }}>
              {note.title}
            </h1>

            <div style={{ fontSize: '0.95rem', color: '#6366f1', fontWeight: 600, marginBottom: '1rem' }}>
              Topic: {note.topic}
            </div>

            <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
              {note.description || 'No detailed lecture notes description provided.'}
            </p>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
                <Eye size={16} /> In-App Preview
              </button>
              <a
                href={`/api/notes/${note._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Download size={16} /> Download File ({note.originalFileName})
              </a>
              <button onClick={() => setShowRating(true)} className="btn btn-secondary">
                <Star size={16} color="#f59e0b" /> Rate this Note
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="btn btn-secondary"
                style={{ color: '#ef4444' }}
              >
                <AlertTriangle size={16} /> Report Error
              </button>
              {isOwnerOrAdmin && (
                <button onClick={handleDeleteNote} className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }}>
                  <Trash2 size={15} /> Delete Note
                </button>
              )}
            </div>
          </div>

          {/* Student Reviews Section */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} fill="#f59e0b" color="#f59e0b" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Ratings & Reviews ({reviews.length})
                </h3>
              </div>
              <button onClick={() => setShowRating(true)} className="btn btn-primary btn-sm">
                Write a Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>
                No reviews yet. Be the first classmate to rate this note!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev) => {
                  const canDelete =
                    user && (user.id === rev.user?._id || user.id === rev.user || user.role === 'admin');

                  return (
                    <div
                      key={rev._id}
                      style={{
                        padding: '1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rev.userName}</span>
                          <span className="badge badge-student" style={{ fontSize: '0.65rem' }}>
                            {rev.userRole}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={13}
                                fill={rev.rating >= s ? '#f59e0b' : 'none'}
                                color={rev.rating >= s ? '#f59e0b' : '#cbd5e1'}
                              />
                            ))}
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                              title="Delete Review"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                        {rev.comment || 'Rated ' + rev.rating + ' stars'}
                      </p>

                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Rating Summary Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {note.averageRating > 0 ? note.averageRating.toFixed(1) : 'New'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '0.5rem 0' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  fill={note.averageRating >= s ? '#f59e0b' : 'none'}
                  color={note.averageRating >= s ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Based on {note.totalReviews} reviews • {note.downloadCount} downloads
            </div>
          </div>

          {/* Academic Context Card */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Academic Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Department:</span>{' '}
                <strong>{note.department}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Semester:</span>{' '}
                <strong>{note.semester}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Lecture Date:</span>{' '}
                <strong>{new Date(note.classDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>File Type:</span>{' '}
                <strong>.{note.fileType} ({(note.fileSize / 1024).toFixed(1)} KB)</strong>
              </div>
            </div>
          </div>

          {/* Contributor Card */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              Uploaded By
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-avatar-circle" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                {note.uploaderName ? note.uploaderName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{note.uploaderName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Role: <strong style={{ textTransform: 'capitalize' }}>{note.uploaderRole}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <FilePreviewModal note={note} onClose={() => setShowPreview(false)} />
      )}

      {showRating && (
        <RatingModal
          note={note}
          onClose={() => setShowRating(false)}
          onReviewSubmitted={() => fetchNoteAndReviews()}
        />
      )}

      {showReport && (
        <ReportModal note={note} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
};

export default NoteDetails;
