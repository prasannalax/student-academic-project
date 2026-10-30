import React, { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  Calendar,
  Download,
  Trash2,
  Eye,
  Star,
  Award,
  Edit,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [myNotes, setMyNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    semester: user?.semester || '',
    rollOrEmployeeId: user?.rollOrEmployeeId || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchMyNotes = async () => {
    if (!user) return;
    try {
      setLoadingNotes(true);
      const res = await api.get(`/notes?uploader=${user.id || user._id}`);
      setMyNotes(res.data.data || []);
    } catch (err) {
      console.error('Error fetching user notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchMyNotes();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this uploaded note?')) {
      try {
        await api.delete(`/notes/${id}`);
        setMyNotes((prev) => prev.filter((n) => n._id !== id));
      } catch (err) {
        alert('Failed to delete note');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          My Academic Profile & Contributed Materials
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Manage your personal details and academic materials you have shared with the campus community.
        </p>
      </div>

      {msg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '8px', marginBottom: '1.25rem' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Profile Card */}
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              className="user-avatar-circle"
              style={{
                width: '68px',
                height: '68px',
                fontSize: '1.75rem',
                margin: '0 auto 0.75rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${user?.role === 'teacher' ? 'badge-teacher' : user?.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Department:</span>{' '}
                <strong>{user?.department}</strong>
              </div>
              {user?.role === 'student' && (
                <div>
                  <span style={{ color: '#64748b' }}>Semester:</span>{' '}
                  <strong>{user?.semester}</strong>
                </div>
              )}
              <div>
                <span style={{ color: '#64748b' }}>Student / Employee ID:</span>{' '}
                <strong>{user?.rollOrEmployeeId || 'Not provided'}</strong>
              </div>
              {user?.bio && (
                <div style={{ marginTop: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>Bio:</span>
                  <p style={{ color: '#334155', fontSize: '0.85rem' }}>{user.bio}</p>
                </div>
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                <Edit size={14} /> Edit Profile Info
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics & Communication">Electronics & Comm.</option>
                  <option value="Mechanical Engineering">Mechanical Eng.</option>
                  <option value="Civil Engineering">Civil Eng.</option>
                </select>
              </div>

              {user?.role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-select"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`Semester ${s}`}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">ID / Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.rollOrEmployeeId}
                  onChange={(e) => setFormData({ ...formData, rollOrEmployeeId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Uploaded Notes List */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="#4f46e5" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Notes Uploaded by Me ({myNotes.length})
                </h3>
              </div>
              <Link to="/upload" className="btn btn-primary btn-sm">
                Upload New Note
              </Link>
            </div>

            {loadingNotes ? (
              <p style={{ color: '#64748b' }}>Loading your materials...</p>
            ) : myNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <p>You haven't uploaded any academic notes yet.</p>
                <Link to="/upload" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                  Upload Your First Note
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myNotes.map((note) => (
                  <div
                    key={note._id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>
                          {note.subject}
                        </span>
                        {note.isTeacherMaterial && (
                          <span className="badge badge-teacher" style={{ fontSize: '0.65rem' }}>
                            <Award size={11} /> Faculty Slide
                          </span>
                        )}
                      </div>
                      <Link to={`/notes/${note._id}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        {note.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                        Topic: {note.topic} • Class Date: {new Date(note.classDate).toLocaleDateString()} • {note.downloadCount} downloads • {note.averageRating > 0 ? `${note.averageRating} ★` : 'No ratings yet'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/notes/${note._id}`} className="btn btn-secondary btn-sm">
                        <Eye size={13} /> View
                      </Link>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
