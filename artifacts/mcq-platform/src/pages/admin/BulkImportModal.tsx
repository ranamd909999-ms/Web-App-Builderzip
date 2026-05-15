import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetSubjects, useGetChapters, useBulkCreateMcqs } from "@workspace/api-client-react";
import { getGetChaptersQueryKey } from "@workspace/api-client-react";
import {
  X, Upload, FileText, FileSpreadsheet, ClipboardList, Loader2,
  CheckCircle, AlertCircle, Trash2, ChevronDown, Zap, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParsedMcq {
  question: string;
  options: [string, string, string, string];
  correctOption: number;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}

interface ParseResult {
  mcqs: ParsedMcq[];
  errors: string[];
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

function EditableRow({
  mcq,
  index,
  onChange,
  onDelete,
}: {
  mcq: ParsedMcq;
  index: number;
  onChange: (updated: ParsedMcq) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden mb-2">
      <div className="flex items-start gap-3 p-3 bg-card">
        <span className="text-xs font-bold text-muted-foreground mt-1 w-6 text-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <textarea
            value={mcq.question}
            onChange={e => onChange({ ...mcq, question: e.target.value })}
            rows={2}
            className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 mb-2"
            placeholder="Question text..."
          />
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {mcq.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ ...mcq, correctOption: i })}
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 border-2 transition-colors flex items-center justify-center",
                    mcq.correctOption === i
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-border text-muted-foreground hover:border-green-400"
                  )}
                  title={`Mark ${OPTION_LABELS[i]} as correct`}
                >
                  {OPTION_LABELS[i]}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const opts = [...mcq.options] as [string, string, string, string];
                    opts[i] = e.target.value;
                    onChange({ ...mcq, options: opts });
                  }}
                  className="flex-1 px-2 py-1 rounded bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder={`Option ${OPTION_LABELS[i]}`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={mcq.difficulty}
              onChange={e => onChange({ ...mcq, difficulty: e.target.value as ParsedMcq["difficulty"] })}
              className={cn(
                "text-xs px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-primary/50",
                mcq.difficulty === "easy"
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : mcq.difficulty === "hard"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
              )}
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d} className="bg-background text-foreground capitalize">{d}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {expanded ? "Hide" : "Explanation"}
              <ChevronDown size={12} className={cn("transition-transform", expanded && "rotate-180")} />
            </button>
            <span className="flex-1" />
            <span className={cn("text-xs font-medium", mcq.correctOption !== undefined ? "text-green-400" : "text-muted-foreground")}>
              Correct: {OPTION_LABELS[mcq.correctOption]}
            </span>
          </div>
          {expanded && (
            <textarea
              value={mcq.explanation ?? ""}
              onChange={e => onChange({ ...mcq, explanation: e.target.value || undefined })}
              rows={2}
              className="mt-2 w-full px-2 py-1.5 rounded bg-background border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
              placeholder="Explanation (optional)..."
            />
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-red-400 transition-colors p-1 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

type ImportTab = "text" | "pdf" | "docx" | "csv";

const TABS: { id: ImportTab; label: string; icon: React.ElementType; accept?: string; desc: string }[] = [
  { id: "text", label: "Paste Text", icon: ClipboardList, desc: "Copy-paste MCQs in standard format" },
  { id: "pdf", label: "PDF", icon: FileText, accept: ".pdf", desc: "Upload a PDF file" },
  { id: "docx", label: "Word (DOCX)", icon: FileText, accept: ".docx,.doc", desc: "Upload a Word document" },
  { id: "csv", label: "CSV / Excel", icon: FileSpreadsheet, accept: ".csv,.xlsx,.xls", desc: "Upload a spreadsheet" },
];

const TEXT_PLACEHOLDER = `1. What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
Answer: B
Explanation: Paris has been the capital since the 10th century.

2. Which planet is closest to the Sun?
A) Venus
B) Earth
C) Mercury
D) Mars
Answer: C`;

export default function BulkImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [tab, setTab] = useState<ImportTab>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [editedMcqs, setEditedMcqs] = useState<ParsedMcq[]>([]);
  const [parsing, setParsing] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [selectedChapterId, setSelectedChapterId] = useState<number>(0);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: subjects } = useGetSubjects();
  const { data: chapters } = useGetChapters(selectedSubjectId, {
    query: { queryKey: getGetChaptersQueryKey(selectedSubjectId), enabled: !!selectedSubjectId },
  });
  const bulkCreateMcqs = useBulkCreateMcqs();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleParse = async () => {
    setParsing(true);
    setParseResult(null);
    setImportError("");
    try {
      const token = localStorage.getItem("token");
      let res: Response;

      if (tab === "text") {
        const body = new FormData();
        body.append("format", "text");
        body.append("text", text);
        res = await fetch("/api/mcqs/parse", {
          method: "POST",
          headers: { Authorization: `Bearer ${token ?? ""}` },
          body,
        });
      } else {
        if (!file) { setImportError("Please select a file."); setParsing(false); return; }
        const body = new FormData();
        body.append("format", tab === "docx" ? "docx" : tab === "pdf" ? "pdf" : "csv");
        body.append("file", file);
        res = await fetch("/api/mcqs/parse", {
          method: "POST",
          headers: { Authorization: `Bearer ${token ?? ""}` },
          body,
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Parse failed" }));
        setImportError(err.error ?? "Failed to parse");
        return;
      }

      const data: ParseResult = await res.json();
      setParseResult(data);
      setEditedMcqs(data.mcqs);
    } catch (e) {
      setImportError(String(e));
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedChapterId) { setImportError("Please select a chapter."); return; }
    if (editedMcqs.length === 0) { setImportError("No MCQs to import."); return; }
    setImportError("");
    try {
      const result = await bulkCreateMcqs.mutateAsync({
        data: {
          chapterId: selectedChapterId,
          mcqs: editedMcqs.map(m => ({
            question: m.question,
            options: m.options,
            correctOption: m.correctOption,
            explanation: m.explanation,
            difficulty: m.difficulty,
          })),
        },
      });
      setImportSuccess(`Successfully imported ${result.created} MCQs!`);
      onImported();
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setImportError(e?.data?.error ?? "Import failed. Please try again.");
    }
  };

  const updateMcq = (i: number, updated: ParsedMcq) => {
    setEditedMcqs(prev => prev.map((m, idx) => (idx === i ? updated : m)));
  };

  const deleteMcq = (i: number) => {
    setEditedMcqs(prev => prev.filter((_, idx) => idx !== i));
  };

  const currentTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background border border-border rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Bulk MCQ Import</h2>
              <p className="text-xs text-muted-foreground">Import 50–500 MCQs at once from any format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left panel: Input */}
          <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
            {/* Format tabs */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Import Format</p>
              <div className="space-y-1">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setFile(null); setParseResult(null); setImportError(""); setImportSuccess(""); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                      tab === t.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <t.icon size={15} />
                    <div>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-xs opacity-70">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {tab === "text" ? (
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-medium text-muted-foreground mb-2">Paste your MCQs below</label>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={12}
                    placeholder={TEXT_PLACEHOLDER}
                    className="flex-1 w-full px-3 py-2.5 rounded-lg bg-card border border-border text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports numbered questions (1., Q1.), options (A., A), B), (A)) and answer lines (Answer: B, Correct: B, Key: B).
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={currentTab.accept}
                    className="hidden"
                    onChange={e => { setFile(e.target.files?.[0] ?? null); setParseResult(null); }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "flex-1 min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <Upload size={24} className={isDragging ? "text-primary" : "text-muted-foreground"} />
                    <div className="text-center px-4">
                      <p className="text-sm font-medium">
                        {file ? file.name : "Drop file or click to browse"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentTab.accept?.split(",").join(", ")} files
                      </p>
                    </div>
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-xs text-foreground truncate">{file.name}</span>
                      <button onClick={() => setFile(null)} className="ml-auto text-muted-foreground hover:text-red-400">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {tab === "csv" && (
                    <div className="text-xs text-muted-foreground space-y-1 bg-secondary/50 rounded-lg p-3">
                      <p className="font-medium text-foreground">Required columns:</p>
                      <p><code className="text-primary">question</code> — question text</p>
                      <p><code className="text-primary">A, B, C, D</code> — options</p>
                      <p><code className="text-primary">correct</code> — correct option (A/B/C/D)</p>
                      <p className="text-muted-foreground/70">Optional: explanation, difficulty</p>
                    </div>
                  )}
                </div>
              )}

              {importError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {importError}
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={parsing || (tab === "text" ? !text.trim() : !file)}
                className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {parsing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                {parsing ? "Parsing..." : "Parse & Preview"}
              </button>
            </div>
          </div>

          {/* Right panel: Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            {!parseResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
                  <ClipboardList size={28} className="opacity-30" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">No MCQs parsed yet</p>
                  <p className="text-sm mt-1">Choose a format on the left and click "Parse & Preview"</p>
                </div>
              </div>
            ) : (
              <>
                {/* Preview header */}
                <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm font-semibold">{editedMcqs.length} MCQs ready</span>
                  </div>
                  {parseResult.errors.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-400">
                      <AlertCircle size={13} />
                      {parseResult.errors.length} parse error{parseResult.errors.length !== 1 ? "s" : ""}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">Click option circles to change correct answer</span>
                </div>

                {/* Parse errors */}
                {parseResult.errors.length > 0 && (
                  <div className="mx-5 mt-3 flex-shrink-0">
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-yellow-400 mb-1">Parse warnings:</p>
                      {parseResult.errors.slice(0, 5).map((e, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{e}</p>
                      ))}
                      {parseResult.errors.length > 5 && (
                        <p className="text-xs text-muted-foreground">...and {parseResult.errors.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* MCQ list */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <AnimatePresence>
                    {editedMcqs.map((mcq, i) => (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <EditableRow
                          mcq={mcq}
                          index={i}
                          onChange={updated => updateMcq(i, updated)}
                          onDelete={() => deleteMcq(i)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {editedMcqs.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Zap size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">All MCQs deleted. Parse again to reload.</p>
                    </div>
                  )}
                </div>

                {/* Import footer */}
                <div className="border-t border-border px-5 py-4 flex-shrink-0 bg-card/50">
                  {importSuccess ? (
                    <div className="flex items-center gap-2 justify-center py-2 text-green-400 font-medium">
                      <CheckCircle size={18} />
                      {importSuccess}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 flex-1">
                        <select
                          value={selectedSubjectId}
                          onChange={e => { setSelectedSubjectId(Number(e.target.value)); setSelectedChapterId(0); }}
                          className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value={0}>Select subject…</option>
                          {(subjects ?? []).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <select
                          value={selectedChapterId}
                          onChange={e => setSelectedChapterId(Number(e.target.value))}
                          disabled={!selectedSubjectId}
                          className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                        >
                          <option value={0}>Select chapter…</option>
                          {(chapters ?? []).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleImport}
                        disabled={bulkCreateMcqs.isPending || !selectedChapterId || editedMcqs.length === 0}
                        className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        {bulkCreateMcqs.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Zap size={16} />
                        )}
                        Import {editedMcqs.length} MCQs
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
