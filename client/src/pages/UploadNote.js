import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UploadNote = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'teacher' || user?.role === 'faculty' || user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Networks',
    topic: '',
    description: '',
    department: 'CSE',
    targetSection: isTeacher ? 'All CSE Sections' : (user?.section || 'CSE 3'),
    semester: user?.semester || 'Semester 5',
    classDate: new Date().toISOString().split('T')[0],
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
      setError('Please attach your lecture file (PDF, PPT, DOC, Image, or TXT)');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(20);

      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('topic', formData.topic);
      data.append('description', formData.description);
      data.append('department', 'CSE');
      data.append('targetSection', isTeacher ? formData.targetSection : (user?.section || 'CSE 3'));
      data.append('semester', formData.semester);
      data.append('classDate', formData.classDate);

      const res = await api.post('/notes', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/notes/${res.data.data._id}`);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to upload notes. Please check all fields.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          {isTeacher ? 'Upload Official Faculty Material' : 'Upload Academic Class Notes'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          {isTeacher
            ? 'Publish official slides or reference material targeted to specific CSE sections or all sections.'
            : `Share class notes with peers in your section (${user?.section || 'CSE'}).`}
        </p>
      </div>

      <div className="card">
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle size={20} />
            <span>Note uploaded successfully! Redirecting to resource page...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Note Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Computer Networks - Chapter 1: Ethernet Standards & CSMA/CD"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <div className="form-group">
              <label className="form-label">Topic / Chapter *</label>
              <input
                type="text"
                name="topic"
                className="form-input"
                placeholder="e.g. CSMA/CD, Gigabit Ethernet"
                value={formData.topic}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value="CSE (Computer Science)"
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600 }}
              />
            </div>

            {/* Target Section: selectable for faculty, locked for students */}
            <div className="form-group">
              <label className="form-label">
                {isTeacher ? 'Target Section *' : 'Your Section (Locked)'}
              </label>
              {isTeacher ? (
                <select
                  name="targetSection"
                  className="form-select"
                  value={formData.targetSection}
                  onChange={handleChange}
                  required
                >
                  <option value="All CSE Sections">All CSE Sections</option>
                  <option value="CSE 1">CSE 1</option>
                  <option value="CSE 2">CSE 2</option>
                  <option value="CSE 3">CSE 3</option>
                  <option value="CSE 4">CSE 4</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  value={user?.section || 'CSE 3'}
                  disabled
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 700, color: '#4f46e5' }}
                />
              )}
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
            <label className="form-label">Description & Summary (Optional)</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={3}
              placeholder="Highlight key equations, formulas, slide numbers, or topics discussed..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* File Upload Zone */}
          <div className="form-group">
            <label className="form-label">Attach Notes File * (PDF, PPT, Word, Image, TXT &bull; Max 25MB)</label>
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => document.getElementById('note-file-input').click()}
            >
              <input
                type="file"
                id="note-file-input"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
              />
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <UploadCloud size={28} />
              </div>

              {file ? (
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    {file.name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to upload
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, color: '#334155' }}>
                    Click to browse or drag and drop your file here
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    Supports PDF, DOCX, PPTX, TXT, Images up to 25MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Isolation Info Notice */}
          <div
            style={{
              padding: '0.75rem 1rem',
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
            <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>
              {isTeacher
                ? `Faculty materials can be viewed by all students enrolled in ${formData.targetSection}.`
                : `Student notes will only be visible to classmates registered in your section (${user?.section || 'CSE 3'}).`}
            </span>
          </div>

          {uploading && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                <span>Uploading document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#4f46e5',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.2s',
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/notes')}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !file}
              style={{ minWidth: '150px' }}
            >
              <UploadCloud size={18} />
              {uploading ? 'Uploading...' : 'Publish Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadNote;
