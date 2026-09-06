import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast({ title: 'Sign in failed', description: 'Unable to sign in. Check your credentials and try again.', variant: 'destructive' });
      } else {
        toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
        navigate('/');
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: 'Please enter your full name', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const { error } = await signUp(email.trim(), password, fullName.trim());
      if (error) {
        toast({ title: 'Signup failed', description: 'Unable to create account. Please try again.', variant: 'destructive' });
      } else {
        toast({ title: 'Account created', description: 'You may now sign in with your account.' });
        setIsLogin(true);
        setPassword('');
      }
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (resetLoading) return;
    if (!email.trim()) {
      toast({ title: 'Enter your email', description: 'Please enter the email associated with your account.', variant: 'destructive' });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // optional: redirectTo: import.meta.env.VITE_APP_URL + '/reset-password'
      });

      if (error) {
        toast({ title: 'Unable to send reset', description: 'If an account exists for that email, you will receive reset instructions shortly.', variant: 'destructive' });
      } else {
        toast({ title: 'Reset email sent', description: 'If an account exists for that email, you will receive instructions to reset your password shortly.' });
        setResetMode(false);
      }
    } catch (err) {
      toast({ title: 'Something went wrong', description: 'Unable to send password reset. Please try again later.', variant: 'destructive' });
    }
    setResetLoading(false);
  };

  const handleGoogle = async () => {
    if (oauthLoading) return;
    setOauthLoading(true);
    try {
      const result = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (result.error) {
        toast({ title: 'Google sign-in unavailable', description: 'Google sign-in is not configured for this environment. Please contact the administrator.', variant: 'destructive' });
        setOauthLoading(false);
      }
    } catch (err) {
      toast({ title: 'Google sign-in failed', description: 'Unable to sign in with Google. Please try again.', variant: 'destructive' });
      setOauthLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden"
      style={{
        background: 'radial-gradient(1200px 600px at 10% 10%, rgba(184,139,74,0.07), transparent 15%), radial-gradient(800px 400px at 90% 85%, rgba(148,115,85,0.05), transparent 20%), linear-gradient(180deg,#fbf6f3 0%, #fbf3f0 50%, #f7efe9 100%)',
      }}
    >
      {/* Decorative floating shapes - CSS animated (very subtle) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-6 top-12 w-48 h-48 rounded-full border border-[rgba(148,115,85,0.06)] blur-[1px] opacity-20 animate-floating-slow" />
        <div className="absolute right-6 top-28 w-36 h-36 rounded-xl border border-[rgba(148,115,85,0.05)] opacity-14 animate-floating-slower" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-16 w-28 h-28 rotate-45 rounded-sm border border-[rgba(148,115,85,0.06)] opacity-12 blur-[0.5px] animate-floating-slow" />
        <div className="absolute right-1/3 top-8 w-20 h-20 rounded-full border border-[rgba(148,115,85,0.06)] opacity-10 animate-floating-slower" />
        <div className="absolute left-10 bottom-28 w-[220px] h-[8px] rounded-full bg-[rgba(148,115,85,0.03)] opacity-10 animate-floating-slow" />
        <div className="absolute right-16 bottom-6 w-6 h-6 rotate-45 bg-[rgba(184,139,74,0.14)] opacity-12 rounded-sm animate-floating-mini" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md px-6"
      >
        {/* Premium glass card */}
        <div className="relative rounded-[18px] bg-white/80 backdrop-blur-md border border-[rgba(184,139,74,0.12)] shadow-[0_12px_30px_rgba(30,20,15,0.06)] p-8 md:p-10">
          {/* subtle inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-gradient-to-t from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.06)]" />

          <div className="relative z-10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 h-10 w-10 flex items-center justify-center rounded-full bg-[rgba(184,139,74,0.06)] text-[#B88B4A]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl md:text-2xl font-semibold text-[#44302A]">Welcome Back</h1>
              <p className="mt-1 text-sm text-[#6b5b53]">Sign in to your Be‑Zone account</p>
            </div>

            <form onSubmit={isLogin && resetMode ? handlePasswordReset : handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label className="text-[#6b5b53]">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="mt-2 bg-[rgba(255,255,255,0.9)] border-[rgba(148,115,85,0.12)] focus:ring-2 focus:ring-[rgba(184,139,74,0.18)]"
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              <div>
                <Label className="text-[#6b5b53]">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-2 bg-[rgba(255,255,255,0.9)] border-[rgba(148,115,85,0.12)] focus:ring-2 focus:ring-[rgba(184,139,74,0.18)]"
                  placeholder="you@be-zone.com"
                  required
                  aria-label="Email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-[#6b5b53]">Password</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setResetMode(prev => !prev)}
                      className="text-[#B88B4A] text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[rgba(184,139,74,0.18)] rounded"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {!resetMode && (
                  <div className="relative mt-2">
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pr-10 bg-[rgba(255,255,255,0.9)] border-[rgba(148,115,85,0.12)] focus:ring-2 focus:ring-[rgba(184,139,74,0.18)]"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(v => !v)}
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5b53] p-1 rounded focus:outline-none focus:ring-2 focus:ring-[rgba(184,139,74,0.18)]"
                    >
                      {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {resetMode && (
                  <div className="mt-2">
                    <p className="text-sm text-[#6b5b53]">Enter your email and we'll send password reset instructions.</p>
                  </div>
                )}
              </div>

              <div>
                {!resetMode ? (
                  <Button
                    type="submit"
                    className="w-full py-3 rounded-md bg-gradient-to-b from-[#3e2c25] to-[#2f2019] text-white shadow-[0_8px_20px_rgba(46,30,24,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                    disabled={loading}
                  >
                    {loading ? 'Signing in…' : isLogin ? 'Sign In ✨' : 'Create Account ✨'}
                  </Button>
                ) : (
                  <Button type="submit" className="w-full py-3 rounded-md bg-gradient-to-b from-[#3e2c25] to-[#2f2019] text-white" disabled={resetLoading}>
                    {resetLoading ? 'Sending…' : 'Send reset email'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[rgba(60,40,30,0.06)]" />
                <div className="text-xs text-[#8a796f]">OR</div>
                <div className="flex-1 h-px bg-[rgba(60,40,30,0.06)]" />
              </div>

              <div className="mt-4">
                <button
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 rounded-md border border-[rgba(60,40,30,0.08)] bg-[rgba(255,255,255,0.9)] py-2 text-sm hover:shadow-lg transition-shadow disabled:opacity-60"
                  disabled={oauthLoading}
                  aria-label="Continue with Google"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M17.64 9.2045c0-.638-.0575-1.2525-.164-1.845H9v3.492h4.844c-.208 1.12-.836 2.07-1.78 2.708v2.25h2.876c1.684-1.552 2.656-3.83 2.656-6.605z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.804 5.956-2.182l-2.876-2.25C11.53 13.042 10.33 13.5 9 13.5c-2.324 0-4.293-1.566-4.995-3.666H1.01v2.302C2.5 15.9 5.52 18 9 18z" fill="#34A853"/>
                    <path d="M4.005 10.834A5.397 5.397 0 0 1 3.6 9c0-.68.116-1.34.335-1.934V4.764H1.01A8.991 8.991 0 0 0 0 9c0 1.47.352 2.86.99 4.102l3.015-2.268z" fill="#FBBC05"/>
                    <path d="M9 3.18c1.32 0 2.51.45 3.45 1.334l2.586-2.586C13.467.804 11.43 0 9 0 5.52 0 2.5 2.1 1.01 4.764l3.925 2.302C4.707 4.746 6.676 3.18 9 3.18z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[#44302A]">{oauthLoading ? 'Continuing…' : 'Continue with Google'}</span>
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-[#6b5b53]">
              Don't have an account?
              <button
                onClick={() => { setIsLogin(prev => !prev); setResetMode(false); }}
                className="ml-2 text-[#B88B4A] font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-[rgba(184,139,74,0.18)] rounded"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Page-scoped CSS for subtle floating and reduced-motion */}
      <style>{`
        @keyframes floating-slow {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-10px) translateX(6px) rotate(3deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        @keyframes floating-slower {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          50% { transform: translateY(-6px) translateX(-6px) rotate(-2deg); }
          100% { transform: translateY(0) translateX(0) rotate(0deg); }
        }
        @keyframes floating-mini {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-6px) rotate(8deg) scale(1.05); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }
        .animate-floating-slow { animation: floating-slow 20s ease-in-out infinite; will-change: transform; }
        .animate-floating-slower { animation: floating-slower 28s ease-in-out infinite; will-change: transform; }
        .animate-floating-mini { animation: floating-mini 12s ease-in-out infinite; will-change: transform; }

        @media (prefers-reduced-motion: reduce) {
          .animate-floating-slow, .animate-floating-slower, .animate-floating-mini { animation: none !important; }
        }

        /* Ensure no horizontal overflow from decorative elements */
        html, body, #root { overflow-x: hidden; }
      `}</style>
    </div>
  );
};

export default Auth;