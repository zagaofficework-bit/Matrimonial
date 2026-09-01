import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AdminLayout.css';
import '../../../styles/admin-panel.css';

export default function AdminLayout() {
  return (
    <div className="admin-app admin-layout">
      <Sidebar />
      <div className="admin-layout-main">
        <Topbar />
        <main className="admin-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
