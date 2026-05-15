import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

interface ParsedMcq {
  question: string;
  options: [string, string, string, string];
  correctOption: number;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}

function isOptionLine(line: string): boolean {
  return /^[\(\[]?[A-Da-d][\)\]\.\:\s]/i.test(line.trim());
}

function isAnswerLine(line: string): boolean {
  return /^(answer|correct(\s+answer)?|ans|key|solution|correct\s+option|answer\s+key)\s*[:\.]/i.test(line.trim());
}

function isExplanationLine(line: string): boolean {
  return /^(explanation|exp|reason|rationale|note|hint|solution)\s*[:\.]/i.test(line.trim());
}

function parseOptionLetter(line: string): { letter: string; text: string } | null {
  const m = line.trim().match(/^[\(\[]?([A-Da-d])[\)\]\.\:\s]\s*(.+)/);
  if (!m) return null;
  return { letter: m[1].toUpperCase(), text: m[2].trim() };
}

function parseAnswerLetter(line: string): string | null {
  const m = line.trim().match(/^(?:answer|correct(?:\s+answer)?|ans|key|solution|correct\s+option|answer\s+key)\s*[:\.]\s*\(?([A-Da-d])\)?/i);
  if (!m) return null;
  return m[1].toUpperCase();
}

function parseMcqBlock(lines: string[]): ParsedMcq | null {
  const filtered = lines.map(l => l.trim()).filter(Boolean);
  if (filtered.length < 3) return null;

  let question = "";
  const options: Map<string, string> = new Map();
  let correctLetter = "";
  let explanation = "";
  let i = 0;

  const firstLine = filtered[0];
  const qNumMatch = firstLine.match(/^(?:Q(?:uestion)?\s*\d+[\.\):]?\s*|\d+[\.\)]\s*)(.*)/i);
  question = qNumMatch ? qNumMatch[1].trim() : firstLine;
  i++;

  while (i < filtered.length && !isOptionLine(filtered[i]) && !isAnswerLine(filtered[i]) && !isExplanationLine(filtered[i])) {
    question += " " + filtered[i];
    i++;
  }
  question = question.trim();

  while (i < filtered.length) {
    const line = filtered[i];

    if (isAnswerLine(line)) {
      const letter = parseAnswerLetter(line);
      if (letter) correctLetter = letter;
      i++;
      continue;
    }

    if (isExplanationLine(line)) {
      const expMatch = line.match(/^(?:explanation|exp|reason|rationale|note|hint|solution)\s*[:\.]\s*(.*)/i);
      explanation = expMatch ? expMatch[1].trim() : "";
      i++;
      while (i < filtered.length && !isOptionLine(filtered[i]) && !isAnswerLine(filtered[i])) {
        explanation += " " + filtered[i];
        i++;
      }
      explanation = explanation.trim();
      continue;
    }

    const option = parseOptionLetter(line);
    if (option) {
      let optText = option.text;
      i++;
      while (i < filtered.length && !isOptionLine(filtered[i]) && !isAnswerLine(filtered[i]) && !isExplanationLine(filtered[i])) {
        optText += " " + filtered[i];
        i++;
      }
      options.set(option.letter, optText.trim());
      continue;
    }

    i++;
  }

  if (!question || options.size < 2) return null;

  const optA = options.get("A") || "";
  const optB = options.get("B") || "";
  const optC = options.get("C") || "—";
  const optD = options.get("D") || "—";

  if (!optA || !optB) return null;

  const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const correctOption = correctLetter && correctLetter in letterToIndex ? letterToIndex[correctLetter] : 0;

  return {
    question,
    options: [optA, optB, optC, optD],
    correctOption,
    explanation: explanation || undefined,
    difficulty: "medium",
  };
}

function parseMcqText(text: string): { mcqs: ParsedMcq[]; errors: string[] } {
  const mcqs: ParsedMcq[] = [];
  const errors: string[] = [];

  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n");

  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isNewQ =
      /^(?:Q(?:uestion)?\s*\d+|(?:\d+)[\.\)])\s/i.test(trimmed) &&
      !isOptionLine(trimmed);

    if (isNewQ && currentBlock.some(l => l.trim())) {
      blocks.push(currentBlock);
      currentBlock = [];
    } else if (!trimmed && currentBlock.some(l => l.trim())) {
      const hasOptions = currentBlock.some(l => isOptionLine(l.trim()));
      const hasAnswer = currentBlock.some(l => isAnswerLine(l.trim()));
      if (hasOptions && hasAnswer) {
        blocks.push(currentBlock);
        currentBlock = [];
        continue;
      }
    }
    currentBlock.push(line);
  }

  if (currentBlock.some(l => l.trim())) blocks.push(currentBlock);

  blocks.forEach((block, idx) => {
    const mcq = parseMcqBlock(block);
    if (mcq) {
      mcqs.push(mcq);
    } else if (block.some(l => l.trim())) {
      errors.push(`Block ${idx + 1}: Could not parse as an MCQ — check formatting.`);
    }
  });

  return { mcqs, errors };
}

function parseMcqCsv(buffer: Buffer): { mcqs: ParsedMcq[]; errors: string[] } {
  const mcqs: ParsedMcq[] = [];
  const errors: string[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return { mcqs: [], errors: ["Could not read file. Make sure it is a valid CSV or Excel file."] };
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

  const get = (row: Record<string, string>, patterns: string[]): string => {
    for (const key of Object.keys(row)) {
      const normalised = key.toLowerCase().trim().replace(/[\s_\-]/g, "");
      for (const p of patterns) {
        if (normalised === p.replace(/[\s_\-]/g, "")) return String(row[key]).trim();
      }
    }
    return "";
  };

  rows.forEach((row, idx) => {
    const question = get(row, ["question", "q", "questiontext", "stem"]);
    const optA = get(row, ["a", "optiona", "option_a", "choicea", "choice_a"]);
    const optB = get(row, ["b", "optionb", "option_b", "choiceb", "choice_b"]);
    const optC = get(row, ["c", "optionc", "option_c", "choicec", "choice_c"]);
    const optD = get(row, ["d", "optiond", "option_d", "choiced", "choice_d"]);
    const correct = get(row, ["correct", "answer", "correctanswer", "key", "ans", "correctoption"]);
    const explanation = get(row, ["explanation", "exp", "reason", "rationale"]);
    const difficulty = get(row, ["difficulty", "level", "diff"]);

    if (!question || !optA || !optB) {
      errors.push(`Row ${idx + 2}: Missing question or options.`);
      return;
    }

    const letterToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    const corrUpper = correct.toUpperCase().trim()[0] ?? "";
    const correctOption =
      corrUpper in letterToIndex
        ? letterToIndex[corrUpper]
        : Number.isInteger(parseInt(correct))
        ? Math.min(3, Math.max(0, parseInt(correct)))
        : 0;

    const validDiff = ["easy", "medium", "hard"] as const;
    const parsedDiff = validDiff.includes(difficulty.toLowerCase() as (typeof validDiff)[number])
      ? (difficulty.toLowerCase() as "easy" | "medium" | "hard")
      : "medium";

    mcqs.push({
      question,
      options: [optA, optB, optC || "—", optD || "—"],
      correctOption,
      explanation: explanation || undefined,
      difficulty: parsedDiff,
    });
  });

  return { mcqs, errors };
}

router.post(
  "/mcqs/parse",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  async (req, res): Promise<void> => {
    const { format, text } = req.body as { format?: string; text?: string };

    if (format === "text") {
      if (!text) {
        res.status(400).json({ error: "No text provided" });
        return;
      }
      const result = parseMcqText(text);
      res.json(result);
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    try {
      if (format === "csv" || format === "excel") {
        const result = parseMcqCsv(req.file.buffer);
        res.json(result);
        return;
      }

      let extractedText = "";

      if (format === "pdf") {
        const data = await pdfParse(req.file.buffer);
        extractedText = data.text;
      } else if (format === "docx") {
        const data = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = data.value;
      } else {
        res.status(400).json({ error: `Unknown format: ${format}` });
        return;
      }

      if (!extractedText.trim()) {
        res.json({ mcqs: [], errors: ["No text could be extracted from the file."] });
        return;
      }

      const result = parseMcqText(extractedText);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: "Failed to parse file", message: String(err) });
    }
  }
);

export default router;
