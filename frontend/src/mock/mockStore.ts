// ============================================================
// MOCK STORE — tất cả data chỉ tồn tại trong memory
// Reset về data mẫu khi refresh trang
// ============================================================

export type Customer = {
  maKH: string;
  tenKH: string;
  soDienThoai: string;
  diaChi: string;
};

export type Costume = {
  maTP: string;
  tenTP: string;
  loaiTP: string;
  giaThue: number;
  size: string;
  moTa: string;
  hinhAnh: string;
  trangThai: string;
};

export type OrderStatus = 'Chưa cọc đơn' | 'Đang thuê' | 'Đã trả' | 'Trễ hạn';

export type Order = {
  id: string;
  invoiceNo: string;
  customer: string;
  phone: string;
  item: string;
  rentedAt: string;
  dueDate: string;
  status: OrderStatus;
  deposit: string;
  total: string;
  hinhThucCoc?: string;
  chiTietCoc?: string;
};

export type PenaltyConfig = {
  tyLePhatQuaHan: number;
  moTaQuyDinh: string;
  trangThaiApDung: boolean;
};

// ---- SEED DATA ----

const customers: Customer[] = [
  { maKH: 'KH000001', tenKH: 'Nguyễn Văn An', soDienThoai: '0912345678', diaChi: '123 Lê Lợi, TP.HCM' },
  { maKH: 'KH000002', tenKH: 'Trần Thị Bình', soDienThoai: '0987654321', diaChi: '45 Nguyễn Huệ, Hà Nội' },
  { maKH: 'KH000003', tenKH: 'Lê Minh Châu', soDienThoai: '0909111222', diaChi: '78 Trần Phú, Đà Nẵng' },
  { maKH: 'KH000004', tenKH: 'Phạm Ngọc Ánh', soDienThoai: '0933222111', diaChi: '' },
];

const costumes: Costume[] = [
  { maTP: 'TP000001', tenTP: 'Áo dài truyền thống', loaiTP: 'Áo dài', giaThue: 150000, size: 'M', moTa: 'Áo dài lụa cao cấp', hinhAnh: '/images/ao_dai.png', trangThai: 'Sẵn sàng' },
  { maTP: 'TP000002', tenTP: 'Vest nam lịch lãm', loaiTP: 'Vest', giaThue: 200000, size: 'L', moTa: 'Vest đen sang trọng', hinhAnh: '/images/vest.jpeg', trangThai: 'Đang thuê' },
  { maTP: 'TP000003', tenTP: 'Váy dạ hội đỏ', loaiTP: 'Váy dạ hội', giaThue: 300000, size: 'S', moTa: 'Váy dạ hội đỏ rực', hinhAnh: '/images/vay_da_hoi.jpg', trangThai: 'Đang thuê' },
  { maTP: 'TP000004', tenTP: 'Hanbok Hàn Quốc', loaiTP: 'Cosplay', giaThue: 250000, size: 'M', moTa: 'Hanbok truyền thống', hinhAnh: '/images/hanbok.jpg', trangThai: 'Hư hỏng' },
  { maTP: 'TP000005', tenTP: 'Áo dài cách tân xanh', loaiTP: 'Áo dài', giaThue: 180000, size: 'S', moTa: 'Áo dài cách tân màu xanh lá', hinhAnh: '/images/ao_dai_xanh.png', trangThai: 'Sẵn sàng' },
  { maTP: 'TP000006', tenTP: 'Vest nữ trắng', loaiTP: 'Vest', giaThue: 220000, size: 'M', moTa: 'Vest nữ màu trắng thanh lịch', hinhAnh: '/images/vest_nu.jpg', trangThai: 'Đang thuê' },
];

const orders: Order[] = [
  { id: '1', invoiceNo: 'HDT000001', customer: 'Nguyễn Văn An', phone: '0912345678', item: 'Vest nam lịch lãm', rentedAt: '01/06/2026', dueDate: '05/06/2026', status: 'Đang thuê', deposit: '200.000đ', total: '600.000đ' },
  { id: '2', invoiceNo: 'HDT000002', customer: 'Trần Thị Bình', phone: '0987654321', item: 'Áo dài truyền thống', rentedAt: '03/06/2026', dueDate: '07/06/2026', status: 'Chưa cọc đơn', deposit: '0đ', total: '450.000đ' },
  { id: '3', invoiceNo: 'HDT000003', customer: 'Lê Minh Châu', phone: '0909111222', item: 'Váy dạ hội đỏ', rentedAt: '28/05/2026', dueDate: '01/06/2026', status: 'Trễ hạn', deposit: '300.000đ', total: '900.000đ' },
  { id: '4', invoiceNo: 'HDT000004', customer: 'Phạm Ngọc Ánh', phone: '0933222111', item: 'Vest nữ trắng', rentedAt: '05/06/2026', dueDate: '10/06/2026', status: 'Đang thuê', deposit: '0đ', total: '220.000đ', hinhThucCoc: 'Giấy tờ tùy thân', chiTietCoc: 'CCCD - 079204012345' },
];

let penaltyConfig: PenaltyConfig = {
  tyLePhatQuaHan: 10,
  moTaQuyDinh: 'Phí phạt 10%/ngày trên tổng giá trị đơn thuê.',
  trangThaiApDung: true,
};

// ---- HELPERS ----

function nextCode(prefix: string, list: { [k: string]: string }[], key: string): string {
  if (list.length === 0) return `${prefix}000001`;
  const nums = list.map((i) => parseInt((i[key] as string).replace(prefix, '')) || 0);
  return `${prefix}${String(Math.max(...nums) + 1).padStart(6, '0')}`;
}

// ---- CUSTOMER API ----

export const customerStore = {
  list: () => [...customers],
  nextCode: () => nextCode('KH', customers as any, 'maKH'),
  create: (c: Customer) => { customers.push(c); },
};

// ---- COSTUME API ----

export const costumeStore = {
  list: () => [...costumes],
  nextCode: () => nextCode('TP', costumes as any, 'maTP'),
  create: (c: Omit<Costume, 'maTP'>) => {
    const maTP = nextCode('TP', costumes as any, 'maTP');
    costumes.push({ ...c, maTP });
    return maTP;
  },
  update: (maTP: string, patch: Partial<Costume>) => {
    const idx = costumes.findIndex((c) => c.maTP === maTP);
    if (idx !== -1) costumes[idx] = { ...costumes[idx], ...patch };
  },
  delete: (maTP: string) => {
    const idx = costumes.findIndex((c) => c.maTP === maTP);
    if (idx !== -1) costumes.splice(idx, 1);
  },
};

// ---- ORDER API ----

export const orderStore = {
  list: () => [...orders],
  nextCode: () => nextCode('HDT', orders as any, 'invoiceNo'),
  create: (o: Omit<Order, 'id'>) => {
    orders.unshift({ ...o, id: String(Date.now()) });
    o.item.split(', ').forEach((name) => {
      const c = costumes.find((c) => c.tenTP === name);
      if (c) c.trangThai = 'Đang thuê';
    });
  },
  updateStatus: (invoiceNo: string, status: OrderStatus) => {
    const o = orders.find((o) => o.invoiceNo === invoiceNo);
    if (o) o.status = status;
  },
  update: (invoiceNo: string, patch: Partial<Order>) => {
    const idx = orders.findIndex((o) => o.invoiceNo === invoiceNo);
    if (idx !== -1) orders[idx] = { ...orders[idx], ...patch };
  },
  // Lấy thông tin thuê của 1 trang phục (nếu đang thuê)
  getRentalInfo: (tenTP: string) => {
    const order = orders.find(
      (o) => (o.status === 'Đang thuê' || o.status === 'Trễ hạn') &&
        o.item.split(', ').map(s => s.trim()).includes(tenTP)
    );
    if (!order) return null;
    return { customer: order.customer, dueDate: order.dueDate };
  },
};

// ---- PENALTY CONFIG API ----

export const penaltyStore = {
  get: () => ({ ...penaltyConfig }),
  save: (cfg: PenaltyConfig) => { penaltyConfig = { ...cfg }; },
};

// ---- AUTH ----

const users = [
  { taiKhoan: 'admin', matKhau: '123456', vaiTro: 'chucuahang' },
  { taiKhoan: 'nhanvien', matKhau: '123456', vaiTro: 'nhanvien' },
];

export const authStore = {
  login: (taiKhoan: string, matKhau: string) => {
    const u = users.find((u) => u.taiKhoan === taiKhoan && u.matKhau === matKhau);
    if (!u) throw new Error('Tài khoản hoặc mật khẩu không đúng');
    return { taiKhoan: u.taiKhoan, vaiTro: u.vaiTro };
  },
};
