import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  Trash2,
  X,
  Filter,
  ShieldCheck,
  ListTodo,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Assignments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'tasks'
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const isTeacherOrAdmin =
    user?.role === 'teacher' || user?.role === 'faculty' || user?.role === 'admin';

  // New assignment form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    targetSection: 'All CSE Sections',
    semester: user?.semester || 'Semester 5',
    deadline: '',
  });

  // New task form state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    subject: '',
    targetSection: isTeacherOrAdmin ? 'All CSE Sections' : (user?.section || 'CSE 3'),
    deadline: '',
  });

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (subjectFilter !== 'All') params.append('subject', subjectFilter);

      const res = await api.get(`/assignments?${params.toString()}`);
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    } else {
      fetchTasks();
    }
  }, [activeTab, subjectFilter]);

  const handleToggleComplete = async (id) => {
    try {
      await api.put(`/assignments/${id}/toggle-complete`);
      setAssignments((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, isCompletedByMe: !a.isCompletedByMe } : a
        )
      );
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleToggleTaskComplete = async (id) => {
    try {
      await api.put(`/tasks/${id}/toggle-complete`);
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, isCompletedByMe: !t.isCompletedByMe } : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Delete this assignment?')) {
      try {
        await api.delete(`/assignments/${id}`);
        setAssignments((prev) => prev.filter((a) => a._id !== id));
      } catch (err) {
        alert('Failed to delete assignment');
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        alert('Failed to delete task');
      }
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('department', 'CSE');
      data.append('targetSection', formData.targetSection);
      data.append('semester', formData.semester);
      data.append('deadline', formData.deadline);
      if (file) data.append('file', file);

      await api.post('/assignments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        subject: '',
        targetSection: 'All CSE Sections',
        semester: user?.semester || 'Semester 5',
        deadline: '',
      });
      setFile(null);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskData.title) {
      setError('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const data = new FormData();
      data.append('title', taskData.title);
      data.append('description', taskData.description);
      data.append('subject', taskData.subject);
      data.append('department', 'CSE');
      data.append('targetSection', taskData.targetSection);
      if (taskData.deadline) data.append('deadline', taskData.deadline);
      if (file) data.append('file', file);

      await api.post('/tasks', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowTaskModal(false);
      setTaskData({
        title: '',
        description: '',
        subject: '',
        targetSection: isTeacherOrAdmin ? 'All CSE Sections' : (user?.section || 'CSE 3'),
        deadline: '',
      });
      setFile(null);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            CSE Assignments & Section Tasks
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
            Keep track of course assignments, lab work, and section task deadlines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {activeTab === 'assignments' && isTeacherOrAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Post Assignment
            </button>
          )}

          {activeTab === 'tasks' && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Add Section Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('assignments')}
        >
          <CheckSquare size={16} /> Course Assignments
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ListTodo size={16} /> Section Tasks ({user?.section || 'CSE'})
        </button>
      </div>

      {/* Section Isolation Notice */}
      <div
        style={{
          padding: '0.65rem 1rem',
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
        <ShieldCheck size={18} color="#2563eb" />
        <span>
          {isTeacherOrAdmin
            ? 'Faculty mode: You can target assignments and tasks to specific CSE sections (CSE 1, 2, 3, 4) or All CSE Sections.'
            : `Showing items targeted to ${user?.section || 'your section'} and All CSE Sections.`}
        </span>
      </div>

      {activeTab === 'assignments' ? (
        <>
          {/* Filter Bar */}
          <div className="filter-bar" style={{ padding: '0.875rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="#64748b" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter by Subject:</span>
            </div>
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="All">All Subjects</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Data Mining">Data Mining</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Python Programming">Python Programming</option>
            </select>
          </div>

          {/* Assignments List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#4f46e5' }}>
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={36} color="#94a3b8" />
              <h3 className="empty-state-title">No assignments found</h3>
              <p className="empty-state-text">All tasks and submissions are completed or none have been assigned yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignments.map((item) => {
                const dueDate = new Date(item.deadline);
                const now = new Date();
                const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;

                const canManage =
                  user && (user.id === item.createdBy?._id || user.id === item.createdBy || user.role === 'admin');

                return (
                  <div
                    key={item._id}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                      borderLeft: item.isCompletedByMe
                        ? '4px solid #10b981'
                        : isOverdue
                        ? '4px solid #ef4444'
                        : '4px solid #4f46e5',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#0ea5e9',
                            backgroundColor: '#e0f2fe',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {item.subject}
                        </span>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#4338ca',
                            backgroundColor: '#e0e7ff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          Section: {item.targetSection || 'All CSE'}
                        </span>

                        <span
                          className={`badge ${
                            item.isCompletedByMe
                              ? 'badge-success'
                              : isOverdue
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          <Clock size={11} />{' '}
                          {item.isCompletedByMe
                            ? 'Completed'
                            : isOverdue
                            ? 'Overdue'
                            : `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: '0.5rem',
                          textDecoration: item.isCompletedByMe ? 'line-through' : 'none',
                        }}
                      >
                        {item.title}
                      </h3>

                      <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                        {item.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                        <div>
                          Deadline: <strong>{dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </div>
                        <div>
                          Assigned by: <strong>{item.creatorName}</strong>
                        </div>
                        {item.attachmentUrl && (
                          <a
                            href={item.attachmentUrl}
                            download
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#4f46e5',
                              fontWeight: 600,
                            }}
                          >
                            <Download size={13} /> Attached Handout ({item.originalFileName})
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleComplete(item._id)}
                        className={`btn btn-sm ${item.isCompletedByMe ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ minWidth: '150px' }}
                      >
                        <CheckCircle size={15} />
                        {item.isCompletedByMe ? 'Mark Pending' : 'Mark as Done'}
                      </button>

                      {canManage && (
                        <button
                          onClick={() => handleDeleteAssignment(item._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete assignment"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Section Tasks View */
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#4f46e5' }}>
              Loading section tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <ListTodo size={36} color="#94a3b8" />
              <h3 className="empty-state-title">No section tasks found</h3>
              <p className="empty-state-text">Your section has no active pending academic tasks.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderLeft: task.isCompletedByMe ? '4px solid #10b981' : '4px solid #6366f1',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: '#e0e7ff',
                          color: '#4338ca',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {task.targetSection}
                      </span>
                      {task.subject && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          {task.subject}
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '0.25rem',
                        textDecoration: task.isCompletedByMe ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.35rem' }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Posted by: <strong>{task.creatorName}</strong> ({task.creatorRole})
                      {task.deadline && (
                        <span> &bull; Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleToggleTaskComplete(task._id)}
                      className={`btn btn-sm ${task.isCompletedByMe ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      <CheckCircle size={14} />
                      {task.isCompletedByMe ? 'Done' : 'Mark Done'}
                    </button>

                    {(user?.id === task.createdBy?._id || user?.id === task.createdBy || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Post New Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lab 4: Wireshark Packet Analysis"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Networks"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Section *</label>
                  <select
                    className="form-select"
                    value={formData.targetSection}
                    onChange={(e) => setFormData({ ...formData, targetSection: e.target.value })}
                    required
                  >
                    <option value="All CSE Sections">All CSE Sections</option>
                    <option value="CSE 1">CSE 1</option>
                    <option value="CSE 2">CSE 2</option>
                    <option value="CSE 3">CSE 3</option>
                    <option value="CSE 4">CSE 4</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Submission Deadline *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instructions & Guidelines *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detail the questions, submission format, or rubric..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attachment Handout / PDF (Optional)</label>
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Section Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Section Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="btn-icon btn-secondary btn-sm">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Solve Unit 2 Tutorial Problems 1-5"
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Networks"
                    value={taskData.subject}
                    onChange={(e) => setTaskData({ ...taskData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Section</label>
                  {isTeacherOrAdmin ? (
                    <select
                      className="form-select"
                      value={taskData.targetSection}
                      onChange={(e) => setTaskData({ ...taskData, targetSection: e.target.value })}
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
                      style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600 }}
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={taskData.deadline}
                  onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Task Details (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Briefly describe what needs to be prepared or submitted..."
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
