import { Router } from "express";
import { db, adminExamsTable, mcqsTable, chaptersTable, subjectsTable } from "@workspace/db";
import { eq, inArray, and, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/admin/exams", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const exams = await db
    .select()
    .from(adminExamsTable)
    .orderBy(adminExamsTable.createdAt);

  const result = await Promise.all(
    exams.map(async exam => {
      let subjectName: string | null = null;
      if (exam.subjectId) {
        const [s] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, exam.subjectId));
        subjectName = s?.name ?? null;
      }
      return { ...exam, subjectName, questionCount: exam.mcqIds.length };
    })
  );

  res.json(result);
});

router.post("/admin/exams", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { title, description, subjectId, chapterIds, mcqIds, durationMinutes, totalMarks, passMarks, isPublished } = req.body;

  if (!title?.trim()) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  let finalMcqIds: number[] = mcqIds ?? [];

  if (finalMcqIds.length === 0 && (subjectId || (chapterIds && chapterIds.length > 0))) {
    const conditions = [];
    if (subjectId) conditions.push(eq(mcqsTable.subjectId, subjectId));
    if (chapterIds?.length > 0) conditions.push(inArray(mcqsTable.chapterId, chapterIds));
    const available = conditions.length > 0
      ? await db.select({ id: mcqsTable.id }).from(mcqsTable).where(and(...conditions))
      : await db.select({ id: mcqsTable.id }).from(mcqsTable).where(eq(mcqsTable.subjectId, subjectId));
    finalMcqIds = available.map(m => m.id);
  }

  const [exam] = await db.insert(adminExamsTable).values({
    title: title.trim(),
    description: description?.trim() ?? null,
    subjectId: subjectId ?? null,
    chapterIds: chapterIds ?? [],
    mcqIds: finalMcqIds,
    durationMinutes: durationMinutes ?? 60,
    totalMarks: totalMarks ?? 100,
    passMarks: passMarks ?? 50,
    isPublished: isPublished ?? false,
    createdBy: req.userId!,
  }).returning();

  res.status(201).json({ ...exam, questionCount: exam.mcqIds.length });
});

router.get("/admin/exams/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [exam] = await db.select().from(adminExamsTable).where(eq(adminExamsTable.id, id));
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

  const mcqs = exam.mcqIds.length > 0
    ? await db.select().from(mcqsTable).where(inArray(mcqsTable.id, exam.mcqIds))
    : [];

  let subjectName: string | null = null;
  if (exam.subjectId) {
    const [s] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, exam.subjectId));
    subjectName = s?.name ?? null;
  }

  res.json({ ...exam, subjectName, questionCount: exam.mcqIds.length, mcqs });
});

router.patch("/admin/exams/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { title, description, subjectId, chapterIds, mcqIds, durationMinutes, totalMarks, passMarks, isPublished } = req.body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (subjectId !== undefined) updates.subjectId = subjectId;
  if (chapterIds !== undefined) updates.chapterIds = chapterIds;
  if (mcqIds !== undefined) updates.mcqIds = mcqIds;
  if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes;
  if (totalMarks !== undefined) updates.totalMarks = totalMarks;
  if (passMarks !== undefined) updates.passMarks = passMarks;
  if (isPublished !== undefined) updates.isPublished = isPublished;

  const [exam] = await db.update(adminExamsTable).set(updates).where(eq(adminExamsTable.id, id)).returning();
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }
  res.json({ ...exam, questionCount: exam.mcqIds.length });
});

router.delete("/admin/exams/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [exam] = await db.delete(adminExamsTable).where(eq(adminExamsTable.id, id)).returning();
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }
  res.json({ message: "Exam deleted" });
});

router.get("/admin/exams/:id/mcqs", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [exam] = await db.select().from(adminExamsTable).where(eq(adminExamsTable.id, id));
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

  const mcqs = exam.mcqIds.length > 0
    ? await db.select().from(mcqsTable).where(inArray(mcqsTable.id, exam.mcqIds))
    : [];

  res.json(mcqs);
});

router.get("/admin-exams/published", requireAuth, async (_req, res): Promise<void> => {
  const exams = await db
    .select()
    .from(adminExamsTable)
    .where(eq(adminExamsTable.isPublished, true))
    .orderBy(adminExamsTable.createdAt);

  const result = await Promise.all(
    exams.map(async exam => {
      let subjectName: string | null = null;
      if (exam.subjectId) {
        const [s] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, exam.subjectId));
        subjectName = s?.name ?? null;
      }
      return { ...exam, subjectName, questionCount: exam.mcqIds.length };
    })
  );
  res.json(result);
});

router.post("/admin-exams/:id/start", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [exam] = await db.select().from(adminExamsTable).where(and(eq(adminExamsTable.id, id), eq(adminExamsTable.isPublished, true)));
  if (!exam) { res.status(404).json({ error: "Exam not found or not published" }); return; }

  const { examSessionsTable } = await import("@workspace/db");
  const [session] = await db.insert(examSessionsTable).values({
    userId: req.userId!,
    type: "admin_exam",
    status: "active",
    mcqIds: exam.mcqIds,
    chapterIds: exam.chapterIds,
    subjectId: exam.subjectId ?? undefined,
    timeLimitMinutes: exam.durationMinutes,
    startedAt: new Date(),
  }).returning();

  const mcqs = exam.mcqIds.length > 0
    ? await db.select().from(mcqsTable).where(inArray(mcqsTable.id, exam.mcqIds))
    : [];

  res.status(201).json({
    ...session,
    timeLimitMinutes: session.timeLimitMinutes ?? null,
    completedAt: null,
    startedAt: session.startedAt.toISOString(),
    mcqs: mcqs.map(m => ({ ...m, isBookmarked: false, isWrong: false })),
  });
});

export default router;
