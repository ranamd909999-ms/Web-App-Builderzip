import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const benefits = [
  "Access 10,000+ MCQs across all subjects",
  "Track your progress with smart analytics",
  "Compete on the live leaderboard",
  "Review wrong answers until mastered",
];

export default function Register() {
  const { register, isLoading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    try {
      await register({ name: form.name, email: form.email, phone: form.phone || undefined, password: form.password });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* ── Left branding panel ─── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #060c1f 0%, #0d1235 50%, #0a0621 100%)" }}>
        <div className="orb orb-cyan w-[500px] h-[500px] -top-32 -left-24 opacity-50 animate-orb-drift" />
        <div className="orb orb-purple w-[350px] h-[350px] bottom-0 -right-16 opacity-40 animate-float-slow" />

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
            Your journey to<br />
            <span className="gradient-text">top marks starts here</span>
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Free forever for students. No credit card required.
          </p>
          <div className="space-y-3">
            {benefits.map(b => (
              <div key={b} className="flex items-start gap-3">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl glass-card border border-white/5">
          <p className="text-xs text-muted-foreground italic">"The best prep platform I've used. Absolutely worth every minute."</p>
          <p className="text-xs text-cyan-300 font-semibold mt-1.5">— Fatima Khan, FSc Student</p>
        </div>
      </div>

      {/* ── Right form panel ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="orb orb-cyan w-[400px] h-[400px] top-0 right-0 opacity-15" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative">

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
            <h1 className="text-3xl font-black mb-2">Create your account</h1>
            <p className="text-muted-foreground">Start practicing and tracking your progress</p>
          </div>

          <div className="glass-premium rounded-2xl p-8 border border-white/5">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full name</label>
                <input type="text" value={form.name} onChange={set("name")} placeholder="Your name" required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email address</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+92..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")}
                    placeholder="Min. 6 characters" required
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all placeholder:text-muted-foreground" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={isLoading}
                className="w-full py-3.5 gradient-btn text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all mt-2">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : "Create free account"}
              </motion.button>

              <p className="text-xs text-center text-muted-foreground">
                By registering you agree to our terms. 100% free, no credit card needed.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login"><span className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">Sign in →</span></Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
