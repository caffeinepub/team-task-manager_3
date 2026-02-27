import { useState } from 'react';
import { Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

// ProfileSetup is shown when the user is authenticated but hasn't set up a profile yet.
// Since the backend no longer has a user profile endpoint, this page is a no-op placeholder
// that simply lets the user proceed into the app.
export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitted(true);
    // Reload to re-trigger auth flow
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to TaskFlow</h1>
          <p className="text-muted-foreground text-sm">Enter your name to get started</p>
        </div>

        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profileName">Your Name</Label>
                <Input
                  id="profileName"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-background/50 border-border/50"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={!name.trim() || submitted}
              >
                {submitted && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
