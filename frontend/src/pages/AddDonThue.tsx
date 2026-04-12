import React, { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import type { OrderItem } from "./DonThue";
import type { OrderStatus } from "./DonThue";
import { orderStore, customerStore, costumeStore } from "../services/supabaseStore";
import type { Costume as SupabaseCostume } from "../services/supabaseStore";

type Customer = {
  maKH: string;
  tenKH: string;
  soDienThoai: string;
};

type LocalCostume = {
  id: string;
  tenTP: string;
  size: string;
  donGia: number;
};

type RentItem = {
  id: string;
  costumeId?: string;
  tenTP: string;
  size: string;
  donGia: number;
  ngayThue: string; // yyyy-mm-dd
  ngayTra: string; // yyyy-mm-dd
};

type DepositMethod = "GIAY_TO" | "TIEN_MAT_CHUYEN_KHOAN";
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayDDMMYYYY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function ddmmyyyyToISO(value: string) {
  const d = parseDDMMYYYY(value);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDDMMYYYY(input: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  const d = new Date(yyyy, mm - 1, dd);
  // Reject invalid dates like 31/02/2026
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return startOfDay(d);
}

function clampMinDDMMYYYY(value: string, minValue: string) {
  const v = parseDDMMYYYY(value);
  const min = parseDDMMYYYY(minValue);
  if (!v || !min) return value;
  return v.getTime() < min.getTime() ? minValue : value;
}

function calcDaysInclusiveDDMMYYYY(startStr: string, endStr: string) {
  const start = parseDDMMYYYY(startStr);
  const end = parseDDMMYYYY(endStr);
  if (!start || !end) return 0;
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const days = diffDays + 1;
  return days <= 0 ? 1 : days;
}


function DateField({
  value,
  onChange,
  minISO,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  minISO: string;
  placeholder?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const minDate = useMemo(() => {
    // minISO: yyyy-mm-dd
    const d = new Date(minISO);
    return startOfDay(d);
  }, [minISO]);

  const selectedDate = useMemo(() => parseDDMMYYYY(value), [value]);
  const [view, setView] = useState<Date>(() => selectedDate ?? startOfDay(new Date()));

  useEffect(() => {
    if (!open) return;
    const base = selectedDate ?? startOfDay(new Date());
    setView(startOfDay(new Date(base.getFullYear(), base.getMonth(), 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const firstOfMonth = useMemo(() => startOfDay(new Date(view.getFullYear(), view.getMonth(), 1)), [view]);
  const startDow = useMemo(() => {
    // JS: 0=Sun..6=Sat -> map to Monday-first grid
    const js = firstOfMonth.getDay();
    return (js + 6) % 7; // 0=Mon..6=Sun
  }, [firstOfMonth]);

  const daysInMonth = useMemo(() => new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), [view]);

  const isDisabled = (d: Date) => d.getTime() < minDate.getTime();

  const select = (d: Date) => {
    if (isDisabled(d)) return;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    onChange(`${dd}/${mm}/${yyyy}`);
    setOpen(false);
  };

  const goMonth = (delta: number) => {
    setView((prev) => startOfDay(new Date(prev.getFullYear(), prev.getMonth() + delta, 1)));
  };

  const today = startOfDay(new Date());

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 42px", gap: 8, alignItems: "end" }}>
        <input
          value={value}
          inputMode="numeric"
          placeholder={placeholder ?? "dd/mm/yyyy"}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
        <button type="button" aria-label="Chọn ngày" style={calendarButtonStyle} onClick={() => setOpen((v) => !v)}>
          📅
        </button>
      </div>

      {open && (
        <div style={calendarPopoverStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <button type="button" style={calendarNavButtonStyle} onClick={() => goMonth(-1)}>
              ‹
            </button>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
              {monthNames[view.getMonth()]} {view.getFullYear()}
            </div>
            <button type="button" style={calendarNavButtonStyle} onClick={() => goMonth(1)}>
              ›
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 10 }}>
            {weekdays.map((w) => (
              <div key={w} style={{ textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                {w}
              </div>
            ))}

            {Array.from({ length: startDow }).map((_, idx) => (
              <div key={`sp-${idx}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = startOfDay(new Date(view.getFullYear(), view.getMonth(), day));
              const disabled = isDisabled(d);
              const selected =
                selectedDate &&
                d.getFullYear() === selectedDate.getFullYear() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getDate() === selectedDate.getDate();

              const isToday =
                d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => select(d)}
                  style={{
                    ...calendarDayStyle,
                    ...(isToday ? calendarTodayStyle : {}),
                    ...(selected ? calendarSelectedStyle : {}),
                    ...(disabled ? calendarDisabledStyle : {}),
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
            <button
              type="button"
              style={calendarFooterButtonStyle}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Xóa
            </button>
            <button type="button" style={calendarFooterButtonStyle} onClick={() => select(today.getTime() < minDate.getTime() ? minDate : today)}>
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddDonThue({ onClose, initialData, onSuccess }: { onClose?: () => void; initialData?: OrderItem; onSuccess?: () => void }) {
  const location = useLocation();
  const routeInitialData = (location.state as { initialData?: OrderItem } | null)?.initialData;
  const resolvedInitialData = initialData ?? routeInitialData;
  const isEditMode = !!resolvedInitialData;
  // Chỉ cho chỉnh sửa khi đơn ở trạng thái "Chưa cọc đơn"
  const isLocked = isEditMode && resolvedInitialData?.status !== 'Chưa cọc đơn';
  const minDateISO = useMemo(() => todayISO(), []);
  const minDateStr = useMemo(() => todayDDMMYYYY(), []);

  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    customerStore.list().then(list =>
      setCustomers(list.map(c => ({ maKH: c.maKH, tenKH: c.tenKH, soDienThoai: c.soDienThoai })))
    );
  }, []);

  // Pre-fill customer từ initialData nếu có
  const initialCustomer = useMemo<Customer | undefined>(() => {
    if (!resolvedInitialData) return undefined;
    return {
      maKH: "KH000000",
      tenKH: resolvedInitialData.customer,
      soDienThoai: resolvedInitialData.phone,
    };
  }, [resolvedInitialData]);

  const [form, setForm] = useState<{
    maDon: string;
    invoiceNumber: number;
    khachHang?: Customer;
    hinhThucCoc: DepositMethod;
    tienCoc: number;
    trangThai: string;
    ghiChuGiayTo: string;
  }>(() => ({
    maDon: resolvedInitialData?.invoiceNo ?? "",
    invoiceNumber: 0,
    khachHang: initialCustomer,
    hinhThucCoc: (resolvedInitialData as any)?.hinhThucCoc === 'Giấy tờ tùy thân' ? "GIAY_TO" : "TIEN_MAT_CHUYEN_KHOAN",
    tienCoc: resolvedInitialData ? Number(resolvedInitialData.deposit.replace(/[^\d]/g, "")) : 0,
    trangThai: resolvedInitialData?.status ?? "Chưa cọc đơn",
    ghiChuGiayTo: (resolvedInitialData as any)?.ghiChuGiayTo || "",
  }));

  const [tienCocTouched, setTienCocTouched] = useState(false);

  const [items, setItems] = useState<RentItem[]>(() => []);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCostumeModalOpenFor, setIsCostumeModalOpenFor] = useState<string | null>(null);

  const [customerKeyword, setCustomerKeyword] = useState("");
  const [costumeKeyword, setCostumeKeyword] = useState("");

  const [customerMode, setCustomerMode] = useState<"SELECT" | "CREATE">("SELECT");
  const [newCustomer, setNewCustomer] = useState({ maKH: "", tenKH: "", soDienThoai: "", diaChi: "" });
  const [customerCreateMessage, setCustomerCreateMessage] = useState("");
  const [customerCreateIsError, setCustomerCreateIsError] = useState(false);
  const [customerCreateLoading, setCustomerCreateLoading] = useState(false);

  // Auto mã đơn từ Supabase
  useEffect(() => {
    if (isEditMode) return;
    orderStore.nextCode().then(code => setForm((prev) => ({ ...prev, maDon: code, invoiceNumber: 0 })));
  }, [isEditMode]);

  const derived = useMemo(() => {
    const row = items.map((it) => {
      const days = calcDaysInclusiveDDMMYYYY(it.ngayThue, it.ngayTra);
      const thanhTien = Math.max(0, Number(it.donGia) || 0) * days;
      return { id: it.id, days, thanhTien };
    });

    const tongDonThue = row.reduce((sum, r) => sum + r.thanhTien, 0);

    // Phí trả trễ: chưa có cấu hình admin => mặc định 0
    const phiTraTre = 0;

    const tienPhaiTra = Math.max(0, tongDonThue - (Number(form.tienCoc) || 0));

    return { row, tongDonThue, phiTraTre, tienPhaiTra };
  }, [items, form.tienCoc]);

  // Tự động tiền cọc theo hình thức (nhưng vẫn cho chỉnh sửa với tiền mặt/chuyển khoản)
  useEffect(() => {
    if (form.hinhThucCoc === "GIAY_TO") {
      if (form.tienCoc !== 0 || tienCocTouched) {
        setForm((prev) => ({ ...prev, tienCoc: 0 }));
        setTienCocTouched(false);
      }
      return;
    }

    // TIỀN: mặc định 30% tổng đơn, nhưng nếu user đã chỉnh thì giữ nguyên
    if (!tienCocTouched) {
      const auto = Math.round(derived.tongDonThue * 0.3);
      if (form.tienCoc !== auto) setForm((prev) => ({ ...prev, tienCoc: auto }));
    }
  }, [form.hinhThucCoc, derived.tongDonThue, form.tienCoc, tienCocTouched]);

  const filteredCustomers = useMemo(() => {
    const kw = customerKeyword.trim().toLowerCase();
    if (!kw) return customers;
    return customers.filter((c) => {
      const full = `${c.tenKH} ${c.soDienThoai} ${c.maKH}`.toLowerCase();
      return full.includes(kw);
    });
  }, [customerKeyword, customers]);

  const [allCostumes, setAllCostumes] = useState<SupabaseCostume[]>([]);
  const [mockCostumes, setMockCostumes] = useState<LocalCostume[]>([]);

  useEffect(() => {
    costumeStore.list().then(list => {
      setAllCostumes(list);
      const available = list.filter((c) => String(c.trangThai).trim().toLowerCase() === 'sẵn sàng');
      console.log('mapped list:', list.map(c => ({tenTP: c.tenTP, trangThai: c.trangThai})));
      console.log('available costumes:', available.length);
      setMockCostumes(
        available.map(c => ({ id: c.maTP, tenTP: c.tenTP, size: c.size, donGia: c.giaThue }))
      );
    }).catch(console.error);
  }, [isCostumeModalOpenFor]);

  useEffect(() => {
    if (!resolvedInitialData || allCostumes.length === 0) return;
    const names = resolvedInitialData.item
      .split(', ')
      .map((n: string) => n.trim())
      .filter(Boolean);
    setItems(names.map((name: string) => {
      const costume = allCostumes.find((c) => c.tenTP === name);
      return {
        id: String(Date.now() + Math.random()),
        costumeId: costume?.maTP,
        tenTP: name,
        size: costume?.size || "",
        donGia: costume?.giaThue || 0,
        ngayThue: resolvedInitialData.rentedAt,
        ngayTra: resolvedInitialData.dueDate,
      };
    }));
  }, [resolvedInitialData, allCostumes]);

  const filteredCostumes = useMemo(() => {
    const kw = costumeKeyword.trim().toLowerCase();
    if (!kw) return mockCostumes;
    return mockCostumes.filter((c) => {
      const full = `${c.tenTP} ${c.size} ${c.id}`.toLowerCase();
      return full.includes(kw);
    });
  }, [costumeKeyword, mockCostumes]);

  const addItem = () => {
    const id = String(Date.now());
    setItems((prev) => [
      ...prev,
      {
        id,
        costumeId: undefined,
        tenTP: "",
        size: "",
        donGia: 0,
        ngayThue: minDateStr,
        ngayTra: minDateStr,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, patch: Partial<RentItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next = { ...i, ...patch };

        // Ràng buộc ngày thuê >= hôm nay; ngày trả >= ngày thuê
        next.ngayThue = clampMinDDMMYYYY(next.ngayThue, minDateStr);
        const thue = parseDDMMYYYY(next.ngayThue);
        const tra = parseDDMMYYYY(next.ngayTra);
        if (thue && tra && tra.getTime() < thue.getTime()) next.ngayTra = next.ngayThue;

        return next;
      })
    );
  };

  const openCostumeModal = (itemId: string) => {
    setCostumeKeyword("");
    setIsCostumeModalOpenFor(itemId);
  };

  const selectCostumeForItem = (itemId: string, costume: LocalCostume) => {
    // Kiểm tra trang phục đã được chọn ở item khác chưa
    const alreadySelected = items.some(i => i.id !== itemId && i.costumeId === costume.id);
    if (alreadySelected) return; // bỏ qua nếu trùng
    updateItem(itemId, {
      costumeId: costume.id,
      tenTP: costume.tenTP,
      size: costume.size,
      donGia: costume.donGia,
    });
    setIsCostumeModalOpenFor(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!form.khachHang) {
      setIsError(true);
      setMessage("Chưa chọn khách hàng thuê");
      return;
    }

    if (items.length === 0) {
      setIsError(true);
      setMessage("Chưa chọn trang phục");
      return;
    }

    const invalidItem = items.find((it) => !it.tenTP.trim() || !it.size.trim() || !it.ngayThue || !it.ngayTra);
    if (invalidItem) {
      setIsError(true);
      setMessage("Vui lòng chọn trang phục và nhập ngày thuê/ngày trả cho từng sản phẩm");
      return;
    }

    if (form.hinhThucCoc === "GIAY_TO" && !form.ghiChuGiayTo.trim()) {
      setIsError(true);
      setMessage("Vui lòng nhập ghi chú giấy tờ");
      return;
    }

    if (isEditMode) {
      try {
        const detailItems = items.every((it) => !!it.costumeId)
          ? items.map((it) => ({ matp: it.costumeId!, ngaythue: it.ngayThue, ngaytradukien: it.ngayTra }))
          : undefined;

        await orderStore.update(form.maDon, {
          customer: form.khachHang!.tenKH,
          phone: form.khachHang!.soDienThoai,
          item: items.map((it) => it.tenTP).join(', '),
          rentedAt: items[0]?.ngayThue || '',
          dueDate: items[items.length - 1]?.ngayTra || '',
          deposit: `${form.tienCoc.toLocaleString('vi-VN')}đ`,
          total: `${derived.tongDonThue.toLocaleString('vi-VN')}đ`,
          status: form.trangThai as OrderStatus,
          hinhThucCoc: form.hinhThucCoc === 'GIAY_TO' ? 'Giấy tờ tùy thân' : 'Tiền mặt/chuyển khoản',
          ghiChuGiayTo: form.ghiChuGiayTo,
          detailItems,
        });
        setMessage("Cập nhật đơn thành công!");
        onSuccess?.();
        return;
      } catch (err: any) {
        console.error(err);
        setIsError(true);
        setMessage(err?.message || "Cập nhật đơn thất bại");
        return;
      }
    }

    try {
      const detailItems = items.every((it) => !!it.costumeId)
        ? items.map((it) => ({ matp: it.costumeId!, ngaythue: it.ngayThue, ngaytradukien: it.ngayTra }))
        : undefined;

      await orderStore.create({
        invoiceNo: form.maDon,
        customer: form.khachHang!.tenKH,
        phone: form.khachHang!.soDienThoai,
        item: items.map((it) => it.tenTP).join(', '),
        rentedAt: items[0]?.ngayThue || '',
        dueDate: items[items.length - 1]?.ngayTra || '',
        status: 'Chưa cọc đơn',
        deposit: `${form.tienCoc.toLocaleString('vi-VN')}đ`,
        total: `${derived.tongDonThue.toLocaleString('vi-VN')}đ`,
        hinhThucCoc: form.hinhThucCoc === 'GIAY_TO' ? 'Giấy tờ tùy thân' : 'Tiền mặt/chuyển khoản',
        ghiChuGiayTo: form.ghiChuGiayTo,
        detailItems,
      } as any);
      setMessage("Tạo đơn thành công!");
      onSuccess?.();
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div style={onClose ? modalOverlayStyle : containerStyle} onClick={onClose ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}>
      <div style={onClose ? { ...cardStyleWide, maxHeight: "90vh", overflowY: "auto" } : cardStyleWide}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={titleStyle}>{isEditMode ? "Chỉnh sửa đơn thuê" : "Tạo đơn thuê trang phục"}</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isEditMode && (
              <button
                type="button"
                style={linkButtonStyle}
                onClick={() => {
                  setCustomerKeyword("");
                  setCustomerCreateMessage("");
                  setCustomerCreateIsError(false);
                  setCustomerCreateLoading(false);
                  customerStore.nextCode().then(code => {
                    setNewCustomer({ maKH: code, tenKH: "", soDienThoai: "", diaChi: "" });
                  });
                  setCustomerMode("CREATE");
                  setIsCustomerModalOpen(true);
                }}
              >
                + Thêm khách hàng
              </button>
            )}
            {onClose && null}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Hình thức cọc */}
          <div style={groupStyle}>
            <label style={labelStyle}>Hình thức cọc</label>
            <div style={{ marginTop: 6, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  value="GIAY_TO"
                  checked={form.hinhThucCoc === "GIAY_TO"}
                  disabled={isLocked}
                  onChange={() => !isLocked && setForm((p) => ({ ...p, hinhThucCoc: "GIAY_TO" }))}
                />
                Giấy tờ tùy thân
              </label>
              <label style={radioLabelStyle}>
                <input
                  type="radio"
                  value="TIEN_MAT_CHUYEN_KHOAN"
                  checked={form.hinhThucCoc === "TIEN_MAT_CHUYEN_KHOAN"}
                  disabled={isLocked}
                  onChange={() => !isLocked && setForm((p) => ({ ...p, hinhThucCoc: "TIEN_MAT_CHUYEN_KHOAN" }))}
                />
                Tiền mặt/chuyển khoản
              </label>
            </div>
          </div>

          {/* 2. Mã đơn hàng* */}
          <div style={groupStyle}>
            <label style={labelStyle}>Mã đơn hàng *</label>
            <input value={form.maDon} disabled style={inputStyle} />
          </div>

          {/* 3. Khách hàng thuê* */}
          <div style={groupStyle}>
            <label style={labelStyle}>Khách hàng thuê *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
              <div>
                <input
                  value={form.khachHang ? `${form.khachHang.tenKH} – ${form.khachHang.soDienThoai}` : ""}
                  placeholder="Chọn khách hàng"
                  readOnly
                  style={inputStyle}
                />
              </div>
              <button type="button" onClick={() => !isLocked && setIsCustomerModalOpen(true)} disabled={isLocked} style={{ ...secondaryButtonStyle, ...(isLocked ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}>
                Chọn
              </button>
            </div>
          </div>

          {/* 4. Trang phục* */}
          <div style={groupStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <label style={labelStyle}>Trang phục *</label>
              <button type="button" onClick={() => !isLocked && addItem()} disabled={isLocked} style={{ ...secondaryButtonStyle, ...(isLocked ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}>
                + Thêm trang phục
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div style={emptyStyle}>Thêm trang phục</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((item) => {
                const row = derived.row.find((r) => r.id === item.id);
                return (
                  <div key={item.id} style={itemCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>Sản phẩm</div>
                      <button type="button" onClick={() => !isLocked && removeItem(item.id)} disabled={isLocked} style={{ ...dangerTextButtonStyle, ...(isLocked ? { opacity: 0.3, cursor: 'not-allowed' } : {}) }}>
                        Xóa
                      </button>
                    </div>

                    <div style={grid2Style}>
                      <div>
                        <label style={labelStyleSmall}>Trang phục *</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                          <input
                            value={item.tenTP ? `${item.tenTP} - ${item.size}` : ""}
                            placeholder="Tên trang phục – Size"
                            readOnly
                            style={inputStyle}
                          />
                          <button type="button" onClick={() => !isLocked && openCostumeModal(item.id)} disabled={isLocked} style={{ ...secondaryButtonStyle, ...(isLocked ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}>
                            Chọn
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyleSmall}>Đơn giá</label>
                        <input value={item.donGia} disabled style={inputStyle} />
                      </div>
                    </div>

                    <div style={grid3Style}>
                      <div>
                        <label style={labelStyleSmall}>Ngày thuê *</label>
                        <DateField
                          value={item.ngayThue}
                          minISO={minDateISO}
                          onChange={(next) => updateItem(item.id, { ngayThue: next })}
                        />
                      </div>
                      <div>
                        <label style={labelStyleSmall}>Ngày trả</label>
                        <DateField
                          value={item.ngayTra}
                          minISO={ddmmyyyyToISO(item.ngayThue) || minDateISO}
                          onChange={(next) => updateItem(item.id, { ngayTra: next })}
                        />
                      </div>
                      <div>
                        <label style={labelStyleSmall}>Thành tiền</label>
                        <input value={row?.thanhTien ?? 0} disabled style={inputStyle} />
                      </div>
                    </div>

                    <div style={hintStyle}>
                      Số ngày thuê: <b>{row?.days ?? 0}</b> (nếu ngày thuê = ngày trả thì tính 1 ngày)
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 9. Phí trả trễ */}
          <div style={groupStyle}>
            <label style={labelStyle}>Phí trả trễ</label>
            <input value={derived.phiTraTre} disabled style={inputStyle} />
          </div>

          {/* 10. Tổng đơn thuê* */}
          <div style={groupStyle}>
            <label style={labelStyle}>Tổng đơn thuê *</label>
            <input value={derived.tongDonThue} disabled style={inputStyle} />
          </div>

          {/* 6. Tiền cọc* */}
          <div style={groupStyle}>
            <label style={labelStyle}>Tiền cọc *</label>
            <input
              type="text"
              value={form.tienCoc === 0 ? '' : form.tienCoc}
              disabled={form.hinhThucCoc === "GIAY_TO" || isLocked}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setTienCocTouched(true);
                  setForm((p) => ({ ...p, tienCoc: val === '' ? 0 : Number(val) }));
                }
              }}
              placeholder="0"
              style={{ ...inputStyle, ...((form.hinhThucCoc === "GIAY_TO" || isLocked) ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}) }}
            />
          </div>

          {/* 11. Tiền phải trả */}
          <div style={groupStyle}>
            <label style={labelStyle}>Tiền phải trả</label>
            <input value={derived.tienPhaiTra} disabled style={inputStyle} />
          </div>

          {/* 12. Trạng thái đơn */}
          <div style={groupStyle}>
            <label style={labelStyle}>Trạng thái đơn</label>
            <input
              value={form.trangThai}
              disabled={true}
              style={{ ...inputStyle, backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
          </div>

          {/* 13. Ghi chú giấy tờ */}
          <div style={groupStyle}>
            <label style={labelStyle}>Ghi chú giấy tờ</label>
            <input
              placeholder='Ví dụ: "CCCD số 123456"'
              disabled={form.hinhThucCoc !== "GIAY_TO" || isLocked}
              value={form.ghiChuGiayTo}
              onChange={(e) => setForm((p) => ({ ...p, ghiChuGiayTo: e.target.value }))}
              style={{ ...inputStyle, ...((form.hinhThucCoc !== "GIAY_TO" || isLocked) ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : {}) }}
            />
          </div>

          {isLocked && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fcd34d', fontSize: 13, color: '#92400e', marginBottom: 8 }}>
              Đơn thuê ở trạng thái <b>{resolvedInitialData?.status}</b> — không thể chỉnh sửa.
            </div>
          )}

          {onClose && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{ ...primaryButtonStyle, flex: 1, background: '#f1f5f9', color: '#64748b' }}
              >
                Hủy
              </button>
              <button type="submit" style={{
                ...primaryButtonStyle,
                flex: 1,
                opacity: (!isLocked && form.khachHang && items.length > 0) ? 1 : 0.45,
                cursor: (!isLocked && form.khachHang && items.length > 0) ? 'pointer' : 'not-allowed',
              }} disabled={isLocked || !form.khachHang || items.length === 0}>
                {isEditMode ? "Lưu thay đổi" : "Tạo đơn"}
              </button>
            </div>
          )}

          {!onClose && (
            <button type="submit" style={{
              ...primaryButtonStyle,
              opacity: (!isLocked && form.khachHang && items.length > 0) ? 1 : 0.45,
              cursor: (!isLocked && form.khachHang && items.length > 0) ? 'pointer' : 'not-allowed',
            }} disabled={isLocked || !form.khachHang || items.length === 0}>
              {isEditMode ? "Lưu thay đổi" : "Tạo đơn"}
            </button>
          )}

          {message && <p style={{ ...messageStyle, color: isError ? "#EF4444" : "#22C55E" }}>{message}</p>}
        </form>
      </div>

      {/* MODAL: chọn khách hàng */}
      {isCustomerModalOpen && (
        <div
          style={modalOverlayStyle}
          onMouseDown={() => {
            setIsCustomerModalOpen(false);
            setCustomerMode("SELECT");
          }}
        >
          <div style={modalCardStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 24 }}>{customerMode === "SELECT" ? "Chọn khách hàng" : "Thêm khách hàng"}</div>
              </div>
            </div>

            {customerMode === "SELECT" ? (
              <>
                <input
                  placeholder="Tìm theo mã khách hàng, tên khách hàng, số điện thoại"
                  value={customerKeyword}
                  onChange={(e) => setCustomerKeyword(e.target.value)}
                  style={{ ...inputStyle, marginTop: 10 }}
                />
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 320,
                    overflow: "auto",
                  }}
                >
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.maKH}
                      type="button"
                      style={listRowButtonStyle}
                      onClick={() => {
                        setForm((p) => ({ ...p, khachHang: c }));
                        setIsCustomerModalOpen(false);
                      }}
                    >
                      <b>{c.tenKH}</b> – {c.soDienThoai} <span style={{ color: "#64748b" }}>({c.maKH})</span>
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && <div style={emptyStyle}>Không tìm thấy khách hàng.</div>}
                </div>
              </>
            ) : (
              <>
                <div style={{ marginTop: 10 }}>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Mã khách hàng</label>
                    <input value={newCustomer.maKH} disabled style={inputStyle} />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>Tên khách hàng *</label>
                    <input
                      value={newCustomer.tenKH}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/[^a-zA-ZÀ-ỹ\s]/.test(val)) return;
                        setNewCustomer((p) => ({ ...p, tenKH: val }));
                      }}
                      placeholder="Nhập tên"
                      style={inputStyle}
                    />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>Số điện thoại *</label>
                    <input
                      value={newCustomer.soDienThoai}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/[^0-9]/.test(val)) return;
                        setNewCustomer((p) => ({ ...p, soDienThoai: val }));
                      }}
                      placeholder="Nhập số điện thoại"
                      style={inputStyle}
                    />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>Địa chỉ</label>
                    <input
                      value={newCustomer.diaChi}
                      onChange={(e) => setNewCustomer((p) => ({ ...p, diaChi: e.target.value }))}
                      placeholder="Nhập địa chỉ"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    <button
                      type="button"
                      style={{ ...secondaryButtonStyle, flex: 1 }}
                      onClick={() => {
                        setIsCustomerModalOpen(false);
                        setCustomerMode("SELECT");
                        setCustomerCreateMessage("");
                        setCustomerCreateIsError(false);
                        setCustomerCreateLoading(false);
                      }}
                    >
                      Đóng
                    </button>

                    <button
                      type="button"
                      disabled={customerCreateLoading}
                      style={{ ...primaryButtonStyle, flex: 1, marginTop: 0, opacity: customerCreateLoading ? 0.7 : 1 }}
                      onClick={() => {
                        setCustomerCreateMessage("");
                        setCustomerCreateIsError(false);

                        const tenKH = newCustomer.tenKH.trim();
                        const soDienThoai = newCustomer.soDienThoai.trim();

                        if (!tenKH) {
                          setCustomerCreateIsError(true);
                          setCustomerCreateMessage("Tên khách hàng không được để trống");
                          return;
                        }

                        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(tenKH)) {
                          setCustomerCreateIsError(true);
                          setCustomerCreateMessage("Tên không được chứa số hoặc ký tự đặc biệt");
                          return;
                        }

                        if (!/^[0-9]{10}$/.test(soDienThoai)) {
                          setCustomerCreateIsError(true);
                          setCustomerCreateMessage("SĐT phải đủ 10 số và không chứa chữ hoặc ký tự đặc biệt");
                          return;
                        }

                        const isDuplicate = customers.some(c => c.soDienThoai === soDienThoai);
                        if (isDuplicate) {
                          setCustomerCreateIsError(true);
                          setCustomerCreateMessage("Số điện thoại đã tồn tại trong hệ thống");
                          return;
                        }

                        setCustomerCreateLoading(true);
                        customerStore.nextCode().then(async (code) => {
                          const created: Customer = { maKH: newCustomer.maKH || code, tenKH, soDienThoai };
                          await customerStore.create({ maKH: created.maKH, tenKH: created.tenKH, soDienThoai: created.soDienThoai, diaChi: '' });
                          setCustomers((prev) => [created, ...prev]);
                          setForm((p) => ({ ...p, khachHang: created }));
                          setCustomerCreateLoading(false);
                          setIsCustomerModalOpen(false);
                          setCustomerMode("SELECT");
                          setCustomerCreateMessage("");
                          setCustomerCreateIsError(false);
                        });
                      }}
                    >
                      {customerCreateLoading ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>

                  {customerCreateMessage && (
                    <p style={{ ...messageStyle, color: customerCreateIsError ? "#EF4444" : "#22C55E" }}>
                      {customerCreateMessage}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: chọn trang phục */}
      {isCostumeModalOpenFor && (
        <div style={modalOverlayStyle} onMouseDown={() => setIsCostumeModalOpenFor(null)}>
          <div style={modalCardStyle} onMouseDown={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 700 }}>Chọn trang phục</div>
              <button type="button" style={dangerTextButtonStyle} onClick={() => setIsCostumeModalOpenFor(null)}>
                Đóng
              </button>
            </div>
            <input
              placeholder="Tìm theo tên/size/mã..."
              value={costumeKeyword}
              onChange={(e) => setCostumeKeyword(e.target.value)}
              style={{ ...inputStyle, marginTop: 10 }}
            />
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflow: "auto" }}>
              {filteredCostumes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={items.some(i => i.id !== isCostumeModalOpenFor && i.costumeId === c.id)}
                  style={{ ...listRowButtonStyle, ...(items.some(i => i.id !== isCostumeModalOpenFor && i.costumeId === c.id) ? { opacity: 0.4, cursor: 'not-allowed', background: '#f8fafc' } : {}) }}
                  onClick={() => selectCostumeForItem(isCostumeModalOpenFor, c)}
                >
                  <b>{c.tenTP}</b> - {c.size} • {c.donGia.toLocaleString("vi-VN")}đ{" "}
                  <span style={{ color: "#64748b" }}>({c.id})</span>
                </button>
              ))}
              {filteredCostumes.length === 0 && <div style={emptyStyle}>Không tìm thấy trang phục.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== STYLE GIỐNG FORM KH ===== */

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F1F5F9",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: 40,
};

const cardStyleWide: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
};

const groupStyle: React.CSSProperties = {
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: "#334155",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 36,
  border: "1px solid #E2E8F0",
  borderRadius: 8,
  padding: "0 10px",
  marginTop: 4,
  outline: "none",
  fontSize: 14,
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 500,
  cursor: "pointer",
  marginTop: 8,
};

const messageStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
};

const hintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#64748b",
};

const labelStyleSmall: React.CSSProperties = {
  ...labelStyle,
  fontSize: 12,
};

const radioLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#0f172a",
  fontSize: 14,
};

const secondaryButtonStyle: React.CSSProperties = {
  height: 36,
  padding: "0 12px",
  background: "#EEF2FF",
  color: "#1d4ed8",
  border: "1px solid #c7d2fe",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};

const linkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 36,
  padding: "0 12px",
  borderRadius: 10,
  background: "#2563EB",
  border: "none",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const itemCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

const grid2Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 220px",
  gap: 12,
  marginTop: 10,
};

const grid3Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 220px",
  gap: 12,
  marginTop: 10,
};

const emptyStyle: React.CSSProperties = {
  background: "#F8FAFC",
  border: "1px dashed #CBD5E1",
  borderRadius: 12,
  padding: 12,
  color: "#475569",
  fontSize: 13,
};

const dangerTextButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#ef4444",
  cursor: "pointer",
  fontWeight: 700,
  padding: 0,
};


const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};

const modalCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "#fff",
  borderRadius: 14,
  padding: 14,
  boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
};

const listRowButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  border: "1px solid #e2e8f0",
  background: "#fff",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
  fontSize: 14,
  color: "#0f172a",
};

const calendarButtonStyle: React.CSSProperties = {
  height: 36,
  width: 42,
  borderRadius: 10,
  border: "1px solid #E2E8F0",
  background: "#fff",
  cursor: "pointer",
  fontSize: 16,
};

const calendarPopoverStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  zIndex: 20,
  width: 280,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 12,
  boxShadow: "0 18px 48px rgba(0,0,0,0.12)",
};

const calendarNavButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: "34px",
  textAlign: "center",
  color: "#0f172a",
  fontWeight: 700,
};

const calendarDayStyle: React.CSSProperties = {
  height: 34,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  color: "#0f172a",
  fontWeight: 600,
};

const calendarTodayStyle: React.CSSProperties = {
  borderColor: "#93c5fd",
  background: "#EFF6FF",
};

const calendarSelectedStyle: React.CSSProperties = {
  borderColor: "#2563eb",
  background: "#2563eb",
  color: "#fff",
};

const calendarDisabledStyle: React.CSSProperties = {
  opacity: 0.45,
  cursor: "not-allowed",
};

const calendarFooterButtonStyle: React.CSSProperties = {
  height: 34,
  padding: "0 10px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  color: "#0f172a",
};