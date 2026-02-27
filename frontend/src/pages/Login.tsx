import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, CheckSquare, Zap, Users, BarChart3 } from 'lucide-react';

export default function Login() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const features = [
    { icon: <CheckSquare size={16} />, text: 'Task Management' },
    { icon: <Users size={16} />, text: 'Team Collaboration' },
    { icon: <BarChart3 size={16} />, text: 'Progress Tracking' },
    { icon: <Zap size={16} />, text: 'Real-time Updates' },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/login-bg.dim_1440x900.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card border border-border rounded-3xl p-8 card-elevated">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 purple-glow">
              <img
                src="/assets/generated/app-logo.dim_128x128.png"
                alt="TaskFlow"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground">TaskFlow</h1>
            <p className="text-muted-foreground text-sm mt-1">Project Management Platform</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl text-sm text-muted-foreground"
              >
                <span className="text-purple-400">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>

          {/* Sign In */}
          <button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Sign in with Internet Identity
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Secure, decentralized authentication powered by the Internet Computer
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} TaskFlow · Built with{' '}
          <span className="text-red-400">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'taskflow')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
