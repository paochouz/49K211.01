import { BrowserRouter, Routes, Route } from "react-router-dom";
import ManageCustomersPage from "./pages/ManageCustomersPage";
import AddKhachHang from "./pages/AddKhachHang";
import CustomerCreatePage from "./pages/CustomerCreatePage";
import CostumeCreatePage from "./pages/CostumeCreatePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/customers/manage" element={<ManageCustomersPage />} />
        <Route path="/customers/add" element={<AddKhachHang />} />
        <Route path="/customers/create" element={<CustomerCreatePage />} />
        <Route path="/costumes/create" element={<CostumeCreatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;