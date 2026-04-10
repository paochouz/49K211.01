import Menu from "./Menu"; 
import Home from "./Home"; 

export default function DashboardContainer() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh' }}>
        <Menu />
      </aside>
      <main style={{ marginLeft: '220px', height: '100vh', overflowY: 'auto' }}>
        <Home /> 
      </main>
    </div>
  );
}