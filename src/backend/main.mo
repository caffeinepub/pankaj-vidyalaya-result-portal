import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Subject = {
    subjectName : Text;
    marksObtained : Nat;
    maxMarks : Nat;
  };

  type StudentResult = {
    rollNumber : Text;
    studentName : Text;
    subjects : [Subject];
    totalMarks : Nat;
    maxTotalMarks : Nat;
    percentage : Float;
    grade : Text;
    isPassed : Bool;
    examId : Text;
  };

  type Exam = {
    examId : Text;
    className : Text;
    examName : Text;
    releaseDateTime : Int;
  };

  let examsMap = Map.empty<Text, Exam>();

  let examResultsMap = Map.empty<Text, Map.Map<Text, StudentResult>>();

  module StudentResult {
    public func compare(a : StudentResult, b : StudentResult) : Order.Order {
      Text.compare(a.rollNumber, b.rollNumber);
    };
  };

  module Subject {
    public func compare(a : Subject, b : Subject) : Order.Order {
      Text.compare(a.subjectName, b.subjectName);
    };
  };

  module Exam {
    public func compare(a : Exam, b : Exam) : Order.Order {
      Text.compare(a.className, b.className);
    };
  };

  func calculateGrade(percentage : Float) : Text {
    if (percentage >= 90) { "A+" } else if (percentage >= 80) { "A" } else if (
      percentage >= 70
    ) { "B+" } else if (percentage >= 60) { "B" } else if (percentage >= 50) {
      "C";
    } else { "D" };
  };

  func calculateIsPassed(percentage : Float) : Bool {
    percentage >= 35.0;
  };

  var examIdCounter = 1;

  public shared ({ caller }) func createExam(className : Text, examName : Text, releaseDateTime : Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create exams");
    };
    let examId = examIdCounter.toText();
    let exam : Exam = {
      examId;
      className;
      examName;
      releaseDateTime;
    };
    examsMap.add(examId, exam);
    examIdCounter := examIdCounter + 1;
    examId;
  };

  public shared ({ caller }) func deleteExam(examId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete exams");
    };
    examsMap.remove(examId);
    examResultsMap.remove(examId);
  };

  public shared ({ caller }) func bulkUploadResults(examId : Text, results : [StudentResult]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload results");
    };
    switch (examsMap.get(examId)) {
      case (null) { Runtime.trap("Exam does not exist") };
      case (?_) {
        let examResults = Map.empty<Text, StudentResult>();
        for (result in results.values()) {
          let totalMarks = result.subjects.foldLeft(0, func(acc, subj) { acc + subj.marksObtained });
          let maxTotalMarks = result.subjects.foldLeft(0, func(acc, subj) { acc + subj.maxMarks });
          let percentage = if (maxTotalMarks == 0) { 0.0 } else {
            totalMarks.toFloat() / maxTotalMarks.toFloat() * 100.0;
          };
          let updatedResult : StudentResult = {
            result with
            totalMarks;
            maxTotalMarks;
            percentage;
            grade = calculateGrade(percentage);
            isPassed = calculateIsPassed(percentage);
            examId;
          };
          examResults.add(result.rollNumber, updatedResult);
        };
        examResultsMap.add(examId, examResults);
      };
    };
  };

  public query ({ caller }) func getAllExams() : async [Exam] {
    examsMap.values().toArray();
  };

  public query ({ caller }) func getReleasedExams() : async [Exam] {
    let currentTime = Time.now();
    let allExams = examsMap.values().toArray();
    allExams.filter(
      func(exam) { exam.releaseDateTime <= currentTime }
    );
  };

  public query ({ caller }) func getStudentResult(rollNumber : Text, examId : Text) : async ?StudentResult {
    switch (examsMap.get(examId)) {
      case (null) { null };
      case (?exam) {
        if (Time.now() < exam.releaseDateTime) {
          return null;
        };
        switch (examResultsMap.get(examId)) {
          case (null) { null };
          case (?results) {
            results.get(rollNumber);
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllResultsForExam(examId : Text) : async [StudentResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all results for an exam");
    };
    switch (examResultsMap.get(examId)) {
      case (null) { [] };
      case (?results) {
        results.values().toArray();
      };
    };
  };
};
