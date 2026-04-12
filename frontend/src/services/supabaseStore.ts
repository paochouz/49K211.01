import { supabase } from './supabaseClient';

export type Customer = { maKH: string; tenKH: string; soDienThoai: string; diaChi: string; };
export type Costume = { maTP: string; tenTP: string; loaiTP: string; giaThue: number; size: string; moTa: string; hinhAnh: string; trangThai: string; };
export type OrderStatus = 'Chưa cọc đơn' | 'Đang thuê' | 'Đã trả' | 'Trễ hạn';
export type Order = { id: string; invoiceNo: string; customer: string; phone: string; item: string; rentedAt: string; dueDate: string; status: OrderStatus; deposit: string; total: string; hinhThucCoc?: string; chiTietCoc?: string; ghiChuGiayTo?: string; };
export type PenaltyConfig = { tyLePhatQuaHan: number; moTaQuyDinh: string; trangThaiApDung: boolean; };

function nextCode(prefix: string, list: string[]): string {
  if (list.length === 0) return `${prefix}000001`;
  const nums = list.map(c => parseInt(c.replace(prefix, '')) || 0);
  return `${prefix}${String(Math.max(...nums) + 1).padStart(6, '0')}`;
}

function formatDate(d: string | null): string {
  if (!d) return '';
  // Xử lý format dd/MM/yyyy từ DB
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
  // Xử lý format yyyy-MM-dd hoặc ISO
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d; // trả nguyên nếu không parse được
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseNumericValue(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }
  return Number(value) || 0;
}

function normalizeOrderStatus(raw: string): OrderStatus {
  const normalized = (raw || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // bỏ dấu
  if (['dang thue'].includes(normalized)) return 'Đang thuê';
  if (['da tra'].includes(normalized)) return 'Đã trả';
  if (['tre han'].includes(normalized)) return 'Trễ hạn';
  return 'Chưa cọc đơn';
}

function mapOrderStatusToDb(status: OrderStatus): string {
  const dbStatusMap: Record<OrderStatus, string> = {
    'Chưa cọc đơn': 'Chua coc',
    'Đang thuê': 'Dang thue',
    'Đã trả': 'Da tra',
    'Trễ hạn': 'Tre han',
  };
  return dbStatusMap[status] || 'Chua coc';
}

async function getActiveRentedMatps(): Promise<Set<string>> {
  const [{ data: details }, { data: orders }] = await Promise.all([
    supabase.from('chitietdonthue').select('matp, madon'),
    supabase.from('donthue').select('madon, trangthaidon'),
  ]);
  const activeOrderIds = new Set(
    (orders || [])
      .filter((o: any) => ['Dang thue', 'Tre han'].includes(o.trangthaidon))
      .map((o: any) => o.madon),
  );
  return new Set(
    (details || [])
      .filter((d: any) => activeOrderIds.has(d.madon))
      .map((d: any) => d.matp),
  );
}

function mapStatus(raw: string): OrderStatus {
  return normalizeOrderStatus(raw);
}

// ---- AUTH ----
export const authStore = {
  login: async (taiKhoan: string, matKhau: string) => {
    const { data, error } = await supabase
      .from('nguoidung')
      .select('*')
      .eq('taikhoan', taiKhoan)
      .eq('matkhau', matKhau)
      .maybeSingle();
    if (error || !data) throw new Error('Tài khoản hoặc mật khẩu không đúng');
    return { taiKhoan: data.taikhoan, vaiTro: data.vaitro };
  },
};

// ---- CUSTOMER ----
export const customerStore = {
  list: async (): Promise<Customer[]> => {
    const { data } = await supabase.from('khachhang').select('*').order('makh');
    return (data || []).map((r: any) => ({ maKH: r.makh, tenKH: r.tenkh, soDienThoai: r.sodienthoai, diaChi: r.diachi || '' }));
  },
  nextCode: async (): Promise<string> => {
    const { data } = await supabase.from('khachhang').select('makh');
    return nextCode('KH', (data || []).map((r: any) => r.makh));
  },
  create: async (c: Customer) => {
    await supabase.from('khachhang').insert({ makh: c.maKH, tenkh: c.tenKH, sodienthoai: c.soDienThoai, diachi: c.diaChi });
  },
};

// ---- COSTUME ----
export const costumeStore = {
  list: async (): Promise<Costume[]> => {
    const { data, error } = await supabase.from('trangphuc').select('*').order('matp');
    const activeRentedMatps = await getActiveRentedMatps();
    console.log('trangphuc data:', data, 'error:', error);
    return (data || []).map((r: any) => ({
      maTP: r.matp,
      tenTP: r.tentp,
      loaiTP: r.loaitp || '',
      giaThue: parseNumericValue(r.giathue ?? r.giaThue),
      size: r.size || '',
      moTa: r.mota || '',
      hinhAnh: r.hinhanh || '',
      trangThai: activeRentedMatps.has(r.matp) ? 'Đang thuê' : (r.trangthai || 'Sẵn sàng'),
    }));
  },
  nextCode: async (): Promise<string> => {
    const { data } = await supabase.from('trangphuc').select('matp');
    return nextCode('TP', (data || []).map((r: any) => r.matp));
  },
  create: async (c: Omit<Costume, 'maTP'>) => {
    const { data: existing } = await supabase.from('trangphuc').select('matp');
    const maTP = nextCode('TP', (existing || []).map((r: any) => r.matp));
    await supabase.from('trangphuc').insert({ matp: maTP, tentp: c.tenTP, loaitp: c.loaiTP, giathue: c.giaThue, size: c.size, mota: c.moTa, hinhanh: c.hinhAnh, trangthai: c.trangThai });
    return maTP;
  },
  update: async (maTP: string, patch: Partial<Costume>) => {
    const mapped: any = {};
    if (patch.tenTP !== undefined) mapped.tentp = patch.tenTP;
    if (patch.loaiTP !== undefined) mapped.loaitp = patch.loaiTP;
    if (patch.giaThue !== undefined) mapped.giathue = patch.giaThue;
    if (patch.size !== undefined) mapped.size = patch.size;
    if (patch.moTa !== undefined) mapped.mota = patch.moTa;
    if (patch.hinhAnh !== undefined) mapped.hinhanh = patch.hinhAnh;
    if (patch.trangThai !== undefined) mapped.trangthai = patch.trangThai;
    await supabase.from('trangphuc').update(mapped).eq('matp', maTP);
  },
  delete: async (maTP: string) => {
    await supabase.from('trangphuc').delete().eq('matp', maTP);
  },
};

// ---- ORDER ----
export const orderStore = {
  list: async (): Promise<Order[]> => {
    try {
      const { data: orders, error: ordersError } = await supabase.from('donthue').select('*').order('madon', { ascending: false });
      if (ordersError || !orders || orders.length === 0) return [];

      const [{ data: customers }, { data: details }, { data: costumes }] = await Promise.all([
        supabase.from('khachhang').select('makh, tenkh, sodienthoai'),
        supabase.from('chitietdonthue').select('madon, matp, ngaythue, ngaytradukien'),
        supabase.from('trangphuc').select('matp, tentp'),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Tự động chuyển "Dang thue" sang "Tre han" nếu quá ngày trả
      const overdueIds: string[] = [];
      for (const o of orders) {
        if (o.trangthaidon !== 'Dang thue') continue;
        const orderDetails = (details || []).filter((d: any) => d.madon === o.madon);
        const maxDueDate = orderDetails.reduce((max: Date | null, d: any) => {
          if (!d.ngaytradukien) return max;
          const due = new Date(d.ngaytradukien);
          due.setHours(0, 0, 0, 0);
          return !max || due > max ? due : max;
        }, null);
        if (maxDueDate && maxDueDate < today) overdueIds.push(o.madon);
      }
      if (overdueIds.length > 0) {
        await supabase.from('donthue').update({ trangthaidon: 'Tre han' }).in('madon', overdueIds);
        overdueIds.forEach((id) => {
          const o = orders.find((x: any) => x.madon === id);
          if (o) o.trangthaidon = 'Tre han';
        });
      }

      return orders.map((o: any) => {
        const kh = (customers || []).find((c: any) => c.makh === o.makh);
        const orderDetails = (details || []).filter((d: any) => d.madon === o.madon);
        const itemNames = orderDetails.map((d: any) => {
          const tp = (costumes || []).find((c: any) => c.matp === d.matp);
          return tp?.tentp || d.matp;
        }).join(', ');
        const rentedAt = orderDetails[0]?.ngaythue ? formatDate(orderDetails[0].ngaythue) : '';
        const dueDate = orderDetails[0]?.ngaytradukien ? formatDate(orderDetails[0].ngaytradukien) : '';

        return {
          id: o.madon, invoiceNo: o.madon,
          customer: kh?.tenkh || o.makh, phone: kh?.sodienthoai || '',
          item: itemNames, rentedAt, dueDate,
          status: mapStatus(o.trangthaidon),
          deposit: o.tiencoc ? `${Number(o.tiencoc).toLocaleString('vi-VN')}đ` : '0đ',
          total: o.tongtienthue ? `${Number(o.tongtienthue).toLocaleString('vi-VN')}đ` : '0đ',
          hinhThucCoc: o.hinhthuccoc === 'GiayTo' ? 'Giấy tờ tùy thân' : 'Tiền mặt/chuyển khoản',
          chiTietCoc: o.ghichugiayto || '', ghiChuGiayTo: o.ghichugiayto || '',
        };
      });
    } catch { return []; }
  },
  nextCode: async (): Promise<string> => {
    const { data } = await supabase.from('donthue').select('madon');
    return nextCode('HDT', (data || []).map((r: any) => r.madon));
  },
  create: async (o: Omit<Order, 'id'> & { detailItems?: Array<{ matp: string; ngaythue: string; ngaytradukien: string }> }) => {
    // Lấy makh từ phone
    const { data: kh } = await supabase.from('khachhang').select('makh').eq('sodienthoai', o.phone).maybeSingle();
    const makh = kh?.makh || '';
    const tiencoc = Number(o.deposit.replace(/[^\d]/g, '')) || 0;
    const tongtienthue = Number(o.total.replace(/[^\d]/g, '')) || 0;

    const parseDisplayDate = (value: string): string => {
      const parts = value.split('/').map((p) => p.trim());
      if (parts.length !== 3) return value;
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const { error: orderError } = await supabase.from('donthue').insert({
      id: o.invoiceNo,
      madon: o.invoiceNo,
      makh,
      taikhoannhanvien: 'admin',
      hinhthuccoc: (o.hinhThucCoc === 'Giấy tờ tùy thân') ? 'GiayTo' : 'Tien',
      tiencoc,
      ghichugiayto: o.ghiChuGiayTo || null,
      tongtienthue,
      phitratre: 0,
      tongphatsinh: 0,
      tienphaithutra: Math.max(0, tongtienthue - tiencoc),
      trangthaidon: 'Chua coc',
      ngaytao: new Date().toISOString(),
    });
    if (orderError) throw orderError;

    // Nếu có detailItems (từ AddDonThue với ngày riêng từng item), dùng trực tiếp
    if (o.detailItems && o.detailItems.length > 0) {
      for (const detail of o.detailItems) {
        const { error: detailError } = await supabase.from('chitietdonthue').insert({
          madon: o.invoiceNo,
          matp: detail.matp,
          ngaythue: parseDisplayDate(detail.ngaythue),
          ngaytradukien: parseDisplayDate(detail.ngaytradukien),
          trangthaitra: 'Bình thường',
          phihuhong: 0,
        });
        if (detailError) throw detailError;
        // Không cập nhật trangthai trang phục ở đây — chỉ cập nhật khi đơn chuyển sang "Đang thuê"
      }
      return;
    }

    // Fallback: tìm theo tên trang phục
    const names = o.item.split(',').map((s) => s.trim()).filter(Boolean);
    const { data: costumes } = await supabase.from('trangphuc').select('matp, tentp');
    if (!costumes) throw new Error('Không lấy được danh sách trang phục');

    for (const name of names) {
      const tp = costumes.find((c: any) => c.tentp === name);
      if (!tp) throw new Error(`Không tìm thấy trang phục: ${name}`);

      const { error: detailError } = await supabase.from('chitietdonthue').insert({
        madon: o.invoiceNo,
        matp: tp.matp,
        ngaythue: parseDisplayDate(o.rentedAt),
        ngaytradukien: parseDisplayDate(o.dueDate),
        trangthaitra: 'Bình thường',
        phihuhong: 0,
      });
      if (detailError) throw detailError;
      // Không cập nhật trangthai trang phục ở đây — chỉ cập nhật khi đơn chuyển sang "Đang thuê"
    }
  },
  getOrderDetailsByInvoice: async (invoiceNo: string) => {
    const [{ data: details }, { data: costumes }] = await Promise.all([
      supabase.from('chitietdonthue').select('matp, ngaythue, ngaytradukien').eq('madon', invoiceNo),
      supabase.from('trangphuc').select('matp, tentp, hinhanh'),
    ]);

    return (details || []).map((d: any) => {
      const costume = (costumes || []).find((c: any) => c.matp === d.matp);
      return {
        matp: d.matp,
        tenTP: costume?.tentp || d.matp,
        hinhAnh: costume?.hinhanh || '',
        ngayThue: formatDate(d.ngaythue),
        ngayTraDuKien: formatDate(d.ngaytradukien),
      };
    });
  },
  updateStatus: async (invoiceNo: string, status: OrderStatus) => {
    await supabase.from('donthue').update({ trangthaidon: mapOrderStatusToDb(status) }).eq('madon', invoiceNo);
  },
  completeReturn: async (invoiceNo: string, returnedItems: Array<{ matp: string; status: string; phiHuHong: number }>) => {
    const statusMap: Record<string, string> = {
      'Bình thường': 'Sẵn sàng',
      'Hư hỏng': 'Hư hỏng',
      'Mất': 'Ngưng sử dụng',
    };

    await supabase.from('donthue').update({ trangthaidon: mapOrderStatusToDb('Đã trả') }).eq('madon', invoiceNo);

    await Promise.all(returnedItems.map(async (item) => {
      const costumeStatus = statusMap[item.status] || 'Sẵn sàng';
      await supabase.from('trangphuc').update({ trangthai: costumeStatus }).eq('matp', item.matp);
      await supabase.from('chitietdonthue')
        .update({ trangthaitra: item.status, phihuhong: item.phiHuHong })
        .eq('madon', invoiceNo)
        .eq('matp', item.matp);
    }));
  },
  update: async (invoiceNo: string, patch: Partial<Order> & { detailItems?: Array<{ matp: string; ngaythue: string; ngaytradukien: string }> }) => {
    const mapped: any = {};
    if (patch.phone !== undefined) {
      const { data: kh } = await supabase.from('khachhang').select('makh').eq('sodienthoai', patch.phone).maybeSingle();
      let makh = kh?.makh;
      if (!makh && patch.customer) {
        const { data: created } = await supabase.from('khachhang').insert({ tenkh: patch.customer, sodienthoai: patch.phone, diachi: '' }).select('makh').maybeSingle();
        makh = created?.makh;
      }
      if (makh) mapped.makh = makh;
      if (patch.customer !== undefined && makh) {
        await supabase.from('khachhang').update({ tenkh: patch.customer }).eq('makh', makh);
      }
    } else if (patch.customer !== undefined) {
      const { data: order } = await supabase.from('donthue').select('makh').eq('madon', invoiceNo).maybeSingle();
      if (order?.makh) {
        await supabase.from('khachhang').update({ tenkh: patch.customer }).eq('makh', order.makh);
      }
    }
    if (patch.hinhThucCoc !== undefined) {
      mapped.hinhthuccoc = patch.hinhThucCoc === 'Giấy tờ tùy thân' ? 'GiayTo' : 'Tien';
    }
    if (patch.ghiChuGiayTo !== undefined) mapped.ghichugiayto = patch.ghiChuGiayTo || null;

    const normalizeMoney = (value: string): number => Number(value.replace(/[^\d]/g, '')) || 0;
    const parseDisplayDate = (value: string): string => {
      const parts = value.split('/').map((part) => part.trim());
      if (parts.length !== 3) return value;
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    let currentOrder: any = null;
    if (patch.deposit !== undefined || patch.total !== undefined) {
      const { data } = await supabase.from('donthue').select('tiencoc, tongtienthue').eq('madon', invoiceNo).maybeSingle();
      currentOrder = data;
    }

    if (patch.deposit !== undefined) mapped.tiencoc = normalizeMoney(patch.deposit);
    if (patch.total !== undefined) mapped.tongtienthue = normalizeMoney(patch.total);
    if (patch.deposit !== undefined || patch.total !== undefined) {
      const currentDeposit = patch.deposit !== undefined ? mapped.tiencoc : Number(currentOrder?.tiencoc || 0);
      const currentTotal = patch.total !== undefined ? mapped.tongtienthue : Number(currentOrder?.tongtienthue || 0);
      mapped.tienphaithutra = Math.max(0, currentTotal - currentDeposit);
    }

    if (patch.status !== undefined) mapped.trangthaidon = mapOrderStatusToDb(patch.status);
    if (Object.keys(mapped).length > 0) {
      await supabase.from('donthue').update(mapped).eq('madon', invoiceNo);
    }

    const needsDetailUpdate = patch.detailItems !== undefined || patch.item !== undefined || patch.rentedAt !== undefined || patch.dueDate !== undefined;
    if (needsDetailUpdate) {
      const { data: currentDetails } = await supabase.from('chitietdonthue').select('matp, ngaythue, ngaytradukien').eq('madon', invoiceNo);
      const existingDetails = currentDetails || [];
      const oldMatps = existingDetails.map((detail: any) => detail.matp);

      if (patch.detailItems !== undefined) {
        const newDetails = patch.detailItems.map((detail) => ({
          matp: detail.matp,
          ngaythue: parseDisplayDate(detail.ngaythue),
          ngaytradukien: parseDisplayDate(detail.ngaytradukien),
        }));
        const newMatps = newDetails.map((detail) => detail.matp);
        const removedMatps = oldMatps.filter((matp: string) => !newMatps.includes(matp));
        const addedMatps = newMatps.filter((matp) => !oldMatps.includes(matp));

        if (removedMatps.length) {
          await supabase.from('trangphuc').update({ trangthai: 'Sẵn sàng' }).in('matp', removedMatps);
        }
        if (addedMatps.length) {
          await supabase.from('trangphuc').update({ trangthai: 'Đang thuê' }).in('matp', addedMatps);
        }

        await supabase.from('chitietdonthue').delete().eq('madon', invoiceNo);

        const detailRows = newDetails.map((detail) => ({
          madon: invoiceNo,
          matp: detail.matp,
          ngaythue: detail.ngaythue,
          ngaytradukien: detail.ngaytradukien,
          trangthaitra: 'Bình thường',
          phihuhong: 0,
        }));

        if (detailRows.length > 0) {
          await supabase.from('chitietdonthue').insert(detailRows);
        }
      } else if (patch.item !== undefined) {
        const itemNames = patch.item.split(',').map((name) => name.trim()).filter(Boolean);
        const { data: costumes } = await supabase.from('trangphuc').select('matp, tentp');
        const newDetails = (costumes || [])
          .filter((c: any) => itemNames.includes(c.tentp))
          .map((c: any) => ({ matp: c.matp }));

        const newMatps = newDetails.map((detail) => detail.matp);
        const removedMatps = oldMatps.filter((matp: string) => !newMatps.includes(matp));
        const addedMatps = newMatps.filter((matp: string) => !oldMatps.includes(matp));

        if (removedMatps.length) {
          await supabase.from('trangphuc').update({ trangthai: 'Sẵn sàng' }).in('matp', removedMatps);
        }
        if (addedMatps.length) {
          await supabase.from('trangphuc').update({ trangthai: 'Đang thuê' }).in('matp', addedMatps);
        }

        await supabase.from('chitietdonthue').delete().eq('madon', invoiceNo);

        const firstDetail = existingDetails[0];
        const detailRentedAt = patch.rentedAt !== undefined ? parseDisplayDate(patch.rentedAt) : (firstDetail?.ngaythue || '');
        const detailDueDate = patch.dueDate !== undefined ? parseDisplayDate(patch.dueDate) : (firstDetail?.ngaytradukien || '');

        const detailRows = newDetails.map((detail) => ({
          madon: invoiceNo,
          matp: detail.matp,
          ngaythue: detailRentedAt,
          ngaytradukien: detailDueDate,
          trangthaitra: 'Bình thường',
          phihuhong: 0,
        }));

        if (detailRows.length > 0) {
          await supabase.from('chitietdonthue').insert(detailRows);
        }
      } else {
        const detailPatch: any = {};
        if (patch.rentedAt !== undefined) detailPatch.ngaythue = parseDisplayDate(patch.rentedAt);
        if (patch.dueDate !== undefined) detailPatch.ngaytradukien = parseDisplayDate(patch.dueDate);
        if (Object.keys(detailPatch).length > 0) {
          await supabase.from('chitietdonthue').update(detailPatch).eq('madon', invoiceNo);
        }
      }
    }
  },
  getRentalInfo: async (maTP: string) => {
    // Lấy tất cả chi tiết đơn thuê của trang phục này
    const { data: details } = await supabase
      .from('chitietdonthue')
      .select('madon, ngaytradukien')
      .eq('matp', maTP);
    if (!details || details.length === 0) return null;

    // Tìm đơn đang active trong số đó
    for (const detail of details) {
      const { data: order } = await supabase
        .from('donthue')
        .select('makh, khachhang(tenkh)')
        .eq('madon', detail.madon)
        .in('trangthaidon', ['Dang thue', 'Tre han', 'Đang thuê', 'Trễ hạn'])
        .maybeSingle();
      if (order) {
        const tenkh = (order.khachhang as any)?.tenkh || '';
        return { customer: tenkh, dueDate: formatDate(detail.ngaytradukien) };
      }
    }
    return null;
  },
};

// ---- PENALTY ----
export const penaltyStore = {
  get: async (): Promise<PenaltyConfig> => {
    const { data } = await supabase.from('cauhinhphat').select('*').limit(1).maybeSingle();
    if (!data) return { tyLePhatQuaHan: 10, moTaQuyDinh: '', trangThaiApDung: true };
    const tyLePhat = data.tylephatquahan !== null && data.tylephatquahan !== undefined ? Number(data.tylephatquahan) : (data.tylephat !== null && data.tylephat !== undefined ? Number(data.tylephat) : 10);
    return { tyLePhatQuaHan: tyLePhat, moTaQuyDinh: data.motaquydinh || '', trangThaiApDung: data.trangthaiapdung ?? true };
  },
  save: async (cfg: PenaltyConfig) => {
    const { data: existing } = await supabase.from('cauhinhphat').select('*').limit(1).maybeSingle();
    if (existing) {
      await supabase.from('cauhinhphat').update({ tylephatquahan: cfg.tyLePhatQuaHan, motaquydinh: cfg.moTaQuyDinh, trangthaiapdung: cfg.trangThaiApDung }).eq('id', existing.id);
    } else {
      await supabase.from('cauhinhphat').insert({ tylephatquahan: cfg.tyLePhatQuaHan, motaquydinh: cfg.moTaQuyDinh, trangthaiapdung: cfg.trangThaiApDung });
    }
  },
};
