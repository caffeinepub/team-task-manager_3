import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../backend';

interface GoogleSignInButtonProps {
  className?: string;
}

function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleSignInButton({ className = '' }: GoogleSignInButtonProps) {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const { login: iiLogin, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const [isProcessing, setIsProcessing] = useState(false);

  const isLoading = loginStatus === 'logging-in' || isProcessing;

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsProcessing(true);
    try {
      await iiLogin();

      let attempts = 0;
      let currentActor = actor;
      while (!currentActor && attempts < 20) {
        await new Promise(res => setTimeout(res, 200));
        attempts++;
        currentActor = actor;
      }

      if (!currentActor) {
        toast.error('Authentication failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      const existingProfile = await currentActor.getCallerUserProfile();

      if (existingProfile) {
        authLogin({
          id: '0',
          name: existingProfile.name,
          email: existingProfile.email,
          role: existingProfile.role,
        });
        toast.success(`Welcome back, ${existingProfile.name}!`);
        navigate({ to: '/' });
      } else {
        const userName = window.prompt('Welcome! Please enter your name to complete sign-in:');
        if (!userName || !userName.trim()) {
          toast.error('Name is required to complete sign-in.');
          setIsProcessing(false);
          return;
        }
        const trimmedName = userName.trim();
        const newProfile = {
          name: trimmedName,
          email: '',
          role: Role.TeamMember,
        };
        await currentActor.saveCallerUserProfile(newProfile);
        authLogin({
          id: '0',
          name: trimmedName,
          email: '',
          role: Role.TeamMember,
        });
        toast.success(`Welcome, ${trimmedName}!`);
        navigate({ to: '/' });
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        msg.includes('UserInterrupt') ||
        msg.includes('cancelled') ||
        msg.includes('closed') ||
        msg.includes('abort')
      ) {
        // Silently return
      } else if (msg) {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={[
        'flex items-center justify-center gap-3 w-full',
        'bg-white border border-gray-300 rounded-md',
        'px-4 py-2.5 text-sm font-medium text-gray-700',
        'shadow-sm hover:bg-gray-50 hover:border-gray-400',
        'transition-all duration-150',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        'dark:bg-white dark:text-gray-700 dark:border-gray-300',
        className,
      ].join(' ')}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      ) : (
        <GoogleLogo />
      )}
      <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
    </button>
  );
}
