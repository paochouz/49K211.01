import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from './Menu';
import AddDonThue from './AddDonThue';
import { orderStore } from '../mock/mockStore';

type OrderStatus = 'Chưa cọc đơn' | 'Đang thuê' | 'Đã trả' | 'Trễ hạn';

export type OrderItem = {
  id: string;
  invoiceNo: string;
  customer: string;
  item: string;
  phone: string;
  rentedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: OrderStatus;
  deposit: string;
  total: string;
};

type StatusBadgeProps = {
  status: OrderStatus;
};

export default function RentalOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderItem | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = orderStore.list();
      setOrders(data);
      setFilteredOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const [filteredOrders, setFilteredOrders] = useState<OrderItem[]>([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const showPopup = (message: string) => {
    setPopupMessage(message);
    setIsPopupOpen(true);
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      unpaidDeposit: orders.filter((o) => o.status === 'Chưa cọc đơn').length,
      renting: orders.filter((o) => o.status === 'Đang thuê').length,
      returned: orders.filter((o) => o.status === 'Đã trả').length,
      overdue: orders.filter((o) => o.status === 'Trễ hạn').length,
    };
  }, [orders]);

  const validateCustomer = (value: string) => {
    if (!value.trim()) return true;
    return /^[A-Za-zÀ-ỹ\s]+$/.test(value);
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) return true;
    return /^\d{10}$/.test(value);
  };

  const handleFilter = () => {

    if (!validateCustomer(customerFilter)) {
      showPopup('Tên khách hàng không được chứa ký tự đặc biệt.');
      return;
    }

    if (!validatePhone(phoneFilter)) {
      showPopup('Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }

    const result = orders.filter((order) => {
      const matchStatus = statusFilter ? order.status === statusFilter : true;
      const matchCustomer = customerFilter
        ? order.customer.toLowerCase().includes(customerFilter.trim().toLowerCase())
        : true;
      const matchPhone = phoneFilter ? order.phone.includes(phoneFilter.trim()) : true;

      return matchStatus && matchCustomer && matchPhone;
    });

    if (result.length === 0) {
      setFilteredOrders([]);
      showPopup('Không tồn tại hóa đơn.');
      return;
    }

    setFilteredOrders(result);
  };

  const handleResetFilter = () => {
    setStatusFilter('');
    setCustomerFilter('');
    setPhoneFilter('');
    setFilteredOrders(orders);
  };

  const handleDeposit = (invoiceNo: string) => {
    orderStore.updateStatus(invoiceNo, 'Đang thuê');
    const updated = orderStore.list();
    setOrders(updated);
    setFilteredOrders(updated);
    showPopup(`Hóa đơn ${invoiceNo} đã chuyển sang trạng thái "Đang thuê".`);
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '220px',
          height: '100vh',
        }}
      >
        <Menu />
      </aside>

      <main className="ml-[220px] p-6 space-y-6">
        <section className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Xem hóa đơn</h1>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            + Tạo đơn thuê
          </button>
        </section>

        <section className="grid gap-4 grid-cols-2 xl:grid-cols-5">
          <StatCard label="Tổng hóa đơn" value={stats.total} />
          <StatCard label="Chưa cọc đơn" value={stats.unpaidDeposit} />
          <StatCard label="Đang thuê" value={stats.renting} />
          <StatCard label="Đã trả" value={stats.returned} />
          <StatCard label="Trễ hạn" value={stats.overdue} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-base font-semibold">Lọc hóa đơn</h2>

          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Chọn trạng thái</option>
              <option value="Chưa cọc đơn">Chưa cọc đơn</option>
              <option value="Đang thuê">Đang thuê</option>
              <option value="Đã trả">Đã trả</option>
              <option value="Trễ hạn">Trễ hạn</option>
            </select>

            <input
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              placeholder="Tên khách hàng"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            />

            <input
              value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value.replace(/\D/g, ''))}
              placeholder="Số điện thoại"
              maxLength={10}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleFilter}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                Lọc
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-base font-semibold">Danh sách hóa đơn</h2>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : filteredOrders.map((order) => (
              <div
                key={order.invoiceNo}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <div className="text-base font-semibold text-slate-900">
                    {order.invoiceNo} - {order.customer} - {order.dueDate} -
                    <span className="ml-2">
                      <StatusBadge status={order.status} />
                    </span>
                  </div>

                  <div className="text-sm text-slate-500">Trang phục: {order.item}</div>
                  <div className="text-sm text-slate-500">
                    SĐT: {order.phone} | Ngày thuê: {order.rentedAt}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={order.status !== 'Chưa cọc đơn'}
                    onClick={() => handleDeposit(order.invoiceNo)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium ${
                      order.status === 'Chưa cọc đơn'
                        ? 'bg-blue-100 text-blue-700'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    }`}
                  >
                    Đã cọc
                  </button>
                  <button
                    type="button"
                    disabled={order.status !== 'Đang thuê' && order.status !== 'Trễ hạn'}
                    onClick={() => navigate(`/costume-returns/${order.invoiceNo}`)}
                    className={`rounded-xl px-3 py-2 text-xs font-medium ${
                      order.status === 'Đang thuê' || order.status === 'Trễ hạn'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    }`}
                  >
                    Trả đồ
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(order)}
                    className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-medium text-amber-700"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}

            {!loading && filteredOrders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Không có hóa đơn phù hợp.
              </div>
            )}
          </div>
        </section>
      </main>
      
      {isAddModalOpen && (
        <AddDonThue onClose={() => setIsAddModalOpen(false)} onSuccess={() => { fetchOrders(); setIsAddModalOpen(false); }} />
      )}

      {editingOrder && (
        <AddDonThue
          onClose={() => setEditingOrder(null)}
          initialData={editingOrder}
        />
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Thông báo</h3>

            <p className="mt-3 text-sm text-slate-600">
              {popupMessage}
            </p>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: StatusBadgeProps) {
  const stylesMap: Record<OrderStatus, string> = {
    'Chưa cọc đơn': 'bg-blue-100 text-blue-700',
    'Đang thuê': 'bg-amber-100 text-amber-700',
    'Đã trả': 'bg-emerald-100 text-emerald-700',
    'Trễ hạn': 'bg-rose-100 text-rose-700',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stylesMap[status]}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}