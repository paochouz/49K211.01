import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Menu from './Menu';
import { penaltyStore } from '../mock/mockStore';

const PenaltyConfigPage = () => {
  const [config, setConfig] = useState(() => penaltyStore.get());
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = () => {
    if (config.tyLePhatQuaHan < 0 || config.tyLePhatQuaHan > 100) {
      setMessage({ text: 'Tỷ lệ phạt phải từ 0% đến 100%', type: 'error' });
      return;
    }
    penaltyStore.save(config);
    setMessage({ text: 'Lưu cấu hình thành công!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}>
        <Menu />
      </aside>

      <main style={{ marginLeft: '220px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Cấu hình phạt</h1>
        </div>

        <div style={{ }}>
          {/* Tỷ lệ phạt */}
          <div style={cardStyle}>
            <label style={labelStyle}>
              Tỷ lệ phạt quá hạn (%/ngày) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={config.tyLePhatQuaHan === 0 ? '' : config.tyLePhatQuaHan}
                onChange={(e) =>
                  setConfig({ ...config, tyLePhatQuaHan: e.target.value === '' ? 0 : Number(e.target.value) })
                }
                placeholder="0"
                style={inputStyle}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 14, fontWeight: 600 }}>%</span>
            </div>
          </div>

          {/* Mô tả */}
          <div style={cardStyle}>
            <label style={labelStyle}>Mô tả quy định</label>
            <textarea
              value={config.moTaQuyDinh}
              onChange={(e) => setConfig({ ...config, moTaQuyDinh: e.target.value })}
              placeholder="Ví dụ: Quý khách trả trễ sẽ bị tính phí 10%/ngày..."
              style={textareaStyle}
            />
          </div>

          {/* Toggle trạng thái */}
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: config.trangThaiApDung ? '#f0fdf4' : '#fff',
              borderColor: config.trangThaiApDung ? '#22c55e' : '#e2e8f0',
              cursor: 'pointer',
            }}
            onClick={() => setConfig({ ...config, trangThaiApDung: !config.trangThaiApDung })}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>Trạng thái áp dụng</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                {config.trangThaiApDung ? 'BẬT – Hệ thống tự động tính phạt' : 'TẮT – Phí trễ mặc định = 0'}
              </div>
            </div>
            <div style={{
              width: 44, height: 24, borderRadius: 12, padding: 3,
              backgroundColor: config.trangThaiApDung ? '#22c55e' : '#cbd5e1',
              transition: 'all 0.3s', position: 'relative', flexShrink: 0,
            }}>
              <div style={{
                width: 18, height: 18, backgroundColor: '#fff', borderRadius: '50%',
                transform: config.trangThaiApDung ? 'translateX(20px)' : 'translateX(0)',
                transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
              borderRadius: 10, marginBottom: 16,
              backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
              fontSize: 13,
            }}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span style={{ fontWeight: 600 }}>{message.text}</span>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            style={{
              width: '100%', height: 40, backgroundColor: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Save size={16} />
            Lưu cấu hình
          </button>
        </div>
      </main>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  marginBottom: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#334155',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 38,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  padding: '0 36px 0 12px',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1e293b',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 100,
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  padding: '10px 12px',
  fontSize: 14,
  resize: 'vertical',
  boxSizing: 'border-box',
  outline: 'none',
  color: '#1e293b',
  lineHeight: 1.5,
};

export default PenaltyConfigPage;
