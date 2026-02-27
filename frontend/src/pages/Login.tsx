import React from 'react';
import { CheckSquare, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Login() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';
  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'taskflow-app';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 card-shadow">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <CheckSquare className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Project Manager</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your workspace</p>
          </div>

          <button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Built with <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()} TaskFlow
        </p>
      </div>
    </div>
  );
}
