import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAdminGetStats } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import {
  Users, BookOpen, Zap, BarChart2, Shield, ChevronRight,
  Bell, TrendingUp, Award, Database
} from "lucide-react";

function AdminStatCard({
  icon: Icon, label, value, href, gradient, iconBg
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  href?: string;
  gradient: string;
  iconBg: string;
}) {
  const content = (
    <div className={`p-6 rounded-2xl border card-hover ${gradient} ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={22} className="text-white" />
        </div>
        {href && <ChevronRight size={16} className="text-muted-foreground opacity-60" />}
      </div>
      <div className="text-4xl font-black mb-1">{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
  return href ? <Link href={href}><div>{content}</div></Link> : <div>{content}</div>;
}

const quickLinks = [
  { href: "/admin/subjects", label: "Manage Subjects", desc: "Add, edit or remove subjects", icon: BookOpen, gradient: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/15 hover:border-blue-500/30", iconColor: "text-blue-400" },
  { href: "/admin/chapters", label: "Manage Chapters", desc: "Organize chapters within subjects", icon: Database, gradient: "from-purple-500/10 to-purple-600/5", border: "border-purple-500/15 hover:border-purple-500/30", iconColor: "text-purple-400" },
  { href: "/admin/mcqs", label: "Manage MCQs", desc: "Add, edit or bulk import questions", icon: Zap, gradient: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/15 hover:border-cyan-500/30", iconColor: "text-cyan-400" },
  { href: "/admin/users", label: "Manage Users", desc: "View and manage student accounts", icon: Users, gradient: "from-green-500/10 to-green-600/5", border: "border-green-500/15 hover:border-green-500/30", iconColor: "text-green-400" },
  { href: "/admin/reports", label: "Analytics & Reports", desc: "Platform-wide analytics and insights", icon: BarChart2, gradient: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/15 hover:border-orange-500/30", iconColor: "text-orange-400" },
  { href: "/admin/notifications", label: "Notifications", desc: "Send alerts and announcements", icon: Bell, gradient: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/15 hover:border-pink-500/30", iconColor: "text-pink-400" },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminGetStats();

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Platform overview and management</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl border border-white/5 bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Students", value: stats?.totalStudents ?? 0, href: "/admin/users", gradient: "stat-card-gradient-blue", iconBg: "bg-blue-500" },
                { icon: BookOpen, label: "Subjects", value: stats?.totalSubjects ?? 0, href: "/admin/subjects", gradient: "stat-card-gradient-purple", iconBg: "bg-purple-500" },
                { icon: Database, label: "Chapters", value: stats?.totalChapters ?? 0, href: "/admin/chapters", gradient: "stat-card-gradient-cyan", iconBg: "bg-cyan-500" },
                { icon: Zap, label: "MCQs", value: stats?.totalMcqs ?? 0, href: "/admin/mcqs", gradient: "stat-card-gradient-green", iconBg: "bg-green-500" },
                { icon: TrendingUp, label: "Total Exams", value: stats?.totalExams ?? 0, gradient: "stat-card-gradient-orange", iconBg: "bg-orange-500" },
                { icon: Award, label: "Premium Users", value: stats?.premiumUsers ?? 0, gradient: "stat-card-gradient-pink", iconBg: "bg-pink-500" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <AdminStatCard {...s} />
                </motion.div>
              ))}
            </div>

            {/* Quick links */}
            <div>
              <h2 className="font-bold text-lg mb-5">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickLinks.map((link, i) => (
                  <motion.div key={link.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link href={link.href}>
                      <div className={`group p-5 rounded-2xl border bg-gradient-to-br ${link.gradient} ${link.border} card-hover cursor-pointer transition-all`}>
                        <div className="flex items-center justify-between mb-3">
                          <link.icon size={20} className={`${link.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                          <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="font-bold mb-1 group-hover:text-white transition-colors">{link.label}</h3>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
