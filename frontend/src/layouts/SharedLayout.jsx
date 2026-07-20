import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const SharedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = typeof user?.role === 'object' ? user.role?.name : user?.role;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="layout-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SharedLayout;
