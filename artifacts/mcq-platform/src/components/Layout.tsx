import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Trophy, BarChart2, Bookmark, XCircle,
  LogOut, User, Shield, ChevronRight, Menu, X, Zap, Bell,
  GraduationCap, FileText, Settings, BellDot, BookMarked
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyNotifications, useMarkNotificationRead } from "@workspace/api-client-react";

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/wrong-answers", label: "Wrong Answers", icon: XCircle },
  { href: "/results", label: "My Results", icon: FileText },
  { href: "/progress", label: "Progress", icon: BarChart2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const adminNav = [
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/chapters", label: "Chapters", icon: GraduationCap },
  { href: "/admin/mcqs", label: "MCQs", icon: Zap },
  { href: "/admin/exams", label: "Exams", icon: BookMarked },
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

function NavLink({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; onClick?: () => void }) {
  const [location] = useLocation();
  const active = location === href || (href !== "/dashboard" && href !== "/admin" && location.startsWith(href));
  return (
    <Link href={href} onClick={onClick}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
        active
          ? "nav-active text-white pl-4"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
      )}>
        <Icon size={16} className={active ? "text-purple-300" : "group-hover:text-foreground transition-colors"} />
        {label}
      </div>
    </Link>
  );
}

function NotificationBell({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifications } = useGetMyNotifications();
  const markRead = useMarkNotificationRead();

  const unread = (notifications ?? []).filter(n => !n.isRead).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    try { await markRead.mutateAsync({ id }); } catch { /* ignore */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
        title="Notifications"
      >
        {unread > 0 ? (
          <>
            <BellDot size={18} className="text-purple-400" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          </>
        ) : (
          <Bell size={18} className="text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 w-72 glass-premium rounded-2xl border border-white/8 shadow-2xl z-[60] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-bold">Notifications</h3>
              {unread > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                  {unread} new
                </span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {(notifications ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell size={24} className="text-muted-foreground opacity-30 mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                (notifications ?? []).map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors",
                      !n.isRead && "bg-purple-500/[0.04]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />}
                      <div className={cn("flex-1", n.isRead && "ml-4")}>
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const nav = isAdmin ? adminNav : studentNav;

  return (
    <div className="flex flex-col h-full"
      style={{ background: "linear-gradient(180deg, hsl(231 25% 3%) 0%, hsl(231 22% 4%) 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

      {/* Logo */}
      <div className="p-5 border-b border-white/[0.04]">
        <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={onClose}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap size={17} className="text-white" />
            </div>
            <div>
              <div className="font-black text-base leading-none">QuizMaster</div>
              <div className="text-[10px] gradient-text font-bold tracking-wider">PRO</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
          <Shield size={12} className="text-purple-400" />
          <span className="text-xs font-bold text-purple-400">Admin Panel</span>
        </div>
      )}

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-2">
        {nav.map(item => (
          <NavLink key={item.href} {...item} onClick={onClose} />
        ))}

        {/* Divider for admin showing student nav too */}
        {isAdmin && (
          <>
            <div className="px-3 pt-4 pb-1">
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">Student View</p>
            </div>
            {studentNav.map(item => (
              <NavLink key={`student-${item.href}`} {...item} onClick={onClose} />
            ))}
          </>
        )}
      </div>

      {/* Bottom user section */}
      <div className="p-3 border-t border-white/[0.04] space-y-1">
        <div className="flex items-center gap-2 px-3 py-1">
          <NotificationBell onClose={onClose} />
          <Link href="/profile" onClick={onClose}>
            <button className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors" title="Profile">
              <Settings size={17} className="text-muted-foreground" />
            </button>
          </Link>
        </div>

        <Link href="/profile" onClick={onClose}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground opacity-50 flex-shrink-0" />
          </div>
        </Link>

        <button
          onClick={() => { logout(); if (onClose) onClose(); }}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0">
        <div className="w-full">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />
            <motion.div
              initial={{ x: -290 }} animate={{ x: 0 }} exit={{ x: -290 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 h-full w-72 z-50 md:hidden">
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.04]"
          style={{ background: "hsl(231 25% 3%)" }}>
          <button onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-black text-sm">QuizMaster <span className="gradient-text">Pro</span></span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl">
            <X size={20} className="opacity-0" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
