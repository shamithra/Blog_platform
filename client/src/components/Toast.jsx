import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#6366f1" />
  };

  const bgStyles = {
    success: 'rgba(16, 185, 129, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
    info: 'rgba(99, 102, 241, 0.15)'
  };

  const borderStyles = {
    success: 'rgba(16, 185, 129, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    info: 'rgba(99, 102, 241, 0.3)'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 1.25rem',
      borderRadius: '12px',
      background: bgStyles[type],
      border: `1px solid ${borderStyles[type]}`,
      backdropFilter: 'blur(16px)',
      color: 'var(--text-primary)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.3s ease'
    }}>
      {icons[type]}
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ marginLeft: '0.5rem', opacity: 0.7, color: 'var(--text-primary)' }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};
