import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="STUDENT" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="layout-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
