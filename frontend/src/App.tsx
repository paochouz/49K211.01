import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerCreatePage from "./pages/CustomerCreatePage";
import CostumeCreatePage from "./pages/CostumeCreatePage";
import CostumeListPage from "./pages/CostumeListPage";
import AddKhachHang from "./pages/AddKhachHang";
import ManageCustomersPage from "./pages/ManageCustomersPage";

// Import thêm component Xử lý trả đồ
import CostumeReturns from "./pages/CostumeReturns";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/" element={<LoginPage />} />

        {/* Các trang quản lý khách hàng */}
        <Route path="/customers/create" element={<CustomerCreatePage />} />
        <Route path="/add-khachhang" element={<AddKhachHang />} />
        <Route path="/quan-ly-khach-hang" element={<ManageCustomersPage />} />

        {/* Các trang quản lý trang phục */}
        <Route path="/costumes/create" element={<CostumeCreatePage />} />
        <Route path="/costumes" element={<CostumeListPage />} />

        {/* Route mới: Xử lý trả đồ & Quyết toán đơn hàng */}
        <Route path="/tra-do" element={<CostumeReturns />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;