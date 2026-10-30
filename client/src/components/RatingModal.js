import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '../services/api';

const RatingModal = ({ note, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!note) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/notes/${note._id}/reviews`, {
        rating,
        comment,
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(res.data);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Rate & Review Notes</h3>
          <button onClick={onClose} className="btn-icon btn-secondary btn-sm">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Sharing your feedback helps classmates and professors know the usefulness and clarity of this material.
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

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ alignItems: 'center', textAlign: 'center', margin: '1.5rem 0' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>
              How useful was this note? ({hoverRating || rating} / 5 Stars)
            </label>
            <div className="star-rating" style={{ gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className="star-interactive"
                  fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                  color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Written Review / Remarks (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Very clear explanation of the algorithm, covers all syllabus points..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
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
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
