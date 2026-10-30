import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Search,
  Award,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header Bar */}
      <header
        style={{
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1300px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="navbar-brand-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', lineHeight: 1.1 }}>
              Student Academic Companion
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
              CENTRALIZED ACADEMIC RESOURCE PLATFORM
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '4.5rem 1.5rem 3rem',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            borderRadius: '9999px',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={14} /> Solves Fragmented Notes & Missed College Lectures
        </div>

        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}
        >
          Never fall behind in college classes again.
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: '750px',
            margin: '0 auto 2rem',
          }}
        >
          Missed lectures because of <strong>illness, internships, project work, placements, or workshops</strong>?
          Stop relying on scattered WhatsApp messages. Access organized, dated lecture notes, official faculty slides, and active assignments in one centralized platform.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to={user ? '/dashboard' : '/login'}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
          >
            {user ? 'Enter Campus Portal' : 'Access Notes & Materials'} <ArrowRight size={17} />
          </Link>
          <Link
            to="/notes"
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
          >
            <Search size={17} /> Browse Notes Catalog
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '2rem auto 4rem',
          padding: '0 1.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon primary" style={{ marginBottom: '1rem' }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Chronological & Dated Notes
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Filter lectures by exact class date and subject (e.g. Computer Networks - Sep 20), matching exactly what was covered while you were absent.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon accent" style={{ marginBottom: '1rem' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Official Faculty Materials
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Teachers upload verified lecture slides, syllabus sheets, and exam reference guides distinguished by a golden "Official Teacher Material" badge.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon secondary" style={{ marginBottom: '1rem' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Assignments & Due Dates
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Check daily homework, record submissions, download assignment handouts, and maintain your personal task completion checklists.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div className="stat-icon success" style={{ marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Peer Reviews & Moderation
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Rate notes 1-5 stars, write helpful reviews, and report incorrect or duplicate content to administrators for clean and reliable study material.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.85rem',
          backgroundColor: '#f8fafc',
        }}
      >
        <p>Student Academic Companion • Built with MERN Stack • Full-Stack Educational Platform</p>
      </footer>
    </div>
  );
};

export default Home;
