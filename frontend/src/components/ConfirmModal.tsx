import type { } from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

export default function ConfirmModal({ message, onConfirm, onCancel, title = 'Xác nhận' }: ConfirmModalProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}
      onMouseDown={onCancel}
    >
      <div
        style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 20px', maxWidth: 420, width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</p>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
