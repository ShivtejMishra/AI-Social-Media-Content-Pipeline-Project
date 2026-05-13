import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, LogOut } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import UserAvatar from '../ui/UserAvatar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/workspaces': 'Workspaces',
  '/workspaces/new': 'Create Workspace',
  '/generate': 'Generate Content',
  '/generate/image': 'Generate Image',
  '/content': 'Content Library',
  '/calendar': 'Content Calendar',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, setMobileMenuOpen } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/workspaces/')) return 'Workspace Details';
    if (path.startsWith('/content/')) return 'Content Editor';
    return 'SocialX Studio';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white font-display">{getPageTitle()}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Plan Badge — desktop only */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          {user?.plan?.toUpperCase() || 'FREE'}
        </span>

        {/* User Avatar — desktop: click → settings */}
        <div onClick={() => navigate('/app/settings')} className="hidden md:block cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all rounded-full">
          <UserAvatar user={user} size="sm" />
        </div>

        {/* Logout — mobile only */}
        <button
          onClick={handleLogout}
          className="md:hidden p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-all duration-200"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
