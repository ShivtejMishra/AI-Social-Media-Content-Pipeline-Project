import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import PageLoader from '../components/loaders/PageLoader';

// Lazy-loaded pages
const PublicLayout = lazy(() => import('../components/layout/PublicLayout'));
const Landing = lazy(() => import('../pages/public/Landing'));
const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const WorkspaceList = lazy(() => import('../pages/workspaces/WorkspaceList'));
const WorkspaceCreate = lazy(() => import('../pages/workspaces/WorkspaceCreate'));
const WorkspaceHub = lazy(() => import('../pages/workspaces/WorkspaceHub'));
const WorkspaceDetail = lazy(() => import('../pages/workspaces/WorkspaceDetail'));
const ContentGenerator = lazy(() => import('../pages/generate/ContentGenerator'));
const ImageGenerator = lazy(() => import('../pages/generate/ImageGenerator'));
const ThumbnailGenerator = lazy(() => import('../pages/generate/ThumbnailGenerator'));
const ContentLibrary = lazy(() => import('../pages/content/ContentLibrary'));
const ContentEditor = lazy(() => import('../pages/content/ContentEditor'));
const CalendarView = lazy(() => import('../pages/calendar/CalendarView'));
const Analytics = lazy(() => import('../pages/analytics/Analytics'));
const Settings = lazy(() => import('../pages/settings/Settings'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  // Public routes (Landing page)
  {
    path: '/',
    element: <SuspenseWrapper><PublicLayout /></SuspenseWrapper>,
    children: [
      { index: true, element: <SuspenseWrapper><Landing /></SuspenseWrapper> },
    ],
  },

  // Auth routes (public without layout)
  { path: '/login',        element: <SuspenseWrapper><Login /></SuspenseWrapper> },
  { path: '/signup',       element: <SuspenseWrapper><Signup /></SuspenseWrapper> },
  { path: '/verify-email', element: <SuspenseWrapper><VerifyEmail /></SuspenseWrapper> },

  // Protected app routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },

      // Workspaces
      { path: 'workspaces', element: <SuspenseWrapper><WorkspaceList /></SuspenseWrapper> },
      { path: 'workspaces/new', element: <SuspenseWrapper><WorkspaceCreate /></SuspenseWrapper> },
      // :id shows the Hub (platform folders + content overview)
      { path: 'workspaces/:id', element: <SuspenseWrapper><WorkspaceHub /></SuspenseWrapper> },
      // :id/edit shows settings/edit form
      { path: 'workspaces/:id/edit', element: <SuspenseWrapper><WorkspaceDetail /></SuspenseWrapper> },

      // Generate
      { path: 'generate', element: <SuspenseWrapper><ContentGenerator /></SuspenseWrapper> },
      { path: 'generate/image', element: <SuspenseWrapper><ImageGenerator /></SuspenseWrapper> },
      { path: 'generate/thumbnail', element: <SuspenseWrapper><ThumbnailGenerator /></SuspenseWrapper> },

      // Content
      { path: 'content', element: <SuspenseWrapper><ContentLibrary /></SuspenseWrapper> },
      { path: 'content/:id', element: <SuspenseWrapper><ContentEditor /></SuspenseWrapper> },

      // Calendar
      { path: 'calendar', element: <SuspenseWrapper><CalendarView /></SuspenseWrapper> },

      // Analytics & Settings
      { path: 'analytics', element: <SuspenseWrapper><Analytics /></SuspenseWrapper> },
      { path: 'settings', element: <SuspenseWrapper><Settings /></SuspenseWrapper> },
    ],
  },
  { path: '*', element: <Navigate to="/app/dashboard" replace /> },
]);

export default router;
