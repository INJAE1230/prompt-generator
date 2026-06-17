import * as XLSX from "xlsx";
import mammoth from "mammoth";

interface FileInput {
  name: string;
  type: string;
  data: string; // base64
}

function getCategory(name: string, mimeType: string): "image" | "pdf" | "excel" | "word" | "text" | "unknown" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return "image";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext || "")) return "excel";
  if (["docx"].includes(ext || "")) return "word";
  if (["txt", "md", "json", "xml", "log"].includes(ext || "")) return "text";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "unknown";
}

function parseExcel(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    lines.push(`[시트: ${sheetName}]`);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    lines.push(csv);
    lines.push("");
  }
  return lines.join("\n").trim();
}

async function parseWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function parseText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

export async function extractText(file: FileInput): Promise<string | null> {
  const category = getCategory(file.name, file.type);
  if (category === "image" || category === "pdf") return null;

  const buffer = Buffer.from(file.data, "base64");

  switch (category) {
    case "excel":
      return parseExcel(buffer);
    case "word":
      return await parseWord(buffer);
    case "text":
      return parseText(buffer);
    default:
      return parseText(buffer);
  }
}

export function isNativeMedia(file: FileInput): boolean {
  const category = getCategory(file.name, file.type);
  return category === "image" || category === "pdf";
}

export function getMediaType(file: FileInput): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  return map[ext || ""] || file.type;
}
