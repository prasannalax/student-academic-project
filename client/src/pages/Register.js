import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, UserPlus, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { detectSection, validateStudentEmail } from '../utils/sectionHelper';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    semester: 'Semester 5',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const detectedSection = formData.role === 'student' ? detectSection(formData.rollNumber) : null;
  const emailStatus = formData.role === 'student' && formData.email
    ? validateStudentEmail(formData.email, formData.rollNumber)
    : null;
  const passwordsMatch = formData.password && formData.confirmPassword
    ? formData.password === formData.confirmPassword
    : null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.role === 'student') {
      if (!detectedSection) {
        setError(
          'Registration is restricted to CSE students with roll numbers between 324103210001 and 324103210250. Students from ECE, EEE, and other departments are not eligible.'
        );
        return;
      }

      const emailCheck = validateStudentEmail(formData.email, formData.rollNumber);
      if (!emailCheck.isValid) {
        setError(emailCheck.message);
        return;
      }
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        department: 'CSE',
        section: detectedSection,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.25rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            CSE Student Academic Companion
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Exclusive platform for Computer Science & Engineering students
          </p>
        </div>

        {/* Security Department Notice */}
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            fontSize: '0.825rem',
            color: '#1e40af',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <strong>Restricted Department Access:</strong> Only eligible CSE students (Rolls 324103210001 - 324103210250) and CSE faculty may register.
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">I am registering as:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${formData.role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData({ ...formData, role: 'student' })}
                style={{ padding: '0.5rem' }}
              >
                👨‍🎓 CSE Student
              </button>
              <button
                type="button"
                className={`btn ${formData.role === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormData({ ...formData, role: 'faculty' })}
                style={{ padding: '0.5rem' }}
              >
                👩‍🏫 CSE Faculty
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Alex Rivera or Prasanna"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Roll Number (for students) */}
          {formData.role === 'student' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>College Roll Number</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Range: 324103210001 - 324103210250</span>
              </label>
              <input
                type="text"
                name="rollNumber"
                className="form-input"
                placeholder="e.g. 324103210127 (CSE 3)"
                value={formData.rollNumber}
                onChange={handleChange}
                maxLength={12}
                required
              />

              {/* Live Section Detection Badge */}
              {formData.rollNumber.length >= 10 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  {detectedSection ? (
                    <div
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <CheckCircle size={15} color="#059669" />
                      <span>
                        Verified CSE Roll Number &rarr; <strong>Assigned Section: {detectedSection}</strong>
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#9f1239',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <AlertCircle size={15} color="#e11d48" />
                      <span>Not a valid CSE roll number. ECE/EEE and non-CSE students cannot register.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* College Email Address */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Official College Email</span>
              {formData.role === 'student' && (
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>rollnumber.name@gvpcew.ac.in</span>
              )}
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder={
                formData.role === 'student'
                  ? 'e.g. 324103210127.prasanna@gvpcew.ac.in'
                  : 'e.g. teacher@companion.edu or teacher@gvpcew.ac.in'
              }
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Email Validation Feedback for Student */}
            {formData.role === 'student' && formData.email && emailStatus && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>
                {emailStatus.isValid ? (
                  <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={14} /> Valid official college email format
                  </span>
                ) : (
                  <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={14} /> {emailStatus.message}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {formData.confirmPassword && (
            <div style={{ fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              {passwordsMatch ? (
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> Passwords match
                </span>
              ) : (
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={14} /> Passwords do not match
                </span>
              )}
            </div>
          )}

          {/* Auto Locked Department & Section Badges */}
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>Department: </span>
              <strong style={{ color: '#0f172a' }}>CSE (Computer Science)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Section: </span>
              <span
                style={{
                  backgroundColor: detectedSection ? '#4f46e5' : '#94a3b8',
                  color: 'white',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {formData.role === 'student'
                  ? detectedSection || 'Auto-Detected from Roll'
                  : 'All CSE Sections'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}
            disabled={loading}
          >
            <UserPlus size={18} /> {loading ? 'Registering...' : 'Register Secure Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Sign In with Roll Number
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
