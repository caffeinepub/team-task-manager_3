import React, { useState } from 'react';
import { User, Bell, Palette, Shield, Save } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

type SettingsSection = 'profile' | 'notifications' | 'appearance' | 'security';

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const { theme, toggleTheme } = useTheme();

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'security' as const, label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="p-6 flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {activeSection === 'profile' && (
            <div className="bg-card rounded-2xl border border-border p-6 card-shadow">
              <h2 className="text-base font-semibold text-foreground mb-5">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
                  <input
                    type="text"
                    defaultValue="TaskFlow User"
                    className="w-full bg-muted text-foreground border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue="user@taskflow.app"
                    className="w-full bg-muted text-foreground border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    defaultValue="Project manager and team lead."
                    className="w-full bg-muted text-foreground border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-card rounded-2xl border border-border p-6 card-shadow">
              <h2 className="text-base font-semibold text-foreground mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'Task assignments', desc: 'When you are assigned to a task' },
                  { label: 'Task deadlines', desc: 'Reminders before task deadlines' },
                  { label: 'Team updates', desc: 'When team members join or leave' },
                  { label: 'Project milestones', desc: 'When project milestones are reached' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                      <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="bg-card rounded-2xl border border-border p-6 card-shadow">
              <h2 className="text-base font-semibold text-foreground mb-5">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Theme</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      ☀️ Light
                    </button>
                    <button
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      🌙 Dark
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-foreground mb-1">Current theme</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === 'dark' ? 'Dark mode with teal accents' : 'Light mode with orange accents'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-card rounded-2xl border border-border p-6 card-shadow">
              <h2 className="text-base font-semibold text-foreground mb-5">Security</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm font-medium text-foreground">Internet Identity</p>
                  <p className="text-xs text-muted-foreground mt-1">Your account is secured with Internet Identity authentication.</p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm font-medium text-foreground">Session Management</p>
                  <p className="text-xs text-muted-foreground mt-1">You are currently logged in. Sessions expire after 30 days of inactivity.</p>
                </div>
                <button className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-all">
                  <Shield className="w-4 h-4" />
                  Sign Out All Devices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
