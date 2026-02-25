import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import TeamMemberView from './pages/TeamMemberView';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AdminDashboard,
});

const myTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tasks',
  component: TeamMemberView,
});

const routeTree = rootRoute.addChildren([indexRoute, myTasksRoute]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
