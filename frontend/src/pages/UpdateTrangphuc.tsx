import React, { useRef, useState, useEffect } from 'react';
import { Upload, ChevronDown, Trash2 } from 'lucide-react';
import { costumeStore, orderStore } from '../services/supabaseStore';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

interface Props {
  maTP: string;
  onClose: () => void;
  onSuccess: () => void;
}

function normalizePrice(value: any): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    return value.replace(/[^0-9]/g, '');
  }
  return String(value);
}

const UpdateTrangphuc: React.FC<Props> = ({ maTP, onClose, onSuccess }) => {
  const [_costume, setCostume] = useState<any>(null);
  const [canDelete, setCanDelete] = useState(true);
  const [isRented, setIsRented] = useState(false);

  useEffect(() => {
    costumeStore.list().then(list => {
      const c = list.find(x => x.maTP === maTP);
      setCostume(c);
      if (c) {
        setFormData({
          ma: c.maTP,
          ten: c.tenTP,
          loaiTP: c.loaiTP || '',
          size: c.size || '',
          giaThue: normalizePrice(c.giaThue),
          moTa: c.moTa || '',
          trangThai: c.trangThai || 'Sẵn sàng',
        });
        setPreviewImage(c.hinhAnh || '');
        setIsRented(c.trangThai === 'Đang thuê' || c.trangThai === 'Hư hỏng');
      }
    });
    orderStore.list().then(orders => {
      costumeStore.list().then(list => {
        const c = list.find(x => x.maTP === maTP);
        if (!c) return;
        const inActive = orders.some(o =>
          (o.status === 'Đang thuê' || o.status === 'Trễ hạn') &&
          o.item.split(', ').map((s: string) => s.trim()).includes(c.tenTP)
        );
        setCanDelete(!inActive);
      });
    });
  }, [maTP]);

  const [formData, setFormData] = useState({
    ma: '', ten: '', loaiTP: '', size: '', giaThue: '', moTa: '', trangThai: 'Sẵn sàng',
  });

  const [errors, setErrors] = useState<{ ten?: string; giaThue?: string }>({});
  const [previewImage, setPreviewImage] = useState<string>('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertIsSuccess, setAlertIsSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.ten.trim()) { setAlertMsg('L\u01B0u kh\u00F4ng th\u00E0nh c\u00F4ng: T\u00EAn kh\u00F4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng'); return; }
    if (!formData.giaThue.trim() || Number(formData.giaThue) <= 0) { setAlertMsg('L\u01B0u kh\u00F4ng th\u00E0nh c\u00F4ng: Gi\u00E1 thu\u00EA ph\u1EA3i l\u1EDBn h\u01A1n 0'); return; }

    await costumeStore.update(maTP, {
      tenTP: formData.ten, loaiTP: formData.loaiTP, size: formData.size,
      giaThue: Number(formData.giaThue), moTa: formData.moTa,
      trangThai: formData.trangThai, hinhAnh: previewImage,
    });
    setAlertMsg('L\u01B0u thay \u0111\u1ED5i th\u00E0nh c\u00F4ng!');
    setAlertIsSuccess(true);
  };

  const handleDelete = async () => {
    await costumeStore.delete(maTP);
    onSuccess();
    onClose();
  };

  return (
    <div style={s.overlay} onMouseDown={onClose}>
      <div style={s.modal} onMouseDown={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 24px', color: '#0F172A' }}>
          Ch&#7881;nh s&#7917;a trang ph&#7909;c
        </h2>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Ảnh */}
          <div style={{ width: '260px', flexShrink: 0 }}>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', border: '1px solid #E5E7EB', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}>
              {previewImage
                ? <img src={previewImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', backgroundColor: '#F8FAFC' }}>
                    Ch&#432;a c&#243; &#7843;nh
                  </div>
              }
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Upload size={24} color="white" />
                <span style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>Thay &#7843;nh</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
          </div>

          {/* Form */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={s.label}>M&#227; trang ph&#7909;c</label>
              <input value={formData.ma} disabled style={{ ...s.input, backgroundColor: '#F8FAFC', color: '#64748B' }} />
            </div>

            <div>
              <label style={s.label}>T&#234;n trang ph&#7909;c *</label>
              <input value={formData.ten} style={{ ...s.input, ...(errors.ten ? { border: '1px solid #EF4444' } : {}) }}
                onChange={e => { setFormData({ ...formData, ten: e.target.value }); setErrors({ ...errors, ten: undefined }); }} />
              {errors.ten && <span style={s.err}>{errors.ten}</span>}
            </div>

            <div>
              <label style={s.label}>Lo&#7841;i trang ph&#7909;c</label>
              <div style={{ position: 'relative' }}>
                <select value={formData.loaiTP} style={{ ...s.input, appearance: 'none' as any }}
                  onChange={e => setFormData({ ...formData, loaiTP: e.target.value })}>
                  <option value="V&#225;y d&#7841; h&#7897;i">V&#225;y d&#7841; h&#7897;i</option>
                  <option value="Vest">Vest</option>
                  <option value="&#193;o d&#224;i">&#193;o d&#224;i</option>
                  <option value="Cosplay">Cosplay</option>
                </select>
                <ChevronDown style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} size={18} color="#64748B" />
              </div>
            </div>

            <div>
              <label style={s.label}>Size</label>
              <input value={formData.size} style={s.input}
                onChange={e => setFormData({ ...formData, size: e.target.value })} />
            </div>

            <div>
              <label style={s.label}>Gi&#225; thu&#234; *</label>
              <div style={{ position: 'relative' }}>
                <input value={formData.giaThue} style={{ ...s.input, paddingRight: '50px', ...(errors.giaThue ? { border: '1px solid #EF4444' } : {}) }}
                  onChange={e => { setFormData({ ...formData, giaThue: e.target.value.replace(/[^0-9]/g, '') }); setErrors({ ...errors, giaThue: undefined }); }} />
                <span style={{ position: 'absolute', right: '12px', top: '11px', fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>VN&#272;</span>
              </div>
              {errors.giaThue && <span style={s.err}>{errors.giaThue}</span>}
            </div>

            <div>
              <label style={s.label}>M&#244; t&#7843;</label>
              <textarea value={formData.moTa} style={s.textarea}
                onChange={e => setFormData({ ...formData, moTa: e.target.value })} />
            </div>

            <div>
              <label style={s.label}>Tr&#7841;ng th&#225;i</label>
              <div style={{ position: 'relative' }}>
                <select value={formData.trangThai} style={{ ...s.input, appearance: 'none' as any }}
                  onChange={e => setFormData({ ...formData, trangThai: e.target.value })}>
                  <option value="S&#7861;n s&#224;ng">S&#7861;n s&#224;ng</option>
                  <option value="H&#432; h&#7887;ng">H&#432; h&#7887;ng</option>
                </select>
                <ChevronDown style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} size={18} color="#64748B" />
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Tr&#7841;ng th&#225;i &#8220;&#272;ang thu&#234;&#8221; do h&#7879; th&#7889;ng t&#7921; &#273;&#7897;ng c&#7853;p nh&#7853;t
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '28px', borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            style={{ ...s.deleteBtn, ...(canDelete ? {} : { opacity: 0.4, cursor: 'not-allowed' }) }}
            disabled={!canDelete}
            onClick={() => canDelete && setConfirmDelete(true)}
          >
            <Trash2 size={16} />
            <span>X&#243;a</span>
          </button>
          {isRented && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fcd34d', fontSize: 13, color: '#92400e' }}>
              Trang ph&#7909;c &#273;ang &#273;&#432;&#7907;c thu&#234; &#8212; kh&#244;ng th&#7875; ch&#7881;nh s&#7917;a.
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={s.cancelBtn} onClick={onClose}>H&#7911;y</button>
            <button
              style={{ ...s.saveBtn, ...(isRented ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}
              disabled={isRented}
              onClick={handleSave}
            >
              L&#432;u thay &#273;&#7893;i
            </button>
          </div>
        </div>
      </div>

      {alertMsg && <AlertModal message={alertMsg} onClose={() => { if (alertIsSuccess) { onSuccess(); onClose(); } setAlertMsg(''); setAlertIsSuccess(false); }} />}
      {confirmDelete && <ConfirmModal message="X&#225;c nh&#7853;n x&#243;a trang ph&#7909;c n&#224;y?" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />}
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '16px', width: '820px', maxWidth: '95vw', padding: '32px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' },
  label: { fontWeight: 600, fontSize: '13px', color: '#0F172A', marginBottom: '6px', display: 'block' },
  input: { width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', color: '#0F172A', boxSizing: 'border-box' },
  textarea: { width: '100%', height: '80px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', color: '#0F172A', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  err: { color: '#EF4444', fontSize: '12px', marginTop: '4px' },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '8px', color: 'white', backgroundColor: '#EF4444', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' },
  cancelBtn: { padding: '10px 24px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F1F5F9', fontWeight: 500, color: '#0F172A', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { padding: '10px 32px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: '14px' },
};

export default UpdateTrangphuc;
