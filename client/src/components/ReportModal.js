import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import api from '../services/api';

const ReportModal = ({ note, onClose }) => {
  const [reason, setReason] = useState('Incorrect');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!note) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api.post('/reports', {
        noteId: note._id,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit report. Please check if you already reported this note.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h3 className="modal-title">Report Note</h3>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary btn-sm">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#065f46',
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Report Submitted</h4>
            <p style={{ fontSize: '0.875rem' }}>
              Thank you. College administrators will inspect this resource and take appropriate action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Reporting note: <strong>"{note.title}"</strong>. Help maintain verified, clean, and helpful study materials.
            </p>

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason for reporting</label>
              <select
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="Incorrect">Incorrect information / factual errors</option>
                <option value="Irrelevant">Irrelevant or not matching syllabus</option>
                <option value="Duplicate">Duplicate upload</option>
                <option value="Inappropriate">Inappropriate, abusive, or copyrighted material</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed explanation (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Please describe which page, theorem, or section has inaccuracies..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
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
              <button
                type="submit"
                className="btn btn-danger"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
