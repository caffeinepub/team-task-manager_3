import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import TeamMemberView from './pages/TeamMemberView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Tasks from './pages/Tasks';
import ActivityLog from './pages/ActivityLog';
import TeamMembers from './pages/TeamMembers';
import { useTheme } from './hooks/useTheme';

const queryClient = new QueryClient();

function ThemeInitializer() {
  useTheme();
  return null;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Auth layout (no sidebar)
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth-layout',
  component: () => <Outlet />,
});

// Protected layout (with sidebar)
const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected-layout',
  component: () => <Layout><Outlet /></Layout>,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: Login,
});

const signupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/signup',
  component: Signup,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/forgot-password',
  component: ForgotPassword,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/',
  component: AdminDashboard,
});

const tasksRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/tasks',
  component: Tasks,
});

const activityLogRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/activity-log',
  component: ActivityLog,
});

const teamMembersRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/team-members',
  component: TeamMembers,
});

const myTasksRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/my-tasks',
  component: TeamMemberView,
});

const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, signupRoute, forgotPasswordRoute]),
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    tasksRoute,
    activityLogRoute,
    teamMembersRoute,
    myTasksRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return (
    <>
      <ThemeInitializer />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
