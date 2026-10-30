import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, Sparkles, User, Shield, BookOpen, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid roll number / email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoId) => {
    setIdentifier(demoId);
    setPassword('Password123!');
    setError('');
    setLoading(true);

    try {
      await login(demoId, 'Password123!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed');
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
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.25rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
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
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)',
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Academic Companion
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Sign in with your Roll Number or College Email
          </p>
        </div>

        {/* Restricted CSE Badge */}
        <div
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#1e40af',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldAlert size={16} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>CSE Department Portal &bull; Sections CSE 1 &ndash; CSE 4</span>
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
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Roll Number or College Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 324103210127 or 324103210127.alex@gvpcew.ac.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6366f1',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} /> Quick Demo One-Click Sign In:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('324103210127')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', flexDirection: 'column', padding: '0.5rem 0.2rem', gap: '3px' }}
              disabled={loading}
              title="Alex Rivera (CSE 3)"
            >
              <User size={14} color="#4f46e5" />
              <span>CSE 3</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('324103210001')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', flexDirection: 'column', padding: '0.5rem 0.2rem', gap: '3px' }}
              disabled={loading}
              title="David Kumar (CSE 1)"
            >
              <User size={14} color="#059669" />
              <span>CSE 1</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('teacher@companion.edu')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', flexDirection: 'column', padding: '0.5rem 0.2rem', gap: '3px' }}
              disabled={loading}
              title="Prof. Sarah Jenkins (Faculty)"
            >
              <BookOpen size={14} color="#b45309" />
              <span>Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@companion.edu')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', flexDirection: 'column', padding: '0.5rem 0.2rem', gap: '3px' }}
              disabled={loading}
              title="Dr. Arthur Pendelton (Admin)"
            >
              <Shield size={14} color="#7c3aed" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
