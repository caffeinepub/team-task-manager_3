import { useState } from 'react';
import { Loader2, Eye, EyeOff, UserPlus, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddUser } from '../hooks/useQueries';
import { Role } from '../backend';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const addUser = useAddUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.TeamMember);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole(Role.TeamMember);
    setShowPassword(false);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const user = await addUser.mutateAsync({ name: name.trim(), email: email.trim(), password, role });
      toast.success(`${user.name} has been added to the team!`);
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || 'Failed to add user';
      if (msg.includes('Email already registered')) {
        toast.error('This email address is already registered');
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else {
        toast.error(msg);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <UserPlus size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Create a new account for your team member
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="add-name" className="text-sm font-semibold">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-name"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              placeholder="e.g. Rahul Sharma"
              className={`rounded-xl ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="add-email" className="text-sm font-semibold">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="rahul@example.com"
              className={`rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="add-password" className="text-sm font-semibold">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="add-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="Min. 6 characters"
                className={`pr-10 rounded-xl ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="add-confirm-password" className="text-sm font-semibold">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="add-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
              placeholder="Repeat password"
              className={`rounded-xl ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={role} onValueChange={v => setRole(v as Role)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={Role.TeamMember}>
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-muted-foreground" />
                    Team Member
                  </span>
                </SelectItem>
                <SelectItem value={Role.Admin}>
                  <span className="flex items-center gap-2">
                    <Shield size={14} className="text-primary" />
                    Admin
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => { resetForm(); onOpenChange(false); }}
              disabled={addUser.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl gap-2 font-semibold"
              disabled={addUser.isPending}
            >
              {addUser.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Adding…</>
              ) : (
                <><UserPlus size={16} /> Add Member</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
