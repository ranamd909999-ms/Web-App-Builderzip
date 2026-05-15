import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, AlertCircle, BookOpen, Trophy, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const perks = [
  { icon: BookOpen, text: "10,000+ chapter-wise MCQs" },
  { icon: Trophy, text: "Live leaderboard rankings" },
  { icon: BarChart2, text: "Smart progress analytics" },
];

export default function Login() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email, password });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* ── Left branding panel ─── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0d0d1f 0%, #13082e 50%, #060c1f 100%)" }}>
        <div className="orb orb-purple w-[500px] h-[500px] -top-32 -right-32 opacity-60 animate-orb-drift" />
        <div className="orb orb-cyan w-[350px] h-[350px] bottom-0 -left-16 opacity-40 animate-float-slow" />

        <div className="relative z-10">
          <Link href="/">
            <div className="inline-flex items-center gap-2.5 cursor-pointer">
              <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Zap size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl">QuizMaster <span className="gradient-text">Pro</span></span>
            </div>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-3 leading-tight">
            Study smarter,<br />
            <span className="gradient-text">score higher</span>
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Join 2,500+ students preparing for FSc, Matric, MDCAT, and more with chapter-wise MCQ practice.
          </p>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                  <p.icon size={15} className="text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl glass-card border border-white/5">
          <div className="flex gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic">"Went from 68% to 89% accuracy in 6 weeks. The analytics are incredible."</p>
          <p className="text-xs text-purple-300 font-semibold mt-1.5">— Ali Hassan, Engineering Student</p>
        </div>
      </div>

      {/* ── Right form panel ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="orb orb-purple w-[400px] h-[400px] top-0 right-0 opacity-20" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <div className="inline-flex items-center gap-2.5 cursor-pointer mb-2">
                <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center">
                  <Zap size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg">QuizMaster <span className="gradient-text">Pro</span></span>
              </div>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue your study session</p>
          </div>

          <div className="glass-premium rounded-2xl p-8 border border-white/5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Your password" required
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={isLoading}
                className="w-full py-3.5 gradient-btn text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : "Sign in"}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-center text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setEmail("admin@quizmaster.pro"); setPassword("password"); }}
                  className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8 text-xs text-center hover:border-purple-500/30 transition-colors">
                  <div className="font-semibold text-purple-300 mb-0.5">Admin</div>
                  <div className="text-muted-foreground">admin@quizmaster.pro</div>
                </button>
                <button onClick={() => { setEmail("student@quizmaster.pro"); setPassword("password"); }}
                  className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8 text-xs text-center hover:border-cyan-500/30 transition-colors">
                  <div className="font-semibold text-cyan-300 mb-0.5">Student</div>
                  <div className="text-muted-foreground">student@quizmaster.pro</div>
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Password: <span className="text-foreground font-mono">password</span></p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register"><span className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">Create one free →</span></Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
