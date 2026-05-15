import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap, BookOpen, Trophy, BarChart2, Shield, CheckCircle,
  ArrowRight, Star, Brain, Target, Flame, Users, ChevronRight,
  Sparkles, GraduationCap, Award
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Chapter-wise Practice", desc: "Drill MCQs by subject and chapter with instant feedback and explanations.", gradient: "from-blue-500 to-indigo-600" },
  { icon: Zap, title: "Timed Exam Mode", desc: "Simulate real exam pressure with auto-submitting timed sessions.", gradient: "from-purple-500 to-pink-600" },
  { icon: BarChart2, title: "Smart Analytics", desc: "Track accuracy, identify weak chapters, and monitor your daily streak.", gradient: "from-cyan-500 to-blue-600" },
  { icon: Trophy, title: "Live Leaderboard", desc: "Compete with students across all subjects and climb the rankings.", gradient: "from-yellow-500 to-orange-600" },
  { icon: Brain, title: "AI-Powered Review", desc: "Automatically bookmark every mistake and retry until mastered.", gradient: "from-pink-500 to-rose-600" },
  { icon: Target, title: "Custom Exams", desc: "Pick any combination of chapters and build your own exam set.", gradient: "from-green-500 to-emerald-600" },
];

const stats = [
  { value: "10,000+", label: "Questions", icon: BookOpen },
  { value: "2,500+", label: "Students", icon: Users },
  { value: "50+", label: "Subjects", icon: GraduationCap },
  { value: "98%", label: "Score Improved", icon: Award },
];

const steps = [
  { step: "01", title: "Choose your subject", desc: "Browse subjects and chapters, then pick exactly what you want to master.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  { step: "02", title: "Practice or take exams", desc: "Work through MCQs with instant explanations, or run a full timed exam.", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
  { step: "03", title: "Review and improve", desc: "Check results, review wrong answers, and focus on your weakest areas.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
];

const testimonials = [
  { name: "Sarah Ahmed", role: "Medical Aspirant", text: "QuizMaster Pro helped me score 94% in my MDCAT prep. The chapter-wise practice is absolutely essential.", avatar: "S" },
  { name: "Ali Hassan", role: "Engineering Student", text: "I went from 68% to 89% accuracy in just 6 weeks. The analytics show exactly where to focus.", avatar: "A" },
  { name: "Fatima Khan", role: "FSc Student", text: "The timed exam mode is so realistic. By exam day I was completely calm because I had practiced under pressure.", avatar: "F" },
];

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold gradient-text"
      >
        {value}
      </motion.div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-premium border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">QuizMaster <span className="gradient-text">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</button>
            </Link>
            <Link href="/register">
              <button className="px-5 py-2 gradient-btn text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/25">
                Get started free
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-purple w-[600px] h-[600px] -top-32 -right-32 animate-orb-drift opacity-60" />
        <div className="orb orb-cyan w-[400px] h-[400px] bottom-0 -left-24 animate-float-slow opacity-50" />
        <div className="orb orb-blue w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 opacity-30" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00di0yaC0ydjJoMnptLTQgNHYyaC0ydi0yaDJ6bTAtNHYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8"
            >
              <Sparkles size={13} className="animate-pulse" />
              Pakistan's #1 MCQ Learning Platform
              <Sparkles size={13} className="animate-pulse" />
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-7">
              Master Every Exam
              <br />
              <span className="gradient-text">with Precision</span>
              <br />
              Learning
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Chapter-wise MCQ practice, AI-powered analytics, and realistic exam simulations.
              Trusted by <strong className="text-foreground">2,500+ students</strong> preparing for FSc, Matric, MDCAT, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-9 py-4 gradient-btn text-white font-bold rounded-2xl shadow-xl shadow-purple-500/30 text-base">
                  Start Practicing Free
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-9 py-4 border border-white/10 glass-card text-foreground font-semibold rounded-2xl text-base hover:border-white/20 transition-colors">
                  Sign in
                  <ChevronRight size={18} />
                </motion.button>
              </Link>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {["Free to start", "No credit card", "Instant access", "All subjects"].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-400" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────── */}
      <section className="py-16 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-premium rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 border border-white/5">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <AnimatedCounter value={s.value} />
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-4">
                FEATURES
              </div>
              <h2 className="text-4xl font-black mb-4">Everything you need to <span className="gradient-text">score higher</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">Every feature is built around one goal — making your study time count.</p>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl border border-white/5 bg-card card-hover hover-glow-purple cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        <div className="orb orb-purple w-[500px] h-[500px] -left-48 top-0 opacity-25" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl font-black mb-4">Ready in <span className="gradient-text">3 simple steps</span></h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center">
                <div className={`w-16 h-16 rounded-2xl border ${s.bg} flex items-center justify-center mx-auto mb-5`}>
                  <span className={`text-xl font-black ${s.color}`}>{s.step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
                <h3 className="font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-semibold mb-4">
              STUDENT REVIEWS
            </div>
            <h2 className="text-4xl font-black mb-4">Loved by <span className="gradient-text">top students</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl glass-premium border border-white/5 card-hover">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(6,182,212,0.15) 100%)", border: "1px solid rgba(124,58,237,0.3)" }}>
            <div className="orb orb-purple w-72 h-72 -top-16 -right-16 opacity-50" />
            <div className="orb orb-cyan w-64 h-64 -bottom-16 -left-16 opacity-40" />
            <div className="relative">
              <h2 className="text-4xl font-black mb-4">Ready to <span className="gradient-text">ace your exams?</span></h2>
              <p className="text-muted-foreground text-lg mb-8">Join thousands of students already studying smarter with QuizMaster Pro.</p>
              <Link href="/register">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-10 py-4 gradient-btn text-white font-bold rounded-2xl shadow-xl shadow-purple-500/30 text-base">
                  Create free account
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-bold">QuizMaster Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 QuizMaster Pro. Built for serious learners.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login"><span className="hover:text-foreground transition-colors cursor-pointer">Sign in</span></Link>
            <Link href="/register"><span className="hover:text-foreground transition-colors cursor-pointer">Register</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
