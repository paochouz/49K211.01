
import Menu from "./Menu"; 
import Home from "./Home"; 

export default function DashboardContainer() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f9fafb' }}>
      {/* PHẦN 1: BÊN TRÁI - THANH MENU */}
      <aside style={{ width: '280px', height: '100%', backgroundColor: '#fff', borderRight: '1px solid #f1f5f9' }}>
        <Menu />
      </aside>

      {/* PHẦN 2: BÊN PHẢI - NỘI DUNG CHÍNH (Trang Tổng Quan) */}
      <main style={{ flex: 1, padding: '0', height: '100%', overflowY: 'auto' }}>
        <Home /> 
      </main>
    </div>
  );
}