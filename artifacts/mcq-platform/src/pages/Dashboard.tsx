import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetDashboardStats, useGetSubjects } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { BarChart2, Flame, Star, Target, BookOpen, ChevronRight, TrendingUp, AlertTriangle, Zap, Trophy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

function StatCard({
  icon: Icon, label, value, sub, gradient, iconColor
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  iconColor: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border card-hover ${gradient}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={20} className="text-white" />
        </div>
        <TrendingUp size={14} className="text-muted-foreground opacity-60" />
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      {sub && <div className="text-xs text-purple-400 mt-1 font-semibold">{sub}</div>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-premium rounded-xl p-3 border border-white/8 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: subjects } = useGetSubjects();
  const firstName = user?.name?.split(" ")[0];

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* ── Header ─── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-black mb-1">
              Welcome back, <span className="gradient-text">{firstName}</span> 👋
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-muted-foreground text-sm">Here's your study summary</motion.p>
          </div>
          <Link href="/exam/start">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 gradient-btn text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/25">
              <Zap size={15} />
              Start Exam
            </motion.button>
          </Link>
        </div>

        {/* ── Stats grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Target} label="Total Attempted" value={stats?.totalMcqsAttempted ?? 0}
            gradient="stat-card-gradient-blue" iconColor="bg-blue-500" />
          <StatCard icon={BarChart2} label="Accuracy" value={`${stats?.accuracy ?? 0}%`}
            sub={stats?.accuracy && stats.accuracy >= 80 ? "Excellent!" : undefined}
            gradient="stat-card-gradient-purple" iconColor="bg-purple-500" />
          <StatCard icon={Flame} label="Day Streak" value={`${stats?.streakDays ?? 0} days`}
            gradient="stat-card-gradient-orange" iconColor="bg-orange-500" />
          <StatCard icon={Star} label="Total Points" value={stats?.totalPoints ?? 0}
            gradient="stat-card-gradient-cyan" iconColor="bg-cyan-500" />
        </div>

        {/* ── Activity + Focus ─── */}
        <div className="grid lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-white/5 bg-card">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                <TrendingUp size={14} className="text-purple-400" />
              </div>
              7-Day Activity
            </h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.recentActivity}>
                  <defs>
                    <linearGradient id="colorAttempted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220 10% 55%)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mcqsAttempted" stroke="#7c3aed" fill="url(#colorAttempted)" strokeWidth={2} name="Attempted" />
                  <Area type="monotone" dataKey="correctAnswers" stroke="#06b6d4" fill="url(#colorCorrect)" strokeWidth={2} name="Correct" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-purple-400 opacity-50" />
                </div>
                <p className="text-muted-foreground text-sm">No activity yet. Start practicing to see your progress!</p>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl border border-white/5 bg-card">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
                <AlertTriangle size={14} className="text-yellow-400" />
              </div>
              Focus Areas
            </h2>
            {stats?.weakChapters && stats.weakChapters.length > 0 ? (
              <div className="space-y-4">
                {stats.weakChapters.map(ch => (
                  <div key={ch.chapterId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{ch.chapterName}</p>
                        <p className="text-xs text-muted-foreground">{ch.subjectName}</p>
                      </div>
                      <span className={`text-xs font-bold ml-3 ${ch.accuracy < 50 ? "text-red-400" : "text-yellow-400"}`}>
                        {Math.round(ch.accuracy)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${ch.accuracy}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`h-full rounded-full ${ch.accuracy < 50 ? "bg-red-500" : "bg-yellow-500"}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Trophy size={28} className="text-yellow-400 opacity-40 mb-2" />
                <p className="text-sm text-muted-foreground">Practice some MCQs to see which chapters need attention.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Subjects ─── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">Continue Learning</h2>
            <Link href="/subjects">
              <span className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 font-semibold">
                View all <ChevronRight size={14} />
              </span>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(subjects ?? []).filter(s => s.isActive).slice(0, 4).map((subject, i) => (
              <motion.div key={subject.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}>
                <Link href={`/subjects/${subject.id}`}>
                  <div className="group p-5 rounded-2xl border border-white/5 bg-card card-hover hover-glow-purple cursor-pointer">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                      style={{ background: subject.color + "20", border: `1px solid ${subject.color}40` }}>
                      <BookOpen size={20} style={{ color: subject.color }} />
                    </div>
                    <h3 className="font-bold mb-1 group-hover:text-purple-300 transition-colors">{subject.name}</h3>
                    {subject.level && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                        {subject.level}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{subject.chapterCount} chapters</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{subject.mcqCount} MCQs</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Subject performance bars ─── */}
        {stats?.subjectProgress && stats.subjectProgress.length > 0 && (
          <div className="p-6 rounded-2xl border border-white/5 bg-card">
            <h2 className="font-bold text-base mb-6 flex items-center gap-2">
              <BarChart2 size={16} className="text-purple-400" />
              Subject Performance
            </h2>
            <div className="space-y-5">
              {stats.subjectProgress.map((sp, i) => (
                <div key={sp.subjectId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{sp.subjectName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{sp.attempted}/{sp.total} attempted</span>
                      <span className={`text-sm font-bold ${sp.accuracy >= 80 ? "text-green-400" : sp.accuracy >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {sp.accuracy}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${sp.accuracy}%` }}
                      transition={{ duration: 0.9, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: sp.accuracy >= 80 ? "linear-gradient(90deg, #22c55e, #16a34a)" : sp.accuracy >= 60 ? "linear-gradient(90deg, #eab308, #ca8a04)" : "linear-gradient(90deg, #ef4444, #dc2626)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
