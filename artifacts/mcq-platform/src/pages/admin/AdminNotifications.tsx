import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useGetNotifications, useCreateNotification, useDeleteNotification, useUpdateNotification } from "@workspace/api-client-react";
import type { Notification } from "@workspace/api-client-react";
import {
  Bell, Plus, Trash2, Pencil, X, Send, Users, Globe, AlertTriangle,
  CheckCircle, Info, Star, Clock, BellDot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TYPES = [
  { value: "info", label: "Info", icon: Info, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { value: "success", label: "Success", icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { value: "alert", label: "Alert", icon: BellDot, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
];

const TARGETS = [
  { value: "all", label: "All Users", icon: Globe, desc: "Send to every registered user" },
  { value: "user", label: "Specific User", icon: Users, desc: "Send to a specific user by ID" },
];

type NotifForm = {
  title: string;
  message: string;
  type: string;
  targetType: string;
  targetUserId: string;
  isImportant: boolean;
  scheduledAt: string;
};

const defaultForm: NotifForm = {
  title: "",
  message: "",
  type: "info",
  targetType: "all",
  targetUserId: "",
  isImportant: false,
  scheduledAt: "",
};

function TypeIcon({ type }: { type: string }) {
  const t = TYPES.find(t => t.value === type) ?? TYPES[0];
  return (
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", t.bg)}>
      <t.icon size={15} className={t.color} />
    </div>
  );
}

function NotifModal({
  notif, onClose, onSave
}: {
  notif?: Notification | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<NotifForm>(
    notif
      ? {
          title: notif.title,
          message: notif.message,
          type: notif.type,
          targetType: notif.targetType,
          targetUserId: notif.targetUserId?.toString() ?? "",
          isImportant: notif.isImportant,
          scheduledAt: notif.scheduledAt ? new Date(notif.scheduledAt).toISOString().slice(0, 16) : "",
        }
      : defaultForm
  );

  const createMut = useCreateNotification();
  const updateMut = useUpdateNotification();
  const isPending = createMut.isPending || updateMut.isPending;

  const set = (key: keyof NotifForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: "Missing fields", description: "Title and message are required.", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        targetType: form.targetType,
        targetUserId: form.targetType === "user" && form.targetUserId ? parseInt(form.targetUserId) : undefined,
        isImportant: form.isImportant,
        scheduledAt: form.scheduledAt || undefined,
      };
      if (notif) {
        await updateMut.mutateAsync({ id: notif.id, data: payload });
        toast({ title: "Notification updated" });
      } else {
        await createMut.mutateAsync({ data: payload });
        toast({ title: "Notification sent!", description: `"${form.title}" delivered successfully.` });
      }
      onSave();
      onClose();
    } catch {
      toast({ title: "Failed to send", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const selectedType = TYPES.find(t => t.value === form.type) ?? TYPES[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-premium rounded-2xl p-7 max-w-lg w-full border border-white/8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center">
              <Bell size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-black">{notif ? "Edit Notification" : "Send Notification"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.04] text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-bold mb-2">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={cn("py-2 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all", form.type === t.value ? t.bg : "border-white/8 hover:border-white/15")}>
                  <t.icon size={14} className={form.type === t.value ? t.color : "text-muted-foreground"} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-2">Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={set("title")} placeholder="Notification title…"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 placeholder:text-muted-foreground transition-all" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold mb-2">Message <span className="text-red-400">*</span></label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write your notification message here…" rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 placeholder:text-muted-foreground transition-all resize-none" />
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-bold mb-2">Target Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {TARGETS.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, targetType: t.value }))}
                  className={cn("p-3 rounded-xl border text-left transition-all", form.targetType === t.value ? "border-purple-500/40 bg-purple-500/10" : "border-white/8 hover:border-white/15")}>
                  <t.icon size={14} className={form.targetType === t.value ? "text-purple-400" : "text-muted-foreground"} />
                  <p className="text-xs font-bold mt-1">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
            {form.targetType === "user" && (
              <input type="number" value={form.targetUserId} onChange={set("targetUserId")} placeholder="User ID…" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 mt-2 placeholder:text-muted-foreground transition-all" />
            )}
          </div>

          {/* Schedule + Important */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-1"><Clock size={13} /> Schedule (optional)</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={set("scheduledAt")}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 flex items-center gap-1"><Star size={13} /> Mark Important</label>
              <button onClick={() => setForm(f => ({ ...f, isImportant: !f.isImportant }))}
                className={cn("w-full py-2.5 rounded-xl border text-sm font-semibold transition-all", form.isImportant ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" : "border-white/8 text-muted-foreground hover:border-white/15")}>
                {form.isImportant ? "⭐ Important" : "Mark important"}
              </button>
            </div>
          </div>

          {/* Preview */}
          {form.title && (
            <div className={cn("p-4 rounded-xl border flex gap-3", selectedType.bg)}>
              <TypeIcon type={form.type} />
              <div>
                <p className="text-sm font-bold">{form.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{form.message || "No message yet…"}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/8 hover:bg-white/[0.04] text-sm transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
            {isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : <><Send size={14} /> {notif ? "Save Changes" : "Send Now"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminNotifications() {
  const { toast } = useToast();
  const { data: notifications, isLoading, refetch } = useGetNotifications();
  const deleteMut = useDeleteNotification();
  const [modal, setModal] = useState<{ open: boolean; notif?: Notification | null }>({ open: false });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this notification? It will be removed for all users.")) return;
    try {
      await deleteMut.mutateAsync({ id });
      toast({ title: "Notification deleted" });
      refetch();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const typeInfo = (type: string) => TYPES.find(t => t.value === type) ?? TYPES[0];

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Bell size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Notifications</h1>
              <p className="text-muted-foreground text-sm">Send alerts and announcements to students</p>
            </div>
          </div>
          <button onClick={() => setModal({ open: true, notif: null })}
            className="flex items-center gap-2 px-5 py-2.5 gradient-btn text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/25">
            <Plus size={15} /> New Notification
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Sent", value: notifications?.length ?? 0, color: "stat-card-gradient-purple" },
            { label: "Important", value: notifications?.filter(n => n.isImportant).length ?? 0, color: "stat-card-gradient-orange" },
            { label: "Scheduled", value: notifications?.filter(n => n.scheduledAt && new Date(n.scheduledAt) > new Date()).length ?? 0, color: "stat-card-gradient-cyan" },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.color}`}>
              <div className="text-3xl font-black">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-card border border-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {(notifications ?? []).length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Bell size={44} className="mx-auto mb-3 opacity-20" />
                <p className="font-semibold">No notifications yet</p>
                <p className="text-sm mt-1">Create your first notification to reach students</p>
              </div>
            )}
            {(notifications ?? []).map((n, i) => {
              const t = typeInfo(n.type);
              return (
                <motion.div key={n.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-card card-hover">
                  <TypeIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold">{n.title}</p>
                      {n.isImportant && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">⭐ Important</span>
                      )}
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-semibold", t.bg, t.color)}>
                        {t.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/8">
                        {n.targetType === "all" ? "All users" : `User #${n.targetUserId}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/60">
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      {n.scheduledAt && new Date(n.scheduledAt) > new Date() && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Clock size={10} /> Scheduled: {new Date(n.scheduledAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setModal({ open: true, notif: n })}
                      className="p-2 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(n.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {modal.open && (
        <NotifModal
          notif={modal.notif}
          onClose={() => setModal({ open: false })}
          onSave={refetch}
        />
      )}
    </Layout>
  );
}
