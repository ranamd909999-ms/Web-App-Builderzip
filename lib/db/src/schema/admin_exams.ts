import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const adminExamsTable = pgTable("admin_exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id"),
  chapterIds: integer("chapter_ids").array().notNull().default([]),
  mcqIds: integer("mcq_ids").array().notNull().default([]),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  totalMarks: integer("total_marks").notNull().default(100),
  passMarks: integer("pass_marks").notNull().default(50),
  isPublished: boolean("is_published").notNull().default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type AdminExam = typeof adminExamsTable.$inferSelect;
