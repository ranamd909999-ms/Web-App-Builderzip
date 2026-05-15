import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  targetType: text("target_type").notNull().default("all"),
  targetUserId: integer("target_user_id"),
  targetSubjectId: integer("target_subject_id"),
  isImportant: boolean("is_important").notNull().default(false),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const notificationReadsTable = pgTable("notification_reads", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull(),
  userId: integer("user_id").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export type NotificationRead = typeof notificationReadsTable.$inferSelect;
