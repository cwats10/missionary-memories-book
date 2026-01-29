import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { brandConfig } from '@/config/brandConfig';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import GoldDivider from '@/components/decorative/GoldDivider';

const Auth = () => {
  const { user, loading, signUp, signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect URL from query params, default to /dashboard
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="absolute inset-0 paper-texture pointer-events-none" />
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background relative">
      {/* Paper texture background */}
      <div className="absolute inset-0 paper-texture pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Name with gold divider */}
        <div className="text-center mb-10">
          <span className="font-serif text-3xl tracking-wide">
            {brandConfig.name}
          </span>
          <GoldDivider variant="diamond" className="mt-4" />
        </div>

        {/* Form Card with decorative frame */}
        <div className="bg-card/80 backdrop-blur-sm border border-stone/30 rounded-lg p-8 shadow-elegant relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/30 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/30 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/30 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/30 rounded-br-lg" />
          
          <h1 className="font-serif text-2xl text-center mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="font-serif-text text-muted-foreground text-center mb-8 text-sm">
            {isSignUp 
              ? 'Join us to preserve your precious memories' 
              : 'Sign in to continue your journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-serif-text text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required={isSignUp}
                  maxLength={100}
                  className="bg-background/50 border-stone/30 focus:border-gold/50 focus:ring-gold/20 transition-colors"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-serif-text text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={255}
                className="bg-background/50 border-stone/30 focus:border-gold/50 focus:ring-gold/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-serif-text text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-background/50 border-stone/30 focus:border-gold/50 focus:ring-gold/20 transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:opacity-90 font-serif transition-all duration-200 hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Please wait...' 
                : isSignUp 
                  ? 'Create Account' 
                  : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-serif-text text-muted-foreground hover:text-gold transition-colors text-sm link-elegant"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Back to home with gold hover */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="font-serif-text text-muted-foreground hover:text-gold transition-colors text-sm link-elegant"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
};


export default Auth;
