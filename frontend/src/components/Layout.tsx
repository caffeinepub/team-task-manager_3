import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, CheckSquare, Activity, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import NotificationBell from './NotificationBell';
import ThemeSwitcher from './ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Role } from '../backend';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/activity-log', label: 'Activity Log', icon: Activity },
  { path: '/team-members', label: 'Team Members', icon: Users },
];

export default function Layout({ children }: LayoutProps) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    queryClient.clear();
    await clear();
    window.location.href = '/login';
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="bg-white rounded-xl p-2 inline-block shadow-sm">
              <img
                src="/assets/generated/hallmark-logo.dim_400x120.png"
                alt="Hallmark Events"
                className="h-9 w-auto object-contain"
              />
            </div>
            <button
              className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border">
          <ThemeSwitcher />
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === '/' ? currentPath === '/' : currentPath.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        {isAuthenticated && currentUser && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-sidebar-accent/50">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-sidebar-foreground truncate">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {currentUser.role === Role.Admin ? '⚡ Admin' : '👤 Team Member'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Log Out
            </Button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            className="text-foreground hover:text-primary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="bg-white rounded-lg p-1.5 inline-block shadow-sm">
            <img
              src="/assets/generated/hallmark-logo.dim_400x120.png"
              alt="Hallmark Events"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitcher />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hallmark Events. Built with{' '}
          <span className="text-primary">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'hallmark-events')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
