import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Sparkles, Image, Library,
  Calendar, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Zap, X,
} from 'lucide-react';

// Youtube brand icon (not in lucide-react)
const YoutubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { authApi } from '../../services/authApi';
import { queryClient } from '../../app/providers';
import { toast } from 'sonner';
import UserAvatar from '../ui/UserAvatar';
import WorkspaceLogo from '../ui/WorkspaceLogo';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/workspaces', icon: FolderKanban, label: 'Workspaces', id: 'tour-workspaces' },
  { divider: true, label: 'Create' },
  { to: '/app/generate', icon: Sparkles, label: 'Generate Content', id: 'tour-generate' },
  { to: '/app/generate/image', icon: Image, label: 'Generate Image' },
  { to: '/app/generate/thumbnail', icon: YoutubeIcon, label: 'YT Thumbnail', badge: 'BETA' },
  { divider: true, label: 'Manage' },
  { to: '/app/content', icon: Library, label: 'Content Library' },
  { to: '/app/calendar', icon: Calendar, label: 'Calendar', id: 'tour-calendar' },
  { divider: true, label: 'Insights' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics', id: 'tour-analytics' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { selectedWorkspace, clearWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    // Clear all cached queries so next user doesn't see previous user's data
    queryClient.clear();
    clearWorkspace();
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const collapsed = sidebarCollapsed;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed left-0 top-0 bottom-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 z-50
          md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: collapsed ? '72px' : '260px' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm font-display">SocialX</span>
              <span className="text-indigo-400 font-bold text-sm"> Studio</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
        )}
        {!collapsed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden md:block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Workspace Badge */}
      {!collapsed && selectedWorkspace && (
      <div className="mx-3 my-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
          <WorkspaceLogo workspace={selectedWorkspace} size="xs" />
          <div className="min-w-0">
            <p className="text-xs text-indigo-400 font-medium">Active Workspace</p>
            <p className="text-xs text-slate-900 dark:text-white font-semibold truncate">{selectedWorkspace.brandName}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.divider) {
            return !collapsed ? (
              <div key={index} className="px-4 pt-4 pb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
              </div>
            ) : <div key={index} className="my-2 mx-3 border-t border-slate-200 dark:border-slate-800" />;
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              end={item.to === '/app/dashboard'}
              onClick={() => {
                if (window.innerWidth < 768) setMobileMenuOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 leading-none">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">{user?.plan || 'free'} plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UserAvatar user={user} size="sm" />
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
