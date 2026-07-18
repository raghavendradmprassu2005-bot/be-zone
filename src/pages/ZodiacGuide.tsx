import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Sparkles, Star, Gift } from 'lucide-react';

const featureItems = [
  'Luxury Collections',
  'Festival Offers',
  'Exclusive Bundles',
  'Limited Edition Products',
  'Member-only Discounts',
];

const dotStages = ['Launching Soon', 'Launching Soon.', 'Launching Soon..', 'Launching Soon...'];

const ZodiacGuide = () => {
  const [email, setEmail] = useState('');
  const [activeStage, setActiveStage] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % dotStages.length);
    }, 750);

    return () => window.clearInterval(timer);
  }, []);

  const emailValid = useMemo(() => email.includes('@') && email.includes('.'), [email]);

  const handleNotify = () => {
    if (!emailValid) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }

    toast({ title: "You're on the VIP waiting list ✨", description: 'We will let you know when the collection launches.', variant: 'default' });
    setEmail('');
  };

  return (
    <div className="relative overflow-hidden bg-[#FFFDF8] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,239,213,0.35),_transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffffff00_0%,#fffaf0_40%,#fffaf0_100%)]" />
      <div className="relative min-h-screen px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 text-center"
        >
          <div className="relative py-12">
            <motion.div
              className="absolute inset-x-0 top-1/2 mx-auto h-44 w-44 rounded-full bg-gradient-to-r from-[#F8E2B8] via-[#fff9ed] to-[#D4AF37]/20 blur-3xl opacity-70"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.h1
              className="relative max-w-4xl text-5xl font-serif font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-7xl"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {'✨ Something Beautiful is Coming'.split(' ').map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  className="inline-block"
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </motion.h1>
            <div className="absolute inset-x-0 top-0 mx-auto h-24 w-full opacity-40">
              <div className="mx-auto h-full w-full rounded-full bg-gradient-to-r from-transparent via-[#FFE7B2] to-transparent blur-2xl" />
            </div>
          </div>

          <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Our festive collections are being carefully curated. Stay tuned for exclusive launches, limited-time offers, and luxury beauty experiences.
          </p>

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 mx-auto h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.16),_transparent_55%)]"
              animate={{ opacity: [0.45, 0.6, 0.45], scale: [1, 1.06, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              whileHover={{ rotate: 8, scale: 1.03 }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-72 w-72 items-center justify-center rounded-[2.5rem] border border-white/70 bg-white/80 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.3)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 rounded-[2.5rem] border border-[#f4e7cf]/60 shadow-[0_0_120px_rgba(212,175,55,0.18)]" />
              <div className="relative h-48 w-48 rounded-[2rem] bg-gradient-to-br from-[#FFF9EF] via-[#F6E4C2] to-[#D4AF37] shadow-[inset_0_0_60px_rgba(255,255,255,0.8),0_25px_80px_rgba(212,175,55,0.24)]">
                <div className="absolute inset-x-6 top-12 h-10 rounded-full bg-[#fff5e2] shadow-[0_15px_45px_rgba(255,255,255,0.6)]" />
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] bg-white/90 shadow-[0_20px_80px_rgba(255,255,255,0.8)]" />
                <div className="absolute left-1/2 top-1/2 h-20 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#D4AF37] shadow-[0_0_18px_rgba(212,175,55,0.5)]" />
                <div className="absolute left-1/2 top-1/2 h-4 w-20 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white/90 shadow-[0_0_14px_rgba(255,255,255,0.75)]" />
              </div>
              <div className="pointer-events-none absolute inset-0">
                <motion.div
                  className="absolute left-10 top-16 h-3 w-3 rounded-full bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                  animate={{ y: [0, -10, 0], x: [0, 4, 0], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute right-14 top-20 h-2 w-2 rounded-full bg-[#fff8e2] shadow-[0_0_18px_rgba(255,255,255,0.9)]"
                  animate={{ y: [0, 8, 0], x: [0, -6, 0], opacity: [0.8, 0.4, 0.8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute right-24 bottom-16 h-3 w-3 rounded-full bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.75)]"
                  animate={{ x: [0, 6, 0], y: [0, -8, 0], opacity: [0.9, 0.5, 0.9] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.2)] backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-center justify-center gap-3 text-sm uppercase tracking-[0.3em] text-slate-500">
              <span className="rounded-full bg-[#f7edd6] px-3 py-1 text-[#B78B24]">COMING SOON</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {featureItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-3xl border border-slate-200/60 bg-[#fffdf7]/90 p-4 shadow-sm">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#B28716] shadow-[0_10px_30px_-20px_rgba(212,175,55,0.55)]">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="grid gap-6 lg:grid-cols-[1fr_0.9fr]"
          >
            <div className="rounded-[2rem] border border-white/70 bg-[#fff9ef]/80 p-8 shadow-[0_30px_80px_-50px_rgba(212,175,55,0.18)] backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Launching</p>
              <p className="mt-4 text-3xl font-serif font-semibold text-slate-950 sm:text-4xl">{dotStages[activeStage]}</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">The next luxury chapter is being crafted with the same care and elegance as a couture beauty reveal.</p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Join the waitlist</p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 rounded-full border border-slate-200 bg-[#fffdf8] px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10"
                />
                <Button
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F4D56D] to-[#D4AF37] px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_-22px_rgba(212,175,55,0.55)]"
                  onClick={handleNotify}
                >
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-y-0 left-0 right-0 bg-white/20 blur-xl opacity-40"
                  />
                  <span className="relative z-10">Notify Me</span>
                </Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">No backend required — simply reserve your VIP invitation to the launch.</p>
            </div>
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="max-w-2xl text-center text-sm italic text-slate-600"
          >
            “In beauty, anticipation is part of the luxury.”
          </motion.blockquote>
        </motion.div>
      </div>
    </div>
  );
};

export default ZodiacGuide;
