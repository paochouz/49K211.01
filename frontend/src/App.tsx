import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DonThue from "./pages/DonThue";
import AddDonThue from "./pages/AddDonThue";
import AddKhachHang from "./pages/AddKhachHang";
import CostumeCreatePage from "./pages/CostumeCreatePage";
import CostumeReturns from "./pages/CostumeReturns";
import Dashboard from "./pages/Dashboard";
import ManageCustomersPage from "./pages/ManageCustomersPage";
import CostumeListPage from "./pages/CostumeListPage";
import PenaltyConfigPage from "./pages/PenaltyConfigPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Routes cho cả nhân viên và chủ */}
        <Route path="/home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/don-thue" element={<ProtectedRoute><DonThue /></ProtectedRoute>} />
        <Route path="/add-don-thue" element={<ProtectedRoute><AddDonThue /></ProtectedRoute>} />
        <Route path="/add-khach-hang" element={<ProtectedRoute><AddKhachHang /></ProtectedRoute>} />
        <Route path="/khach-hang" element={<ProtectedRoute><ManageCustomersPage /></ProtectedRoute>} />
        <Route path="/trang-phuc" element={<ProtectedRoute><CostumeListPage /></ProtectedRoute>} />
        <Route path="/costume-returns/:maDon" element={<ProtectedRoute><CostumeReturns /></ProtectedRoute>} />

        {/* Routes chỉ dành cho chủ cửa hàng */}
        <Route path="/add-costume" element={<ProtectedRoute ownerOnly><CostumeCreatePage /></ProtectedRoute>} />
        <Route path="/cau-hinh-phat" element={<ProtectedRoute ownerOnly><PenaltyConfigPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
