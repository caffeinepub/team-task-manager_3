import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import TeamMemberView from './pages/TeamMemberView';
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

// Main layout (with sidebar) — always accessible, no auth gate
const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'main-layout',
  component: () => <Layout><Outlet /></Layout>,
});

const dashboardRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/',
  component: AdminDashboard,
});

const tasksRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/tasks',
  component: Tasks,
});

const activityLogRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/activity-log',
  component: ActivityLog,
});

const teamMembersRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/team-members',
  component: TeamMembers,
});

const myTasksRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/my-tasks',
  component: TeamMemberView,
});

const routeTree = rootRoute.addChildren([
  mainLayoutRoute.addChildren([
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
