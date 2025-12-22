import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    setErrors({});
    const schema = isSignUp ? signupSchema : loginSchema;
    const data = isSignUp ? { email, password, name } : { email, password };
    
    const result = schema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, { name, role: 'peasant' });
      
      if (error) {
        let message = 'Failed to create account. Please try again.';
        if (error.message.includes('already registered')) {
          message = 'This email is already registered. Please sign in instead.';
        }
        toast({
          title: "Sign Up Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to the Society!",
          description: "Your account has been created. You may now enter.",
        });
        navigate('/dashboard');
      }
    } else {
      const { error } = await signIn(email, password);
      
      if (error) {
        let message = 'Invalid credentials. The gates remain closed.';
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please try again.';
        }
        toast({
          title: "Access Denied",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome to the Society",
          description: "May your serves be true and your volleys swift.",
        });
        navigate('/dashboard');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
              <span className="font-serif text-2xl font-bold text-primary-foreground">TK</span>
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
            TKSTL
          </h1>
          <p className="text-muted-foreground mt-2">
            Tennisklubben Stora Tennisligan
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Est. 2017
            </span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded border border-border p-8">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {isSignUp ? 'Join the Society' : 'Enter the Court'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? 'Create your membership' : 'Present your credentials to the Society'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Member Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={`h-11 ${errors.name ? 'border-destructive' : ''}`}
                  required
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
                required
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`h-11 ${errors.password ? 'border-destructive' : ''}`}
                required
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
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
                  {isSignUp ? 'Creating Account...' : 'Verifying...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Request Entry'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground">
              {isSignUp ? 'Already a member?' : "Not a member yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Join Now'}
              </button>
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-center text-muted-foreground">
              "The court separates the worthy from the merely ambitious."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
