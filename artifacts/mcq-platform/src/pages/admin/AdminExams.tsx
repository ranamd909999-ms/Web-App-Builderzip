import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminListExams,
  useAdminCreateExam,
  useAdminUpdateExam,
  useAdminDeleteExam,
  useAdminGetExam,
  useGetSubjects,
  useGetChapters,
  useGetMcqs,
  getAdminGetExamQueryKey,
  getGetChaptersQueryKey,
  getGetMcqsQueryKey,
} from "@workspace/api-client-react";
import type { AdminExam, AdminExamInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Clock, Target, Award, BookOpen, X, Check, ChevronRight,
  ChevronLeft, Zap, Filter, CheckSquare, Square, BookMarked,
  AlertTriangle, Shield, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface ExamFormData {
  title: string;
  description: string;
  subjectId: number | null;
  chapterIds: number[];
  mcqIds: number[];
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  isPublished: boolean;
}

const EMPTY_FORM: ExamFormData = {
  title: "",
  description: "",
  subjectId: null,
  chapterIds: [],
  mcqIds: [],
  durationMinutes: 60,
  totalMarks: 100,
  passMarks: 50,
  isPublished: false,
};

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
      published ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
    )}>
      {published ? <Check size={10} /> : <EyeOff size={10} />}
      {published ? "Published" : "Draft"}
    </span>
  );
}

function ExamCard({ exam, onEdit, onDelete, onTogglePublish }: {
  exam: AdminExam & { questionCount: number };
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass-card rounded-2xl border border-white/8 p-5 card-hover group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusBadge published={exam.isPublished} />
            {exam.subjectName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/15 text-purple-400 border border-purple-500/20">
                <BookOpen size={9} />
                {exam.subjectName}
              </span>
            )}
          </div>
          <h3 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">
            {exam.title}
          </h3>
          {exam.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={onTogglePublish}
            title={exam.isPublished ? "Unpublish" : "Publish"}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              exam.isPublished
                ? "bg-green-500/10 hover:bg-green-500/20 text-green-400"
                : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400"
            )}
          >
            {exam.isPublished ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          </button>
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-all"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-400 mb-0.5">
            <Zap size={12} />
            <span className="font-bold text-sm">{exam.questionCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">Questions</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
            <Clock size={12} />
            <span className="font-bold text-sm">{exam.durationMinutes}m</span>
          </div>
          <p className="text-xs text-muted-foreground">Duration</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-0.5">
            <Target size={12} />
            <span className="font-bold text-sm">{exam.passMarks}/{exam.totalMarks}</span>
          </div>
          <p className="text-xs text-muted-foreground">Pass/Total</p>
        </div>
      </div>
    </motion.div>
  );
}

function StepDot({ step, current, label }: { step: number; current: Step; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
        done ? "bg-green-500 text-white" : active ? "gradient-btn text-white shadow-lg shadow-purple-500/30" : "bg-white/8 text-muted-foreground"
      )}>
        {done ? <Check size={14} /> : step}
      </div>
      <span className={cn("text-xs font-medium", active ? "text-white" : "text-muted-foreground")}>{label}</span>
    </div>
  );
}

function ExamModal({
  initial,
  examId,
  onClose,
}: {
  initial?: Partial<ExamFormData>;
  examId?: number;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ExamFormData>({ ...EMPTY_FORM, ...initial });
  const [mcqSearch, setMcqSearch] = useState("");
  const [mcqChapterFilter, setMcqChapterFilter] = useState<number | null>(null);

  const { data: examDetail } = useAdminGetExam(examId!, {
    query: { queryKey: getAdminGetExamQueryKey(examId!), enabled: !!examId },
  });
  const { data: subjects = [] } = useGetSubjects();
  const { data: chaptersData } = useGetChapters(form.subjectId!, {
    query: { queryKey: getGetChaptersQueryKey(form.subjectId!), enabled: !!form.subjectId },
  });
  const chapters = chaptersData ?? [];
  const mcqParams = {
    subjectId: form.subjectId ?? undefined,
    chapterId: mcqChapterFilter ?? undefined,
  };
  const { data: mcqResponse } = useGetMcqs(mcqParams, {
    query: { queryKey: getGetMcqsQueryKey(mcqParams), enabled: !!form.subjectId },
  });
  const allMcqs = mcqResponse?.mcqs ?? [];

  useEffect(() => {
    if (examDetail && examId) {
      setForm({
        title: examDetail.title,
        description: examDetail.description ?? "",
        subjectId: examDetail.subjectId ?? null,
        chapterIds: examDetail.chapterIds ?? [],
        mcqIds: examDetail.mcqIds ?? [],
        durationMinutes: examDetail.durationMinutes,
        totalMarks: examDetail.totalMarks,
        passMarks: examDetail.passMarks,
        isPublished: examDetail.isPublished,
      });
    }
  }, [examDetail, examId]);

  const createExam = useAdminCreateExam({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/exams"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: "Exam created successfully!" });
        onClose();
      },
      onError: () => toast({ title: "Failed to create exam", variant: "destructive" }),
    },
  });

  const updateExam = useAdminUpdateExam({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/exams"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: "Exam updated successfully!" });
        onClose();
      },
      onError: () => toast({ title: "Failed to update exam", variant: "destructive" }),
    },
  });

  const handleSubmit = (publish?: boolean) => {
    const payload: AdminExamInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      subjectId: form.subjectId ?? undefined,
      chapterIds: form.chapterIds,
      mcqIds: form.mcqIds,
      durationMinutes: form.durationMinutes,
      totalMarks: form.totalMarks,
      passMarks: form.passMarks,
      isPublished: publish !== undefined ? publish : form.isPublished,
    };

    if (examId) {
      updateExam.mutate({ id: examId, data: payload });
    } else {
      createExam.mutate({ data: payload });
    }
  };

  const filteredMcqs = allMcqs.filter(m =>
    !mcqSearch || m.question.toLowerCase().includes(mcqSearch.toLowerCase())
  );

  const toggleMcq = (id: number) => {
    setForm(f => ({
      ...f,
      mcqIds: f.mcqIds.includes(id) ? f.mcqIds.filter(x => x !== id) : [...f.mcqIds, id],
    }));
  };

  const selectAll = () => setForm(f => ({
    ...f,
    mcqIds: [...new Set([...f.mcqIds, ...filteredMcqs.map(m => m.id)])],
  }));

  const deselectAll = () => setForm(f => ({
    ...f,
    mcqIds: f.mcqIds.filter(id => !filteredMcqs.some(m => m.id === id)),
  }));

  const isLoading = createExam.isPending || updateExam.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl glass-premium rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/25">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-lg">{examId ? "Edit Exam" : "Create Exam"}</h2>
              <p className="text-xs text-muted-foreground">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-muted-foreground hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/8 shrink-0">
          {[
            { step: 1, label: "Basic Info" },
            { step: 2, label: "Settings" },
            { step: 3, label: "Questions" },
            { step: 4, label: "Review" },
          ].map(({ step: s, label }, i) => (
            <div key={s} className="flex items-center flex-1">
              <button
                className="flex flex-col items-center gap-1"
                onClick={() => s < step && setStep(s as Step)}
              >
                <StepDot step={s} current={step} label={label} />
              </button>
              {i < 3 && <div className={cn("flex-1 h-0.5 mx-2 rounded-full transition-colors", step > s ? "bg-green-500" : "bg-white/10")} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Exam Title <span className="text-red-400">*</span></label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all placeholder:text-muted-foreground"
                    placeholder="e.g. Biology Mid-Term 2025"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all placeholder:text-muted-foreground resize-none"
                    placeholder="Optional description or instructions for students..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Subject</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                    value={form.subjectId ?? ""}
                    onChange={e => setForm(f => ({
                      ...f,
                      subjectId: e.target.value ? parseInt(e.target.value) : null,
                      chapterIds: [],
                      mcqIds: [],
                    }))}
                  >
                    <option value="">— Select a subject —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                {chapters.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Chapters (optional — leave empty to include all)</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {chapters.map(c => {
                        const selected = form.chapterIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setForm(f => ({
                              ...f,
                              chapterIds: selected ? f.chapterIds.filter(x => x !== c.id) : [...f.chapterIds, c.id],
                            }))}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left",
                              selected
                                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                                : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                            )}
                          >
                            {selected ? <CheckSquare size={12} className="shrink-0" /> : <Square size={12} className="shrink-0" />}
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Clock size={14} className="inline mr-1.5 text-orange-400" />
                    Duration (minutes)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min={5} max={240} step={5}
                      value={form.durationMinutes}
                      onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) }))}
                      className="flex-1 accent-purple-500"
                    />
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold w-20 text-center">
                      {form.durationMinutes}m
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 min</span><span>240 min</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <Award size={14} className="inline mr-1.5 text-cyan-400" />
                      Total Marks
                    </label>
                    <input
                      type="number" min={1}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                      value={form.totalMarks}
                      onChange={e => setForm(f => ({ ...f, totalMarks: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      <Target size={14} className="inline mr-1.5 text-green-400" />
                      Pass Marks
                    </label>
                    <input
                      type="number" min={1}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                      value={form.passMarks}
                      onChange={e => setForm(f => ({ ...f, passMarks: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {form.passMarks > form.totalMarks && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertTriangle size={14} />
                    Pass marks cannot exceed total marks
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/3 border border-white/8">
                  <h4 className="text-sm font-bold mb-3">Summary</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/15">
                      <div className="text-lg font-black text-orange-400">{form.durationMinutes}</div>
                      <div className="text-xs text-muted-foreground">Minutes</div>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
                      <div className="text-lg font-black text-cyan-400">{form.totalMarks}</div>
                      <div className="text-xs text-muted-foreground">Total Marks</div>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/15">
                      <div className="text-lg font-black text-green-400">{form.passMarks}</div>
                      <div className="text-xs text-muted-foreground">Pass Marks</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                {!form.subjectId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BookOpen size={40} className="opacity-30 mb-3" />
                    <p className="text-sm">Please select a subject first (Step 1)</p>
                    <button onClick={() => setStep(1)} className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">Go back to Step 1</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative flex-1 min-w-48">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-muted-foreground"
                          placeholder="Search questions..."
                          value={mcqSearch}
                          onChange={e => setMcqSearch(e.target.value)}
                        />
                      </div>
                      {chapters.length > 0 && (
                        <select
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                          value={mcqChapterFilter ?? ""}
                          onChange={e => setMcqChapterFilter(e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">All chapters</option>
                          {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-bold text-white">{form.mcqIds.length}</span> selected / {allMcqs.length} total
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/20 transition-all"
                        >
                          Select All Visible
                        </button>
                        <button
                          type="button"
                          onClick={deselectAll}
                          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10 transition-all"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {filteredMcqs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">No questions found</div>
                      ) : filteredMcqs.map(mcq => {
                        const selected = form.mcqIds.includes(mcq.id);
                        return (
                          <button
                            key={mcq.id}
                            type="button"
                            onClick={() => toggleMcq(mcq.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-xl border transition-all flex gap-3 items-start",
                              selected
                                ? "bg-purple-500/15 border-purple-500/35 text-white"
                                : "bg-white/3 border-white/8 text-muted-foreground hover:border-white/15 hover:text-white"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all",
                              selected ? "bg-purple-500 border-purple-500" : "border-white/30"
                            )}>
                              {selected && <Check size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs leading-relaxed line-clamp-2">{mcq.question}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="p-5 rounded-2xl bg-white/3 border border-white/8 space-y-3">
                  <h3 className="font-bold text-base">{form.title}</h3>
                  {form.description && <p className="text-sm text-muted-foreground">{form.description}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/8">
                    <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/15">
                      <div className="font-black text-xl text-purple-400">{form.mcqIds.length}</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/15">
                      <div className="font-black text-xl text-orange-400">{form.durationMinutes}m</div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
                      <div className="font-black text-xl text-cyan-400">{form.totalMarks}</div>
                      <div className="text-xs text-muted-foreground">Total Marks</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/15">
                      <div className="font-black text-xl text-green-400">{form.passMarks}</div>
                      <div className="text-xs text-muted-foreground">Pass Marks</div>
                    </div>
                  </div>

                  {subjects.find(s => s.id === form.subjectId) && (
                    <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/8">
                      <BookOpen size={13} className="text-purple-400" />
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-semibold">{subjects.find(s => s.id === form.subjectId)?.name}</span>
                    </div>
                  )}
                </div>

                {form.mcqIds.length === 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                    <AlertTriangle size={14} />
                    No questions selected. The exam will be saved with 0 questions.
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/3 border border-white/8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                      className={cn(
                        "relative w-12 h-6 rounded-full transition-all",
                        form.isPublished ? "bg-green-500" : "bg-white/15"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        form.isPublished ? "left-7" : "left-1"
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{form.isPublished ? "Publish immediately" : "Save as draft"}</p>
                      <p className="text-xs text-muted-foreground">
                        {form.isPublished ? "Students can see and take this exam" : "Only admins can see this exam"}
                      </p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/8 shrink-0">
          <button
            onClick={() => step > 1 ? setStep(s => (s - 1) as Step) : onClose()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all"
          >
            <ChevronLeft size={15} />
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 4 ? (
            <button
              disabled={step === 1 && !form.title.trim()}
              onClick={() => setStep(s => (s + 1) as Step)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              Next
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              disabled={!form.title.trim() || isLoading || form.passMarks > form.totalMarks}
              onClick={() => handleSubmit()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Check size={15} />}
              {examId ? "Save Changes" : "Create Exam"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DeleteModal({ exam, onClose, onConfirm }: { exam: AdminExam; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md glass-premium rounded-2xl border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-base">Delete Exam</h3>
            <p className="text-xs text-muted-foreground">This cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Are you sure you want to delete <span className="font-bold text-white">"{exam.title}"</span>? This action is permanent.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminExams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editExam, setEditExam] = useState<AdminExam | null>(null);
  const [deleteExam, setDeleteExam] = useState<AdminExam | null>(null);

  const { data: exams = [], isLoading } = useAdminListExams();

  const deleteMutation = useAdminDeleteExam({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/exams"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        toast({ title: "Exam deleted" });
        setDeleteExam(null);
      },
      onError: () => toast({ title: "Failed to delete exam", variant: "destructive" }),
    },
  });

  const updateMutation = useAdminUpdateExam({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/exams"] });
        toast({ title: "Exam updated" });
      },
    },
  });

  const filtered = exams.filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "published" ? e.isPublished : !e.isPublished);
    return matchSearch && matchFilter;
  });

  const published = exams.filter(e => e.isPublished).length;
  const drafts = exams.filter(e => !e.isPublished).length;

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-purple-500/25">
              <BookMarked size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Exam Management</h1>
              <p className="text-muted-foreground text-sm">Create and manage platform exams</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
          >
            <Plus size={16} />
            Create Exam
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Exams", value: exams.length, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { label: "Published", value: published, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Drafts", value: drafts, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-2xl border ${s.bg} text-center`}>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-muted-foreground"
              placeholder="Search exams..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "published", "draft"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                  filter === f
                    ? "gradient-btn text-white border-transparent shadow-md shadow-purple-500/20"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:text-white"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/3 border border-white/8 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-4">
              <FileText size={28} className="opacity-30" />
            </div>
            <p className="font-semibold mb-1">No exams found</p>
            <p className="text-sm opacity-60">
              {exams.length === 0 ? "Create your first exam to get started" : "Try adjusting your filters"}
            </p>
            {exams.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-btn text-white text-sm font-bold shadow-lg shadow-purple-500/25"
              >
                <Plus size={15} />
                Create First Exam
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map(exam => (
                <ExamCard
                  key={exam.id}
                  exam={exam as AdminExam & { questionCount: number }}
                  onEdit={() => setEditExam(exam)}
                  onDelete={() => setDeleteExam(exam)}
                  onTogglePublish={() => updateMutation.mutate({ id: exam.id, data: { isPublished: !exam.isPublished } })}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <ExamModal onClose={() => setShowCreate(false)} />
        )}
        {editExam && (
          <ExamModal
            examId={editExam.id}
            onClose={() => setEditExam(null)}
          />
        )}
        {deleteExam && (
          <DeleteModal
            exam={deleteExam}
            onClose={() => setDeleteExam(null)}
            onConfirm={() => deleteMutation.mutate({ id: deleteExam.id })}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
