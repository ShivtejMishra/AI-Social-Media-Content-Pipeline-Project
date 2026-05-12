import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Sparkles, Library, Calendar } from 'lucide-react';

// 5 most-used pages as quick tabs on mobile
const tabs = [
  { to: '/app/dashboard',  icon: LayoutDashboard, label: 'Home' },
  { to: '/app/workspaces', icon: FolderKanban,    label: 'Workspaces' },
  { to: '/app/generate',   icon: Sparkles,         label: 'Generate' },
  { to: '/app/content',    icon: Library,          label: 'Library' },
  { to: '/app/calendar',   icon: Calendar,         label: 'Calendar' },
];

const MobileBottomNav = () => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-stretch safe-bottom">
    {tabs.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/app/dashboard'}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-500'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-indigo-500/10' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default MobileBottomNav;
