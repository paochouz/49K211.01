export interface AuthUser {
  taiKhoan: string;
  vaiTro: string;
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// Normalize để match mọi dạng DB có thể lưu
export function isOwner(): boolean {
  const v = (getUser()?.vaiTro ?? '').toLowerCase().replace(/\s/g, '');
  return v === 'chucuahang' || v === 'chủcửahàng' || v === 'owner' || v === 'admin';
}
export function isLoggedIn(): boolean {
  return getUser() !== null;
}
