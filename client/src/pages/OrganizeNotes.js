import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Calendar,
  Award,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import api from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';

const OrganizeNotes = () => {
  const [hierarchy, setHierarchy] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [previewNote, setPreviewNote] = useState(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const res = await api.get('/notes/categories/hierarchy');
        const data = res.data.data || {};
        setHierarchy(data);

        // Default selection to first department and first subject
        const depts = Object.keys(data);
        if (depts.length > 0) {
          setSelectedDept(depts[0]);
          const subjects = Object.keys(data[depts[0]]);
          if (subjects.length > 0) {
            setSelectedSubject(subjects[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching categories hierarchy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, []);

  const activeNotes =
    selectedDept && selectedSubject && hierarchy[selectedDept]?.[selectedSubject]
      ? hierarchy[selectedDept][selectedSubject]
      : [];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Organized Academic Hierarchy
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
          Explore course materials structured systematically by Department, Subject, and Class Lecture Dates.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <div style={{ color: '#4f46e5', fontWeight: 600 }}>Building curriculum hierarchy tree...</div>
        </div>
      ) : Object.keys(hierarchy).length === 0 ? (
        <div className="empty-state">
          <FolderTree size={40} color="#94a3b8" />
          <h3 className="empty-state-title">No categories available yet</h3>
          <p className="empty-state-text">Upload notes to automatically build the subject hierarchy.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left: Department & Subject Folder Tree Navigation */}
          <div className="card" style={{ padding: '1rem', maxHeight: '78vh', overflowY: 'auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#475569',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '0.75rem',
              }}
            >
              <FolderTree size={17} color="#4f46e5" />
              <span>Academic Directory</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.keys(hierarchy).map((dept) => {
                const isDeptSelected = selectedDept === dept;
                const subjects = Object.keys(hierarchy[dept]);

                return (
                  <div key={dept} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                    <div
                      onClick={() => {
                        setSelectedDept(dept);
                        if (subjects.length > 0) setSelectedSubject(subjects[0]);
                      }}
                      style={{
                        padding: '0.6rem 0.75rem',
                        backgroundColor: isDeptSelected ? '#eef2ff' : '#f8fafc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: isDeptSelected ? 700 : 600,
                        color: isDeptSelected ? '#4f46e5' : '#1e293b',
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isDeptSelected ? (
                          <FolderOpen size={18} color="#4f46e5" />
                        ) : (
                          <Folder size={18} color="#64748b" />
                        )}
                        <span>{dept}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: isDeptSelected ? '#c7d2fe' : '#e2e8f0',
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {subjects.length} subjects
                      </span>
                    </div>

                    {/* Sub-tree of Subjects */}
                    {isDeptSelected && (
                      <div
                        style={{
                          paddingLeft: '1.5rem',
                          marginTop: '0.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        {subjects.map((subj) => {
                          const isSubjSelected = selectedSubject === subj;
                          const noteCount = hierarchy[dept][subj].length;

                          return (
                            <div
                              key={subj}
                              onClick={() => setSelectedSubject(subj)}
                              style={{
                                padding: '0.45rem 0.65rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: isSubjSelected ? '#4f46e5' : 'transparent',
                                color: isSubjSelected ? '#ffffff' : '#475569',
                                fontWeight: isSubjSelected ? 600 : 500,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <BookOpen size={14} color={isSubjSelected ? '#ffffff' : '#64748b'} />
                                <span>{subj}</span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  opacity: 0.8,
                                }}
                              >
                                {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Chronological Lecture Timeline & Notes list */}
          <div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase' }}>
                    {selectedDept}
                  </span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedSubject || 'Select a subject'}
                  </h2>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {activeNotes.length} chronological lectures
                </div>
              </div>

              {activeNotes.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                  No lecture notes currently uploaded for this subject.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeNotes.map((note, index) => {
                    const classDateStr = new Date(note.classDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={note._id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          padding: '1.25rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            padding: '0.6rem 0.8rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            textAlign: 'center',
                            minWidth: '85px',
                          }}
                        >
                          <Calendar size={15} color="#4f46e5" style={{ margin: '0 auto 2px' }} />
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                            {new Date(note.classDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {new Date(note.classDate).getFullYear()}
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                              {note.title}
                            </h3>
                            {note.isTeacherMaterial && (
                              <span className="badge badge-teacher" style={{ fontSize: '0.68rem' }}>
                                <Award size={12} /> Official Faculty
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, marginBottom: '0.35rem' }}>
                            Topic: {note.topic}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Semester: {note.semester} • File: {note.originalFileName} • Rating: {note.averageRating > 0 ? `${note.averageRating.toFixed(1)} ★` : 'New'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setPreviewNote(note)}
                            className="btn btn-secondary btn-sm"
                            title="Preview Note"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <a
                            href={`/api/notes/${note._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                            title="Download Note"
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewNote && (
        <FilePreviewModal note={previewNote} onClose={() => setPreviewNote(null)} />
      )}
    </div>
  );
};

export default OrganizeNotes;
