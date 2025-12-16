import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TennisRacketIcon } from '@/components/icons/TennisRacketIcon';
import { CrownIcon } from '@/components/icons/CrownIcon';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);
    
    if (success) {
      toast({
        title: "Welcome to the Society",
        description: "May your serves be true and your volleys swift.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials. The gates remain closed.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-texture-parchment pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-noble" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-noble" />
      
      {/* Corner decorations */}
      <div className="absolute top-8 left-8 text-terra-cotta/20">
        <TennisRacketIcon className="w-16 h-16 rotate-45" />
      </div>
      <div className="absolute bottom-8 right-8 text-terra-cotta/20">
        <TennisRacketIcon className="w-16 h-16 -rotate-45" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CrownIcon className="w-16 h-16 text-gold animate-crown-shine" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-noble rounded-full" />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            TKSTL
          </h1>
          <p className="font-serif-body text-xl text-muted-foreground mt-2 italic">
            Tennisklubben Stora Tennisligan
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-sans">
              Est. 2017
            </span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg shadow-card border border-border p-8">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Enter the Court
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Present your credentials to the Society
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Member Name
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="h-11 bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Society Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 bg-background"
                required
              />
            </div>

            <Button
              type="submit"
              variant="royal"
              size="lg"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Request Entry"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground italic font-serif-body">
              "The court separates the worthy from the merely ambitious."
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              — Gerard, Year One
            </p>
          </div>
        </div>

        {/* Hint for demo */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Demo Access:</span> Use member names (e.g., "gerard", "ludvig") 
            with password "sovereign2017" for Royalty or "peasant123" for Peasants.
          </p>
        </div>
      </div>
    </div>
  );
}
