import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toast from '../ui/Toast';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 px-[30px] py-[22px]">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
