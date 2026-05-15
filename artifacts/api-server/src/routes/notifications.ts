import { Router } from "express";
import { db, notificationsTable, notificationReadsTable } from "@workspace/db";
import { eq, and, inArray, sql, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/notifications", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));
  res.json(notifications);
});

router.post("/notifications", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { title, message, type, targetType, targetUserId, targetSubjectId, isImportant, scheduledAt } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: "Title and message are required" });
    return;
  }
  const [notification] = await db.insert(notificationsTable).values({
    title: (title as string).trim(),
    message: (message as string).trim(),
    type: (type as string) ?? "info",
    targetType: (targetType as string) ?? "all",
    targetUserId: (targetUserId as number) ?? null,
    targetSubjectId: (targetSubjectId as number) ?? null,
    isImportant: (isImportant as boolean) ?? false,
    scheduledAt: scheduledAt ? new Date(scheduledAt as string) : null,
    createdBy: req.userId!,
  }).returning();
  res.status(201).json(notification);
});

router.patch("/notifications/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { title, message, type, isImportant } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (message !== undefined) updates.message = message;
  if (type !== undefined) updates.type = type;
  if (isImportant !== undefined) updates.isImportant = isImportant;

  const [notification] = await db.update(notificationsTable).set(updates).where(eq(notificationsTable.id, id)).returning();
  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(notification);
});

router.delete("/notifications/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(notificationReadsTable).where(eq(notificationReadsTable.notificationId, id));
  const [notification] = await db.delete(notificationsTable).where(eq(notificationsTable.id, id)).returning();
  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json({ message: "Notification deleted" });
});

router.get("/notifications/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const now = new Date();

  const allNotifications = await db
    .select()
    .from(notificationsTable)
    .where(
      sql`(${notificationsTable.targetType} = 'all' OR ${notificationsTable.targetUserId} = ${userId}) AND (${notificationsTable.scheduledAt} IS NULL OR ${notificationsTable.scheduledAt} <= ${now})`
    )
    .orderBy(desc(notificationsTable.createdAt))
    .limit(30);

  if (allNotifications.length === 0) {
    res.json([]);
    return;
  }

  const notifIds = allNotifications.map(n => n.id);
  const reads = await db
    .select()
    .from(notificationReadsTable)
    .where(and(eq(notificationReadsTable.userId, userId), inArray(notificationReadsTable.notificationId, notifIds)));

  const readSet = new Set(reads.map(r => r.notificationId));

  const result = allNotifications.map(n => ({
    ...n,
    isRead: readSet.has(n.id),
  }));

  res.json(result);
});

router.post("/notifications/:id/read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const notifId = parseInt(req.params.id as string, 10);
  const userId = req.userId!;

  const existing = await db
    .select()
    .from(notificationReadsTable)
    .where(and(eq(notificationReadsTable.notificationId, notifId), eq(notificationReadsTable.userId, userId)));

  if (existing.length === 0) {
    await db.insert(notificationReadsTable).values({ notificationId: notifId, userId });
  }
  res.json({ message: "Marked as read" });
});

router.get("/notifications/me/unread-count", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const now = new Date();

  const [{ count: totalCount }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(notificationsTable)
    .where(
      sql`(${notificationsTable.targetType} = 'all' OR ${notificationsTable.targetUserId} = ${userId}) AND (${notificationsTable.scheduledAt} IS NULL OR ${notificationsTable.scheduledAt} <= ${now})`
    );

  const [{ count: readCount }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(notificationReadsTable)
    .where(eq(notificationReadsTable.userId, userId));

  res.json({ unreadCount: Math.max(0, totalCount - readCount) });
});

export default router;
