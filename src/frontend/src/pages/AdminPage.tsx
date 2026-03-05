import type { StudentResult } from "@/backend.d";
import type { Exam } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAllExams,
  useBulkUploadResults,
  useCreateExam,
  useDeleteExam,
  useIsAdmin,
} from "@/hooks/useQueries";
import { parseResultsCSV } from "@/utils/csvParser";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  LogIn,
  Plus,
  ShieldCheck,
  ShieldX,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── Exam list item ────────────────────────────────────────────────────────
function ExamRow({ exam, index }: { exam: Exam; index: number }) {
  const deleteExam = useDeleteExam();
  const releaseDate = new Date(Number(exam.releaseDateTime) / 1_000_000);
  const isReleased = releaseDate <= new Date();

  const handleDelete = async () => {
    try {
      await deleteExam.mutateAsync(exam.examId);
      toast.success("Exam deleted successfully");
    } catch {
      toast.error("Failed to delete exam");
    }
  };

  return (
    <TableRow className="hover:bg-secondary/30">
      <TableCell className="font-medium">{exam.className}</TableCell>
      <TableCell>{exam.examName}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {releaseDate.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            isReleased
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }
        >
          {isReleased ? "Released" : "Scheduled"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              data-ocid={`admin.delete_button.${index}`}
              disabled={deleteExam.isPending}
            >
              {deleteExam.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="admin.delete_dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{exam.examName}</strong>{" "}
                for <strong>{exam.className}</strong> and all associated student
                results. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="admin.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-ocid="admin.confirm_button"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

// ── Upload tab ────────────────────────────────────────────────────────────
function UploadTab() {
  const [className, setClassName] = useState("");
  const [examName, setExamName] = useState("");
  const [releaseDateTime, setReleaseDateTime] = useState("");
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);
  const [parsedResults, setParsedResults] = useState<StudentResult[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const createExam = useCreateExam();
  const bulkUpload = useBulkUploadResults();

  const handleCreateExam = async () => {
    if (!className.trim() || !examName.trim() || !releaseDateTime) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const dt = new Date(releaseDateTime);
      const nanos = BigInt(dt.getTime()) * BigInt(1_000_000);
      const examId = await createExam.mutateAsync({
        className: className.trim(),
        examName: examName.trim(),
        releaseDateTime: nanos,
      });
      setCreatedExamId(examId);
      toast.success("Exam created! Now upload the CSV file.");
    } catch {
      toast.error("Failed to create exam");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const examId = createdExamId ?? "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { results, errors } = parseResultsCSV(text, examId);
      setParsedResults(results);
      setParseErrors(errors);
      if (results.length === 0) {
        toast.error("No valid student records found in CSV");
      } else {
        toast.success(`Parsed ${results.length} student records`);
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!createdExamId || parsedResults.length === 0) return;
    try {
      await bulkUpload.mutateAsync({
        examId: createdExamId,
        results: parsedResults,
      });
      setUploadSuccess(true);
      toast.success(`Results uploaded for ${parsedResults.length} students`);
    } catch {
      toast.error("Failed to upload results");
    }
  };

  const handleReset = () => {
    setClassName("");
    setExamName("");
    setReleaseDateTime("");
    setCreatedExamId(null);
    setParsedResults([]);
    setParseErrors([]);
    setCsvFileName("");
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Success state */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            data-ocid="admin.success_state"
            className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"
          >
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <p className="font-semibold text-sm">
                Results uploaded successfully!
              </p>
              <p className="text-xs mt-0.5">
                {parsedResults.length} student records added for {examName} —{" "}
                {className}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="border-emerald-300"
            >
              Upload Another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!uploadSuccess && (
        <>
          {/* Step 1: Create exam */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold navy-gradient">
                1
              </span>
              <h3 className="font-semibold text-foreground">Create Exam</h3>
              {createdExamId && (
                <Badge
                  className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-200"
                  variant="outline"
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Created
                </Badge>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="class-input" className="text-sm font-medium">
                  Class Name
                </Label>
                <Input
                  id="class-input"
                  placeholder="e.g. Class 10A"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  disabled={!!createdExamId}
                  data-ocid="admin.class_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="exam-name-input"
                  className="text-sm font-medium"
                >
                  Exam Name
                </Label>
                <Input
                  id="exam-name-input"
                  placeholder="e.g. Final Examination 2025"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  disabled={!!createdExamId}
                  data-ocid="admin.exam_input"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label
                  htmlFor="release-date-input"
                  className="text-sm font-medium"
                >
                  Result Release Date & Time
                </Label>
                <Input
                  id="release-date-input"
                  type="datetime-local"
                  value={releaseDateTime}
                  onChange={(e) => setReleaseDateTime(e.target.value)}
                  disabled={!!createdExamId}
                  data-ocid="admin.release_date_input"
                />
                <p className="text-xs text-muted-foreground">
                  Results will only be visible to students after this date and
                  time.
                </p>
              </div>
            </div>

            {!createdExamId && (
              <Button
                onClick={handleCreateExam}
                disabled={
                  createExam.isPending ||
                  !className.trim() ||
                  !examName.trim() ||
                  !releaseDateTime
                }
                className="mt-4 navy-gradient text-white gap-2 font-semibold"
              >
                {createExam.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Exam
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Step 2: Upload CSV */}
          <div
            className={`bg-card border border-border rounded-xl p-5 transition-opacity ${!createdExamId ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold navy-gradient">
                2
              </span>
              <h3 className="font-semibold text-foreground">
                Upload Student Results (CSV)
              </h3>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">
                {csvFileName ? csvFileName : "Choose a CSV file"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Format:{" "}
                <code className="bg-secondary px-1 rounded text-xs">
                  RollNo,StudentName,Mathematics/100,Science/100,English/100
                </code>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                data-ocid="admin.csv_upload_button"
              >
                <Upload className="w-4 h-4" />
                Choose CSV File
              </Button>
            </div>

            {/* Parse errors */}
            {parseErrors.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-800">
                    Parse Warnings ({parseErrors.length})
                  </p>
                </div>
                <ul className="space-y-0.5">
                  {parseErrors.map((err) => (
                    <li key={err} className="text-xs text-amber-700">
                      • {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview table */}
            {parsedResults.length > 0 && (
              <div className="mb-4" data-ocid="admin.preview_table">
                <p className="text-sm font-semibold text-foreground mb-2">
                  Preview — {parsedResults.length} student records
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <ScrollArea className="h-60">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/60">
                          <TableHead className="py-2 text-xs">
                            Roll No
                          </TableHead>
                          <TableHead className="py-2 text-xs">
                            Student Name
                          </TableHead>
                          <TableHead className="py-2 text-xs text-center">
                            Marks
                          </TableHead>
                          <TableHead className="py-2 text-xs text-center">
                            %
                          </TableHead>
                          <TableHead className="py-2 text-xs text-center">
                            Grade
                          </TableHead>
                          <TableHead className="py-2 text-xs text-center">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedResults.map((r) => (
                          <TableRow key={r.rollNumber} className="text-xs">
                            <TableCell className="py-1.5">
                              {r.rollNumber}
                            </TableCell>
                            <TableCell className="py-1.5">
                              {r.studentName}
                            </TableCell>
                            <TableCell className="py-1.5 text-center">
                              {String(r.totalMarks)}/{String(r.maxTotalMarks)}
                            </TableCell>
                            <TableCell className="py-1.5 text-center">
                              {r.percentage.toFixed(1)}%
                            </TableCell>
                            <TableCell
                              className="py-1.5 text-center font-medium"
                              style={{ color: "oklch(var(--gold))" }}
                            >
                              {r.grade}
                            </TableCell>
                            <TableCell className="py-1.5 text-center">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  r.isPassed
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {r.isPassed ? "Pass" : "Fail"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={parsedResults.length === 0 || bulkUpload.isPending}
              className="navy-gradient text-white gap-2 font-semibold"
              data-ocid="admin.submit_button"
            >
              {bulkUpload.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload{" "}
                  {parsedResults.length > 0
                    ? `${parsedResults.length} Results`
                    : "Results"}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Exams tab ─────────────────────────────────────────────────────────────
function ExamsTab() {
  const { data: exams = [], isLoading } = useAllExams();

  if (isLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="flex items-center justify-center py-12 text-muted-foreground"
      >
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading exams…
      </div>
    );
  }

  return (
    <div>
      {exams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No exams created yet</p>
          <p className="text-sm mt-1">
            Use the Upload tab to create an exam and upload results.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border border-border overflow-hidden"
          data-ocid="admin.exam_list"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/60">
                <TableHead className="font-semibold">Class</TableHead>
                <TableHead className="font-semibold">Exam Name</TableHead>
                <TableHead className="font-semibold">Release Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam, i) => (
                <ExamRow key={exam.examId} exam={exam} index={i + 1} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────
export default function AdminPage() {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Not logged in
  if (isInitializing || isAdminLoading) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div data-ocid="admin.loading_state" className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-3"
            style={{ color: "oklch(var(--navy))" }}
          />
          <p className="text-muted-foreground text-sm">Initializing…</p>
        </div>
      </main>
    );
  }

  if (!identity) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center bg-card border border-border rounded-xl shadow-card p-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl navy-gradient shadow-card mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Admin Login
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with your Internet Identity to access the admin dashboard.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="navy-gradient text-white gap-2 font-semibold w-full"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In with Internet Identity
              </>
            )}
          </Button>
        </motion.div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center bg-card border border-border rounded-xl shadow-card p-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-destructive/10 mb-4">
            <ShieldX className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account does not have administrator privileges. Please contact
            the system administrator.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage exams and upload student results
            </p>
          </div>
          <Badge
            className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5"
            variant="outline"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </Badge>
        </div>

        <Separator className="mb-6" />

        <Tabs defaultValue="exams">
          <TabsList className="mb-6">
            <TabsTrigger value="exams" data-ocid="admin.exams_tab">
              Exams
            </TabsTrigger>
            <TabsTrigger value="upload" data-ocid="admin.upload_tab">
              Upload Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exams">
            <ExamsTab />
          </TabsContent>

          <TabsContent value="upload">
            <UploadTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
