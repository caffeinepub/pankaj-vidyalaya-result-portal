import type { StudentResult, Subject } from "../backend.d";

export interface ParsedSubjectHeader {
  name: string;
  maxMarks: number;
}

export interface ParseResult {
  results: StudentResult[];
  headers: string[];
  subjectHeaders: ParsedSubjectHeader[];
  errors: string[];
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

/**
 * Parse CSV where:
 * - Row 1: headers — RollNo, StudentName, then subject columns in format "SubjectName/MaxMarks"
 * - Remaining rows: student data
 */
export function parseResultsCSV(csvText: string, examId: string): ParseResult {
  const errors: string[] = [];
  const results: StudentResult[] = [];

  // Normalize line endings
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      results: [],
      headers: [],
      subjectHeaders: [],
      errors: ["CSV must have at least a header row and one data row."],
    };
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = splitCSVRow(headerLine);

  if (headers.length < 3) {
    return {
      results: [],
      headers,
      subjectHeaders: [],
      errors: [
        "CSV must have at least RollNo, StudentName, and one subject column.",
      ],
    };
  }

  // First two columns are RollNo and StudentName
  // Remaining are subjects in "SubjectName/MaxMarks" format
  const subjectHeaders: ParsedSubjectHeader[] = [];
  for (let i = 2; i < headers.length; i++) {
    const header = headers[i].trim();
    const slashIdx = header.lastIndexOf("/");
    if (slashIdx === -1) {
      // Try to use as subject name with default max marks of 100
      subjectHeaders.push({ name: header, maxMarks: 100 });
    } else {
      const name = header.substring(0, slashIdx).trim();
      const maxMarksStr = header.substring(slashIdx + 1).trim();
      const maxMarks = Number.parseInt(maxMarksStr, 10);
      if (Number.isNaN(maxMarks) || maxMarks <= 0) {
        errors.push(
          `Invalid max marks for subject "${name}": "${maxMarksStr}". Using 100.`,
        );
        subjectHeaders.push({ name, maxMarks: 100 });
      } else {
        subjectHeaders.push({ name, maxMarks });
      }
    }
  }

  // Parse data rows
  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const row = splitCSVRow(lines[rowIdx]);
    if (row.length < 2) {
      errors.push(`Row ${rowIdx + 1}: Too few columns, skipping.`);
      continue;
    }

    const rollNumber = row[0]?.trim() ?? "";
    const studentName = row[1]?.trim() ?? "";

    if (!rollNumber) {
      errors.push(`Row ${rowIdx + 1}: Empty roll number, skipping.`);
      continue;
    }
    if (!studentName) {
      errors.push(`Row ${rowIdx + 1}: Empty student name, skipping.`);
      continue;
    }

    const subjects: Subject[] = [];
    let totalMarks = 0;
    let maxTotalMarks = 0;

    for (let colIdx = 0; colIdx < subjectHeaders.length; colIdx++) {
      const subjectHeader = subjectHeaders[colIdx];
      const marksStr = row[colIdx + 2]?.trim() ?? "0";
      const marks = Number.parseInt(marksStr, 10);
      const validMarks = Number.isNaN(marks) ? 0 : Math.max(0, marks);

      subjects.push({
        subjectName: subjectHeader.name,
        marksObtained: BigInt(validMarks),
        maxMarks: BigInt(subjectHeader.maxMarks),
      });

      totalMarks += validMarks;
      maxTotalMarks += subjectHeader.maxMarks;
    }

    const percentage =
      maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
    const grade = calculateGrade(percentage);
    const isPassed = percentage >= 35;

    results.push({
      rollNumber,
      studentName,
      examId,
      subjects,
      totalMarks: BigInt(totalMarks),
      maxTotalMarks: BigInt(maxTotalMarks),
      percentage: Math.round(percentage * 100) / 100,
      grade,
      isPassed,
    });
  }

  return { results, headers, subjectHeaders, errors };
}

/** Split a CSV row respecting quoted fields */
function splitCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
