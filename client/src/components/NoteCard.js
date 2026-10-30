import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Download,
  Eye,
  Star,
  Award,
  AlertTriangle,
  User,
  ShieldCheck,
} from 'lucide-react';
import RatingModal from './RatingModal';
import ReportModal from './ReportModal';
import FilePreviewModal from './FilePreviewModal';

const NoteCard = ({ note, onNoteUpdated }) => {
  const [showRating, setShowRating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentNote, setCurrentNote] = useState(note);

  const handleReviewSuccess = (stats) => {
    setCurrentNote((prev) => ({
      ...prev,
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    }));
    if (onNoteUpdated) onNoteUpdated();
  };

  const formattedDate = new Date(currentNote.classDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const token = localStorage.getItem('token') || '';

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        {/* Top Header: Subject & Section Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#4f46e5',
              backgroundColor: '#eef2ff',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
            }}
          >
            {currentNote.subject}
          </span>

          {currentNote.isTeacherMaterial ? (
            <span className="badge badge-teacher" title="Verified Faculty Upload">
              <Award size={13} /> Faculty: {currentNote.targetSection || 'All CSE'}
            </span>
          ) : (
            <span
              style={{
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <ShieldCheck size={12} /> {currentNote.section || 'CSE'}
            </span>
          )}
        </div>

        {/* Note Title & Topic */}
        <Link to={`/notes/${currentNote._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: '0.35rem',
              color: '#0f172a',
            }}
          >
            {currentNote.title}
          </h3>
        </Link>

        <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, marginBottom: '0.5rem' }}>
          Topic: {currentNote.topic}
        </div>

        <p
          style={{
            fontSize: '0.825rem',
            color: '#64748b',
            lineHeight: 1.45,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {currentNote.description || 'No additional lecture notes description provided.'}
        </p>

        {/* Class Date & Semester info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b',
            padding: '0.5rem 0',
            borderTop: '1px solid #f1f5f9',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} color="#94a3b8" />
            <span>Class: <strong>{formattedDate}</strong></span>
          </div>
          <div>
            <span>{currentNote.semester}</span> • <span>CSE</span>
          </div>
        </div>

        {/* Rating and Uploader */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Star size={15} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
              {currentNote.averageRating > 0 ? currentNote.averageRating.toFixed(1) : 'New'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              ({currentNote.totalReviews})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#475569' }}>
            <User size={13} color="#94a3b8" />
            <span style={{ fontWeight: 600 }}>{currentNote.uploaderName}</span>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            onClick={() => setShowPreview(true)}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            <Eye size={14} /> Preview
          </button>

          <a
            href={`/api/notes/${currentNote._id}/download?token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
          >
            <Download size={14} /> Download
          </a>
        </div>

        {/* Secondary controls: Rate & Report */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.625rem',
            paddingTop: '0.35rem',
          }}
        >
          <button
            onClick={() => setShowRating(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: 0,
            }}
          >
            <Star size={12} /> Rate this note
          </button>

          <button
            onClick={() => setShowReport(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: 0,
            }}
            title="Report inaccurate content"
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            <AlertTriangle size={12} /> Report
          </button>
        </div>
      </div>

      {showPreview && (
        <FilePreviewModal
          note={currentNote}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showRating && (
        <RatingModal
          note={currentNote}
          onClose={() => setShowRating(false)}
          onReviewSubmitted={handleReviewSuccess}
        />
      )}

      {showReport && (
        <ReportModal
          note={currentNote}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
};

export default NoteCard;
