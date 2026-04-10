import React from 'react';

interface AlertModalProps {
  message: string;
  onClose: () => void;
  title?: string;
}

export default function AlertModal({ message, onClose, title = 'Thông báo' }: AlertModalProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}
      onMouseDown={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 20px', maxWidth: 420, width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</p>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
