import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exam {
    releaseDateTime: bigint;
    examId: string;
    examName: string;
    className: string;
}
export interface Subject {
    subjectName: string;
    marksObtained: bigint;
    maxMarks: bigint;
}
export interface UserProfile {
    name: string;
}
export interface StudentResult {
    maxTotalMarks: bigint;
    totalMarks: bigint;
    studentName: string;
    subjects: Array<Subject>;
    isPassed: boolean;
    grade: string;
    rollNumber: string;
    examId: string;
    percentage: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUploadResults(examId: string, results: Array<StudentResult>): Promise<void>;
    createExam(className: string, examName: string, releaseDateTime: bigint): Promise<string>;
    deleteExam(examId: string): Promise<void>;
    getAllExams(): Promise<Array<Exam>>;
    getAllResultsForExam(examId: string): Promise<Array<StudentResult>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getReleasedExams(): Promise<Array<Exam>>;
    getStudentResult(rollNumber: string, examId: string): Promise<StudentResult | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
