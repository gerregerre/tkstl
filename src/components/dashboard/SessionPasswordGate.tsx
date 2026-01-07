import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionPasswordGateProps {
  onAuthenticated: () => void;
}

// Simple password for session recording access
const SESSION_PASSWORD = 'tennis2024';

export function SessionPasswordGate({ onAuthenticated }: SessionPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === SESSION_PASSWORD) {
      // Store in session storage so user doesn't need to re-enter during same session
      sessionStorage.setItem('session_recorder_auth', 'true');
      onAuthenticated();
    } else {
      setError('Incorrect password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card rounded-lg border border-border p-8 shadow-card">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Session Recorder
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter the password to record game sessions
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  className={cn(
                    "pr-10",
                    error && "border-destructive focus-visible:ring-destructive"
                  )}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" variant="atp" className="w-full gap-2">
              <Check className="w-4 h-4" />
              Unlock Recorder
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
