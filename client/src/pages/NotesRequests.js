import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Trash2,
  Filter,
  User,
  ArrowRight,
  BookOpen,
  MessageSquare,
  FileCheck,
  UploadCloud,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RequestNotesModal from '../components/RequestNotesModal';
import FulfillRequestModal from '../components/FulfillRequestModal';
import FilePreviewModal from '../components/FilePreviewModal';

const NotesRequests = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all' (Classmates) or 'my' (My Requests)
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [fulfillingRequest, setFulfillingRequest] = useState(null);
  const [previewNote, setPreviewNote] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (subjectFilter !== 'All') params.append('subject', subjectFilter);
      if (activeTab === 'my') params.append('myRequests', 'true');

      const res = await api.get(`/note-requests?${params.toString()}`);
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notes requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, statusFilter, subjectFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/note-requests/${id}/status`, { status: newStatus });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Delete this notes request?')) {
      try {
        await api.delete(`/note-requests/${id}`);
        setRequests((prev) => prev.filter((r) => r._id !== id));
      } catch (err) {
        alert('Failed to delete request');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Fulfilled':
        return (
          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
            <CheckCircle size={12} /> Fulfilled
          </span>
        );
      case 'Closed':
        return (
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            <XCircle size={12} /> Closed
          </span>
        );
      default:
        return (
          <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
            <Clock size={12} /> Pending Response
          </span>
        );
    }
  };

  // Distinct list of subjects from requests for filter dropdown
  const uniqueSubjects = Array.from(
    new Set(requests.map((r) => r.subject).filter(Boolean))
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Student Notes Requests
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Request notes for lectures you missed from your section ({user?.section || 'CSE 3'}) classmates.
          </p>
        </div>

        {user?.role === 'student' && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Request Notes from Classmates
          </button>
        )}
      </div>

      {/* Primary Tabs: Classmate Requests vs My Requests */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'all' ? '#4f46e5' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BookOpen size={18} />
          <span>Classmate Requests</span>
        </button>

        <button
          onClick={() => setActiveTab('my')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'my' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'my' ? '#4f46e5' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <User size={18} />
          <span>My Requests</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Status:</span>
          {['All', 'Pending', 'Fulfilled', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {st}
            </button>
          ))}
        </div>

        {uniqueSubjects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Subject:</span>
            <select
              className="form-select"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{ width: '180px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
            >
              <option value="All">All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#4f46e5' }}>
          Loading notes requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <HelpCircle size={40} color="#94a3b8" />
          <h3 className="empty-state-title">
            {activeTab === 'my'
              ? 'You have not submitted any notes requests'
              : 'No pending requests from classmates'}
          </h3>
          <p className="empty-state-text">
            {activeTab === 'my'
              ? 'Missed a lecture? Request notes from your classmates anytime.'
              : 'All classmate notes requests have been answered or closed.'}
          </p>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} /> Request Notes Now
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {requests.map((reqItem) => {
            const isRequester =
              user &&
              (user.id === reqItem.requester?._id ||
                user.id === reqItem.requester ||
                user._id === reqItem.requester?._id ||
                user._id === reqItem.requester);

            const classDateStr = new Date(reqItem.classDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={reqItem._id}
                className="card"
                style={{
                  borderLeft:
                    reqItem.status === 'Fulfilled'
                      ? '4px solid #10b981'
                      : reqItem.status === 'Closed'
                      ? '4px solid #94a3b8'
                      : '4px solid #f59e0b',
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#4f46e5',
                        backgroundColor: '#eef2ff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {reqItem.subject}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {reqItem.section || user?.section || 'CSE 3'}
                    </span>
                    {getStatusBadge(reqItem.status)}
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {reqItem.department} • {reqItem.semester}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Requested on {new Date(reqItem.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Topic & Description */}
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '0.35rem',
                  }}
                >
                  Topic: {reqItem.topic}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#475569',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Calendar size={14} color="#6366f1" />
                  <span>
                    Lecture Date: <strong>{classDateStr}</strong>
                  </span>
                  <span>•</span>
                  <User size={14} color="#64748b" />
                  <span>
                    Requested by <strong>{reqItem.requesterName}</strong>
                    {isRequester && ' (You)'}
                  </span>
                </div>

                {reqItem.description && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#334155',
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      lineHeight: 1.5,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    "{reqItem.description}"
                  </p>
                )}

                {/* Fulfilled Note Box if available */}
                {reqItem.fulfilledNote && (
                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '10px',
                      padding: '0.875rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#065f46',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginBottom: '2px',
                        }}
                      >
                        <FileCheck size={14} /> Shared Note by {reqItem.fulfilledBy?.name || 'Classmate'}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#064e3b' }}>
                        {reqItem.fulfilledNote.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                        {reqItem.fulfilledNote.originalFileName} • {reqItem.fulfilledNote.fileType}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setPreviewNote(reqItem.fulfilledNote)}
                        className="btn btn-secondary btn-sm"
                        style={{ backgroundColor: 'white' }}
                      >
                        <Eye size={14} /> Preview Notes
                      </button>
                      <a
                        href={`/api/notes/${reqItem.fulfilledNote._id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        <Download size={14} /> Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Actions Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* If request is pending and current user is NOT requester, classmate can respond */}
                    {reqItem.status === 'Pending' && !isRequester && user?.role === 'student' && (
                      <button
                        onClick={() => setFulfillingRequest(reqItem)}
                        className="btn btn-primary btn-sm"
                      >
                        <UploadCloud size={14} /> Respond & Share Notes
                      </button>
                    )}

                    {/* Requester actions */}
                    {isRequester && reqItem.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(reqItem._id, 'Fulfilled')}
                        className="btn btn-secondary btn-sm"
                        title="Mark as fulfilled if received offline"
                      >
                        <CheckCircle size={14} color="#10b981" /> Mark Fulfilled
                      </button>
                    )}

                    {isRequester && reqItem.status !== 'Closed' && (
                      <button
                        onClick={() => handleStatusChange(reqItem._id, 'Closed')}
                        className="btn btn-secondary btn-sm"
                        title="Close request if no longer needed"
                      >
                        <XCircle size={14} color="#64748b" /> Close Request
                      </button>
                    )}
                  </div>

                  {(isRequester || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteRequest(reqItem._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      title="Delete request"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showRequestModal && (
        <RequestNotesModal
          onClose={() => setShowRequestModal(false)}
          onRequestCreated={() => {
            fetchRequests();
          }}
        />
      )}

      {fulfillingRequest && (
        <FulfillRequestModal
          request={fulfillingRequest}
          onClose={() => setFulfillingRequest(null)}
          onFulfilled={() => {
            fetchRequests();
          }}
        />
      )}

      {previewNote && (
        <FilePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
        />
      )}
    </div>
  );
};

export default NotesRequests;
