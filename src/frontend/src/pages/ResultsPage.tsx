import type { StudentResult } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReleasedExams, useStudentResult } from "@/hooks/useQueries";
import {
  BookOpen,
  CheckCircle,
  Loader2,
  Printer,
  Search,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

function ResultCard({
  result,
  className,
  examName,
}: { result: StudentResult; className: string; examName: string }) {
  const handlePrint = () => window.print();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      data-ocid="results.result_card"
      className="result-card-print border border-border bg-card rounded-xl shadow-card overflow-hidden"
    >
      {/* Header bar */}
      <div className="navy-gradient px-6 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-white/70 tracking-wider uppercase mb-1">
              Pankaj Vidyalaya Chopda
            </p>
            <h2 className="font-display text-xl font-bold">Academic Result</h2>
            <p className="text-sm text-white/80 mt-0.5">
              {examName} — {className}
            </p>
          </div>
          <Badge
            className={`shrink-0 text-sm font-bold px-3 py-1.5 ${
              result.isPassed
                ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
                : "bg-red-500/20 text-red-200 border-red-500/30"
            } border`}
          >
            {result.isPassed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                PASSED
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1.5" />
                FAILED
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Student info */}
      <div className="px-6 py-4 bg-secondary/40 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              Student Name
            </p>
            <p className="font-semibold text-foreground">
              {result.studentName}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              Roll Number
            </p>
            <p className="font-semibold text-foreground">{result.rollNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              Class
            </p>
            <p className="font-semibold text-foreground">{className}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              Exam
            </p>
            <p className="font-semibold text-foreground">{examName}</p>
          </div>
        </div>
      </div>

      {/* Subjects table */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
          Subject-wise Marks
        </h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead className="font-semibold text-foreground py-2.5">
                  Subject
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground py-2.5">
                  Marks Obtained
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground py-2.5">
                  Max Marks
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground py-2.5">
                  %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.subjects.map((subj) => {
                const pct =
                  Number(subj.maxMarks) > 0
                    ? Math.round(
                        (Number(subj.marksObtained) / Number(subj.maxMarks)) *
                          100,
                      )
                    : 0;
                return (
                  <TableRow
                    key={subj.subjectName}
                    className="hover:bg-secondary/30"
                  >
                    <TableCell className="font-medium">
                      {subj.subjectName}
                    </TableCell>
                    <TableCell className="text-center">
                      {String(subj.marksObtained)}
                    </TableCell>
                    <TableCell className="text-center">
                      {String(subj.maxMarks)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${
                          pct >= 35 ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {pct}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <Separator />
      <div className="px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Total Marks
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {String(result.totalMarks)}
                <span className="text-muted-foreground text-base font-normal">
                  /{String(result.maxTotalMarks)}
                </span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Percentage
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {result.percentage.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
                Grade
              </p>
              <p
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(var(--gold))" }}
              >
                {result.grade}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="no-print gap-2 border-border"
          >
            <Printer className="w-4 h-4" />
            Print Result
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsPage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [rollNumber, setRollNumber] = useState<string>("");
  const [searchEnabled, setSearchEnabled] = useState(false);

  const { data: releasedExams = [], isLoading: examsLoading } =
    useReleasedExams();

  // Unique class names from released exams
  const classNames = useMemo(() => {
    const names = releasedExams.map((e) => e.className);
    return [...new Set(names)].sort();
  }, [releasedExams]);

  // Exams filtered by selected class
  const filteredExams = useMemo(() => {
    if (!selectedClass) return [];
    return releasedExams.filter((e) => e.className === selectedClass);
  }, [releasedExams, selectedClass]);

  const selectedExam = filteredExams.find((e) => e.examId === selectedExamId);

  const {
    data: resultData,
    isLoading: resultLoading,
    isError: resultError,
    isFetched: resultFetched,
  } = useStudentResult(rollNumber, selectedExamId, searchEnabled);

  const handleSearch = () => {
    if (!selectedExamId || !rollNumber.trim()) return;
    setSearchEnabled(true);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setSelectedExamId("");
    setSearchEnabled(false);
  };

  const handleExamChange = (val: string) => {
    setSelectedExamId(val);
    setSearchEnabled(false);
  };

  const handleRollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRollNumber(e.target.value);
    setSearchEnabled(false);
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl navy-gradient shadow-card mb-4">
            <Search className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Check Your Result
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Select your class and exam, then enter your roll number to view your
            result.
          </p>
        </div>

        {/* Search form */}
        <div className="bg-card border border-border rounded-xl shadow-card p-6 mb-6">
          <div className="grid gap-4">
            {/* Class select */}
            <div className="space-y-1.5">
              <Label htmlFor="class-select" className="text-sm font-medium">
                Class
              </Label>
              {examsLoading ? (
                <div
                  className="h-10 rounded-md bg-secondary animate-pulse"
                  data-ocid="results.loading_state"
                />
              ) : (
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger
                    id="class-select"
                    data-ocid="results.class_select"
                  >
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classNames.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                        No classes available
                      </div>
                    ) : (
                      classNames.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Exam select */}
            <div className="space-y-1.5">
              <Label htmlFor="exam-select" className="text-sm font-medium">
                Exam
              </Label>
              <Select
                value={selectedExamId}
                onValueChange={handleExamChange}
                disabled={!selectedClass || filteredExams.length === 0}
              >
                <SelectTrigger id="exam-select" data-ocid="results.exam_select">
                  <SelectValue
                    placeholder={
                      !selectedClass
                        ? "Select a class first"
                        : filteredExams.length === 0
                          ? "No exams available"
                          : "Select exam"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredExams.map((exam) => (
                    <SelectItem key={exam.examId} value={exam.examId}>
                      {exam.examName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Roll number */}
            <div className="space-y-1.5">
              <Label htmlFor="roll-input" className="text-sm font-medium">
                Roll Number
              </Label>
              <Input
                id="roll-input"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={handleRollChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-ocid="results.roll_input"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!selectedExamId || !rollNumber.trim() || resultLoading}
              className="navy-gradient text-white shadow-xs hover:shadow-card transition-all duration-200 gap-2 font-semibold"
              data-ocid="results.submit_button"
            >
              {resultLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Result
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Result display */}
        <AnimatePresence mode="wait">
          {resultLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="results.loading_state"
              className="text-center py-10"
            >
              <Loader2
                className="w-8 h-8 animate-spin mx-auto mb-3"
                style={{ color: "oklch(var(--navy))" }}
              />
              <p className="text-muted-foreground text-sm">
                Searching for your result…
              </p>
            </motion.div>
          )}

          {!resultLoading &&
            resultFetched &&
            searchEnabled &&
            (resultData ? (
              <ResultCard
                key="result"
                result={resultData}
                className={selectedClass}
                examName={selectedExam?.examName ?? ""}
              />
            ) : (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                data-ocid="results.error_state"
                className="text-center py-12 bg-card border border-border rounded-xl shadow-xs"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-semibold text-foreground mb-1">
                  Result Not Found
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  No result found for roll number <strong>{rollNumber}</strong>.
                  Please check the roll number and try again, or results may not
                  have been released yet.
                </p>
              </motion.div>
            ))}

          {resultError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="results.error_state"
              className="text-center py-10 bg-card border border-destructive/20 rounded-xl"
            >
              <XCircle className="w-8 h-8 mx-auto mb-3 text-destructive" />
              <p className="text-foreground font-medium">
                Error fetching result
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please try again.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
