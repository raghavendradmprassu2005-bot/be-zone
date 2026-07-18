import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome back! ✨' });
        navigate('/');
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: 'Please enter your full name', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);

if (error) {
  toast({
    title: "Signup failed",
    description: error.message,
    variant: "destructive",
  });
} else {
  toast({
    title: "Account created! ✨",
    description: "You can now sign in with your account.",
  });

  setIsLogin(true);

  setPassword("");
}
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <div className="rounded-lg border border-border/50 bg-card p-8">
          <div className="mb-6 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isLogin ? 'Welcome Back' : 'Join the Cosmos'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin ? 'Sign in to your cosmic account' : 'Create your cosmic account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-muted/30" placeholder="Your cosmic name" required />
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-muted/30" placeholder="star@cosmos.com" required />
            </div>
            <div>
              <Label className="text-muted-foreground">Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-muted/30" placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full gradient-cosmic py-6 text-primary-foreground" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In ✨' : 'Create Account ✨'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-accent hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
