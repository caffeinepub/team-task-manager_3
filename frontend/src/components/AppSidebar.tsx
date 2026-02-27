import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  CheckSquare,
  FolderOpen,
  Calendar,
  Activity,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: Activity, label: 'Activities', path: '/activities' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const displayName = identity
    ? identity.getPrincipal().toString().slice(0, 8) + '...'
    : 'Guest';

  return (
    <aside className="w-64 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-base leading-tight">TaskFlow</h1>
            <p className="text-sidebar-foreground/50 text-xs">Project Manager</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sidebar-accent text-sidebar-foreground placeholder-sidebar-foreground/40 text-sm pl-8 pr-3 py-2 rounded-lg border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        <p className="text-sidebar-foreground/40 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate({ to: item.path })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/70" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Projects collapsible */}
        <div className="mt-4">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="w-full flex items-center gap-2 px-2 mb-1 text-sidebar-foreground/40 text-xs font-semibold uppercase tracking-wider hover:text-sidebar-foreground/60 transition-colors"
          >
            {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Projects
          </button>
          {projectsOpen && (
            <ul className="space-y-0.5 ml-2">
              {['TaskWave', 'ProjectPulse', 'SprintHive'].map((project) => (
                <li key={project}>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
                    <span className="w-2 h-2 rounded-full bg-primary/60" />
                    {project}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all">
          <HelpCircle className="w-4 h-4" />
          Help & Support
        </button>

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm text-sidebar-foreground/60">Dark Mode</span>
          <button
            onClick={toggleTheme}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-primary' : 'bg-sidebar-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent mt-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-bold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-xs font-semibold truncate">{displayName}</p>
            <p className="text-sidebar-foreground/50 text-xs truncate">User</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
