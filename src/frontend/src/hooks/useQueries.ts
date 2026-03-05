import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StudentResult } from "../backend.d";
import { useActor } from "./useActor";

// ── Query: all exams (admin) ──────────────────────────────────────────────
export function useAllExams() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allExams"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExams();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Query: released exams (student) ──────────────────────────────────────
export function useReleasedExams() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["releasedExams"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReleasedExams();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Query: student result ─────────────────────────────────────────────────
export function useStudentResult(
  rollNumber: string,
  examId: string,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studentResult", rollNumber, examId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStudentResult(rollNumber, examId);
    },
    enabled: !!actor && !isFetching && enabled && !!rollNumber && !!examId,
  });
}

// ── Query: all results for exam (admin) ──────────────────────────────────
export function useAllResultsForExam(examId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allResultsForExam", examId],
    queryFn: async () => {
      if (!actor || !examId) return [];
      return actor.getAllResultsForExam(examId);
    },
    enabled: !!actor && !isFetching && !!examId,
  });
}

// ── Query: is caller admin ────────────────────────────────────────────────
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutation: create exam ─────────────────────────────────────────────────
export function useCreateExam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      className,
      examName,
      releaseDateTime,
    }: {
      className: string;
      examName: string;
      releaseDateTime: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createExam(className, examName, releaseDateTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allExams"] });
      queryClient.invalidateQueries({ queryKey: ["releasedExams"] });
    },
  });
}

// ── Mutation: delete exam ─────────────────────────────────────────────────
export function useDeleteExam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteExam(examId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allExams"] });
      queryClient.invalidateQueries({ queryKey: ["releasedExams"] });
    },
  });
}

// ── Mutation: bulk upload results ─────────────────────────────────────────
export function useBulkUploadResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      examId,
      results,
    }: {
      examId: string;
      results: StudentResult[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.bulkUploadResults(examId, results);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["allResultsForExam", variables.examId],
      });
    },
  });
}
