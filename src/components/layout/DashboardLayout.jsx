import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import EmailVerificationBanner from '../ui/EmailVerificationBanner';
import { useUIStore } from '../../store/uiStore';

// Reactive hook — re-renders when window crosses the md breakpoint
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
};

const DashboardLayout = () => {
  const { sidebarCollapsed } = useUIStore();
  const isDesktop = useIsDesktop();

  // Only push content right on desktop where sidebar is visible in the flow
  const marginLeft = isDesktop ? (sidebarCollapsed ? '72px' : '260px') : '0px';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-100">
      <Sidebar />

      <div
        className="flex flex-col flex-1 overflow-hidden transition-[margin-left] duration-300"
        style={{ marginLeft }}
      >
        <Header />
        <EmailVerificationBanner />
        {/* pb-20 on mobile so content clears the bottom nav bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-screen-2xl mx-auto animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav — only visible on mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
