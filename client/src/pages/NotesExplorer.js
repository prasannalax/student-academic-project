import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Award,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  GraduationCap,
  HelpCircle,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import RequestNotesModal from '../components/RequestNotesModal';
import { useAuth } from '../context/AuthContext';

const NotesExplorer = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const isFaculty = user?.role === 'teacher' || user?.role === 'faculty' || user?.role === 'admin';

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || 'All');
  const [section, setSection] = useState(searchParams.get('section') || 'All');
  const [semester, setSemester] = useState(searchParams.get('semester') || 'All');
  const [classDate, setClassDate] = useState(searchParams.get('classDate') || '');
  const [teacherOnly, setTeacherOnly] = useState(
    searchParams.get('isTeacherMaterial') === 'true'
  );
  const [sort, setSort] = useState('newest');

  // Fetch notes with applied filters
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append('search', search);
      if (subject && subject !== 'All') params.append('subject', subject);
      if (isFaculty && section && section !== 'All') params.append('section', section);
      if (semester && semester !== 'All') params.append('semester', semester);
      if (classDate) params.append('classDate', classDate);
      if (teacherOnly) params.append('isTeacherMaterial', 'true');
      if (sort) params.append('sort', sort);

      const res = await api.get(`/notes?${params.toString()}`);
      setNotes(res.data.data || []);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [subject, section, semester, classDate, teacherOnly, sort]);

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSubject('All');
    setSection('All');
    setSemester('All');
    setClassDate('');
    setTeacherOnly(false);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div>
      {/* Page Title & Notes Request CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Academic Notes Library
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Access verified lecture notes, chapter summaries, and faculty materials.
          </p>
        </div>

        {user?.role === 'student' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/notes-requests" className="btn btn-secondary btn-sm">
              <BookOpen size={15} /> Class Requests
            </Link>
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} /> Request Notes
            </button>
          </div>
        )}
      </div>

      {/* Section Isolation Status Banner */}
      <div
        style={{
          padding: '0.65rem 1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '10px',
          border: '1px solid #bfdbfe',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e40af' }}>
          <ShieldCheck size={18} color="#2563eb" />
          <span>
            {isFaculty ? (
              <strong>Faculty View: Displaying CSE department materials across all sections.</strong>
            ) : (
              <>
                Section Isolated: Showing notes for <strong>{user?.section || 'CSE 3'}</strong> and <strong>All CSE Sections</strong>. Notes from other sections are protected.
              </>
            )}
          </span>
        </div>

        {user?.role === 'student' && user?.section && (
          <span
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            My Section: {user.section}
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, subject, topic, or uploader..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Section Filter (For Faculty/Admin) */}
        {isFaculty && (
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="All">All Sections</option>
              <option value="CSE 1">CSE 1</option>
              <option value="CSE 2">CSE 2</option>
              <option value="CSE 3">CSE 3</option>
              <option value="CSE 4">CSE 4</option>
            </select>
          </div>
        )}

        {/* Semester Filter */}
        <div style={{ minWidth: '130px' }}>
          <select
            className="form-select"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="All">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={`Semester ${s}`}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Class Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <input
            type="date"
            className="form-input"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            title="Filter by Lecture Date"
            style={{ width: '150px' }}
          />
        </div>

        {/* Sort selector */}
        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="class_date_desc">Class Date (Recent)</option>
            <option value="highest_rated">Highest Rated ⭐</option>
            <option value="downloads">Most Downloaded</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
        </div>

        {/* Official Faculty Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: teacherOnly ? '#b45309' : '#475569',
            backgroundColor: teacherOnly ? '#fef3c7' : '#f8fafc',
            border: teacherOnly ? '1px solid #fde68a' : '1px solid #e2e8f0',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={teacherOnly}
            onChange={(e) => setTeacherOnly(e.target.checked)}
            style={{ accentColor: '#d97706' }}
          />
          <Award size={15} /> Faculty Only
        </label>

        {/* Reset button */}
        {(search || subject !== 'All' || section !== 'All' || semester !== 'All' || classDate || teacherOnly) && (
          <button
            onClick={handleResetFilters}
            className="btn btn-secondary btn-sm"
            title="Reset All Filters"
          >
            <RotateCcw size={14} /> Clear
          </button>
        )}
      </div>

      {/* Results Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Found <strong>{totalCount}</strong> academic resources
          {classDate && ` for lecture date ${classDate}`}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div style={{ fontSize: '1rem', color: '#4f46e5', fontWeight: 600 }}>
            Loading notes...
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BookOpen size={30} />
          </div>
          <h3 className="empty-state-title">No notes found matching your criteria</h3>
          <p className="empty-state-text">
            Try adjusting your search keywords or clearing date filters.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} onNoteUpdated={fetchNotes} />
          ))}
        </div>
      )}

      {showRequestModal && (
        <RequestNotesModal
          onClose={() => setShowRequestModal(false)}
          onRequestCreated={() => {
            alert('Your notes request has been submitted and sent to your classmates!');
          }}
        />
      )}
    </div>
  );
};

export default NotesExplorer;
