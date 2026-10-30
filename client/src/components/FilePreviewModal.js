import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';
import api from '../services/api';

const FilePreviewModal = ({ note, onClose }) => {
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  if (!note) return null;

  const ext = (note.fileType || '').toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
  const isPdf = ext === 'pdf';
  const isText = ['txt', 'md', 'csv', 'json'].includes(ext);

  useEffect(() => {
    if (isText && note.fileUrl) {
      setLoadingText(true);
      fetch(note.fileUrl)
        .then((res) => res.text())
        .then((data) => {
          setTextContent(data);
          setLoadingText(false);
        })
        .catch(() => {
          setTextContent('Could not load text preview directly.');
          setLoadingText(false);
        });
    }
  }, [note.fileUrl, isText]);

  const handleDownload = () => {
    window.open(`/api/notes/${note._id}/download`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '850px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
                {note.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {note.originalFileName} • {note.fileType} • {(note.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleDownload}
              className="btn btn-primary btn-sm"
              title="Download File"
            >
              <Download size={15} /> Download
            </button>
            <button
              onClick={onClose}
              className="btn-icon btn-secondary btn-sm"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            minHeight: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {isImage ? (
            <img
              src={note.fileUrl}
              alt={note.title}
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
          ) : isPdf ? (
            <iframe
              src={note.fileUrl}
              title={note.title}
              style={{
                width: '100%',
                height: '500px',
                border: 'none',
                borderRadius: '6px',
              }}
            />
          ) : isText ? (
            loadingText ? (
              <p style={{ color: '#64748b' }}>Loading text preview...</p>
            ) : (
              <pre
                style={{
                  width: '100%',
                  height: '450px',
                  overflowY: 'auto',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {textContent}
              </pre>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <FileText size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                Preview Not Available for .{note.fileType}
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                This file format ({note.fileType}) can be downloaded and opened with your desktop application.
              </p>
              <button onClick={handleDownload} className="btn btn-primary">
                <Download size={16} /> Download File ({note.originalFileName})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
