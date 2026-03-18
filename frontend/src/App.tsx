import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerCreatePage from "./pages/CustomerCreatePage";
import CostumeCreatePage from "./pages/CostumeCreatePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/customers/create" element={<CustomerCreatePage />} />
        <Route path="/costumes/create" element={<CostumeCreatePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;