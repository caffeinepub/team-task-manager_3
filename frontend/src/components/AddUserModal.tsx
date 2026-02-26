import { useState } from 'react';
import { Loader2, UserPlus, Shield, User, Mail, Tag } from 'lucide-react';
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
import { useAddTeamMember } from '../hooks/useQueries';
import { Role } from '../backend';

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserModal({ open, onOpenChange }: AddUserModalProps) {
  const addTeamMember = useAddTeamMember();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.TeamMember);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole(Role.TeamMember);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await addTeamMember.mutateAsync({ name: name.trim(), email: email.trim(), role });
      toast.success(`${name.trim()} has been added to the team!`);
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.message || 'Failed to add team member';
      if (msg.includes('already exists')) {
        setErrors(prev => ({ ...prev, name: 'A team member with this name already exists' }));
      } else {
        setErrors(prev => ({ ...prev, form: 'Failed to add team member. Please try again.' }));
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
                Add a new member to your team
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Form-level error */}
          {errors.form && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errors.form}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="add-name" className="text-sm font-semibold flex items-center gap-1.5">
              <User size={13} className="text-muted-foreground" />
              Name <span className="text-destructive">*</span>
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

          {/* Email ID */}
          <div className="space-y-1.5">
            <Label htmlFor="add-email" className="text-sm font-semibold flex items-center gap-1.5">
              <Mail size={13} className="text-muted-foreground" />
              Email ID <span className="text-destructive">*</span>
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

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold flex items-center gap-1.5">
              <Tag size={13} className="text-muted-foreground" />
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={v => { setRole(v as Role); setErrors(p => ({ ...p, role: '' })); }}
            >
              <SelectTrigger className={`rounded-xl ${errors.role ? 'border-destructive focus-visible:ring-destructive' : ''}`}>
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
            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => { resetForm(); onOpenChange(false); }}
              disabled={addTeamMember.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl gap-2 font-semibold"
              disabled={addTeamMember.isPending}
            >
              {addTeamMember.isPending ? (
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
