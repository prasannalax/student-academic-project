import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import api from '../services/api';

const FulfillRequestModal = ({ request, onClose, onFulfilled }) => {
  const [title, setTitle] = useState(
    `${request.subject} - ${request.topic} (Class Notes)`
  );
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  if (!request) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 25 * 1024 * 1024) {
      setError('File exceeds 25MB limit. Please upload a smaller document.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please attach your notes document (PDF, PPT, DOC, Image, or TXT).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setUploadProgress(25);

      const data = new FormData();
      data.append('file', file);
      data.append('title', title);
      data.append('message', message);

      const res = await api.post(`/note-requests/${request._id}/respond`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      if (onFulfilled) {
        onFulfilled(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to upload notes. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const classDateStr = new Date(request.classDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>
              Respond to Notes Request
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Helping <strong>{request.requesterName}</strong> with class notes
            </span>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary btn-sm">
            <X size={18} />
          </button>
        </div>

        {/* Request Summary Box */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.875rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, color: '#4f46e5' }}>
              {request.subject}
            </span>
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={13} /> Lecture Date: {classDateStr}
            </span>
          </div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            Topic: {request.topic}
          </div>
          {request.description && (
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px', fontStyle: 'italic' }}>
              "{request.description}"
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Note Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attach Notes File (PDF, PPT, DOC, Image, TXT) *</label>
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: file ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('fulfill-file-input').click()}
            >
              <input
                type="file"
                id="fulfill-file-input"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
              />
              <UploadCloud
                size={32}
                color={file ? '#16a34a' : '#4f46e5'}
                style={{ margin: '0 auto 0.5rem' }}
              />
              {file ? (
                <div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Click or drop notes file here
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    PDF, PPT, Word, Image, or Text (Max 25MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message to Classmate (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Here are my lecture notes and the whiteboard diagrams from this class!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>

          {submitting && (
            <div style={{ margin: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span>Uploading notes...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#4f46e5',
                    transition: 'width 0.2s',
                  }}
                />
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <UploadCloud size={16} />
              {submitting ? 'Uploading...' : 'Share Notes & Fulfill Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FulfillRequestModal;
