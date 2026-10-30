import React, { useState } from 'react';
import { X, HelpCircle, Calendar, BookOpen, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const RequestNotesModal = ({ onClose, onRequestCreated }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    classDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.topic || !formData.classDate) {
      setError('Please provide subject, topic, and class date.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/note-requests', formData);

      if (onRequestCreated) {
        onRequestCreated(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit notes request. Please try again.'
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
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.2rem' }}>
                Request Notes from Classmates
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Sent only to fellow classmates in <strong>{user?.section || 'your section'}</strong> (Faculty will NOT receive this)
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-secondary btn-sm">
            <X size={18} />
          </button>
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

        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            fontSize: '0.8rem',
            color: '#1e40af',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={16} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>
            This request will be isolated to your section: <strong>{user?.section || 'CSE 3'}</strong>. Students in other sections cannot see it.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              name="subject"
              className="form-input"
              placeholder="e.g. Computer Networks or Data Mining"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Topic / Chapter Needed *</label>
              <input
                type="text"
                name="topic"
                className="form-input"
                placeholder="e.g. Sliding Window Protocol & Go-Back-N"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Class Lecture Date *</label>
              <input
                type="date"
                name="classDate"
                className="form-input"
                value={formData.classDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Details / Questions (Optional)</label>
            <textarea
              name="description"
              className="form-textarea"
              placeholder="e.g. Missed this class due to placement interview. Looking for notes covering numerical examples and whiteboard diagrams..."
              value={formData.description}
              onChange={handleChange}
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
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending Request...' : `Send Request to ${user?.section || 'Classmates'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestNotesModal;
