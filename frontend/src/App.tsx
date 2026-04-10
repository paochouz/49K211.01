import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerCreatePage from "./pages/CustomerCreatePage";
import CostumeCreatePage from "./pages/CostumeCreatePage";
import CostumeListPage from "./pages/CostumeListPage";
import UpdateTrangPhuc from "./pages/UpdateTrangphuc";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/customers/create" element={<CustomerCreatePage />} />
        <Route path="/costumes/create" element={<CostumeCreatePage />} />
        <Route path="/costumes" element={<CostumeListPage />} />
        <Route path="/costumes/:id/edit" element={<UpdateTrangPhuc />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;