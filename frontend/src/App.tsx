import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRouter,
  RouterProvider,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import Projects from './pages/Projects';
import Schedule from './pages/Schedule';
import Activities from './pages/Activities';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const myTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tasks',
  component: MyTasks,
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: Projects,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/schedule',
  component: Schedule,
});

const activitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activities',
  component: Activities,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  myTasksRoute,
  projectsRoute,
  scheduleRoute,
  activitiesRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
