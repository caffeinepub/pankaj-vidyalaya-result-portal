# Pankaj Vidyalaya Chopda - Result Portal

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Admin/teacher login with password protection
- Admin dashboard to:
  - Upload CSV files containing student results
  - Assign uploaded results to a class (e.g., Class 8, 9, 10) and exam type (e.g., Mid-term, Final)
  - Set a result release date/time per exam
  - View list of uploaded exams with their release status
- Student result lookup page (no login):
  - Enter roll number to search
  - Select class and exam type
  - Results only visible after the set release date/time
  - Displays: student name, marks per subject, total marks, percentage, grade, pass/fail status
- Backend stores parsed CSV data as structured student records
- Backend enforces release date/time -- results not accessible before scheduled time

### Modify
- None

### Remove
- None

## Implementation Plan
1. Backend actor with:
   - Admin authentication (hardcoded or stored admin password)
   - Exam management: create exam with class, name, release datetime
   - Student result storage: roll number, name, subject marks, total, percentage, grade, pass/fail
   - Upload/parse CSV data as bulk student records per exam
   - Query: get result by roll number + exam ID, only if release time has passed
   - Query: list all exams (for student dropdown selection)
   - Admin queries: list all exams, delete exam

2. Frontend pages:
   - Home/landing page with school name, two options: "Check Result" and "Admin Login"
   - Student result page: select class, select exam, enter roll number, view result card
   - Admin login page: password form
   - Admin dashboard: upload CSV, set release date, manage exams list
