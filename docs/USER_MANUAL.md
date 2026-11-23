# ApexSIS — Comprehensive User Manual

This manual provides operational instructions for all **9 institutional roles** supported by the **ApexSIS Enterprise School Information System**.

---

## 1. Getting Started & Logging In

1. Open your web browser and go to `http://localhost:5173`.
2. Enter your authorized institutional email and password on the **Login Page**.
3. Click **Sign In to Portal**.
4. The system will authenticate your session via JWT and automatically open the customized dashboard for your role.

> **💡 Quick Role Switcher (For Evaluation & Demo):**  
> In the top navigation bar, click the **Switch Role** dropdown menu. You can switch immediately between any of the 9 roles without logging out!

---

## 2. Super Administrator

The **Super Administrator** possesses unrestricted oversight of institutional operations, security, master records, and data analytics.

### Key Capabilities & Workflows:
1. **Institutional Command Dashboard:**
   - Review macro metrics: Total Matriculated Students, Active Faculty, Total Collections (in PHP), and Pending Clearances.
   - Monitor real-time charts illustrating enrollment trends by degree program and revenue trajectory.
2. **System Audit Logs (`/audit-logs`):**
   - Track every change made across all modules.
   - Filter logs by User, Role, Action (e.g. `USER_LOGIN`, `SUBMIT_GRADE`, `OR_ISSUED`), or Module.
   - Review original values versus updated values in JSON view.
3. **Campus & Organizational Structure (`/operations`):**
   - Manage multiple campuses, buildings, lecture halls, and specialized laboratories.
   - Configure academic calendars, terms (`1st Semester`, `2nd Semester`, `Summer`), and departments.
4. **Access Control (RBAC):**
   - Inspect role permissions matrix and toggle specific module rights.

---

## 3. University Registrar

The **Registrar** manages matriculation, academic credentials, enrollment schedules, and official student documents.

### Key Workflows:
1. **Admissions Pipeline & 1-Click Matriculation (`/admissions`):**
   - Review incoming student applicant records.
   - Log Entrance Exam scores and panel interview evaluations.
   - Once approved, click **"Enroll as Student"** to automatically generate an official Matriculation ID (e.g. `2026-10001`), assign a digital QR identity token, and create their profile.
2. **Official Certificate of Registration (COR) Issuance (`/enrollment`):**
   - Enroll students into pre-requisite validated subjects.
   - Generate official printable **COR slips** showing course codes, time schedules, room assignments, unit counts, and assessed tuition fees.
3. **Academic Credentials & Document Verification (`/registrar`):**
   - Process formal requests for:
     - *Transcript of Records (TOR)*
     - *Certificate of Good Moral Character*
     - *Certificate of Enrollment*
     - *Transfer Credential / Honorable Dismissal*
   - Generate official documents stamped with the digital institutional watermark and a cryptographic verification QR code.
4. **Graduation List & Latin Honors Evaluation (`/operations`):**
   - Review graduating class rosters.
   - Automated qualification for Latin Honors based on cumulative GPA (*Summa Cum Laude* for GPA ≤ 1.20, *Magna Cum Laude* for GPA ≤ 1.45, *Cum Laude* for GPA ≤ 1.75).

---

## 4. Faculty / Teacher Portal

The **Faculty Portal** gives educators direct control over class rosters, schedule timetables, contactless attendance, and weighted grading.

### Key Workflows:
1. **Instructional Schedule (`/schedules`):**
   - View your weekly teaching grid segmented by day and time slot.
   - Inspect assigned room types (Lecture vs. Laboratory) and class capacity.
2. **Contactless Attendance & QR Scanner (`/attendance`):**
   - Access class attendance sheets filtered by date and subject.
   - **Manual Mode:** Mark individual students as *Present*, *Late*, *Absent*, or *Excused*.
   - **QR Scanner Mode:** Click **"Open QR Scanner"** to activate the simulated camera terminal. Scanning a student's ID barcode or clicking their digital token records their attendance timestamp instantly.
3. **Modular Grade Encoding (`/grades`):**
   - Select your enrolled section and subject.
   - Encode raw scores for:
     - **Written Works** (30% weight)
     - **Performance Tasks & Labs** (50% weight)
     - **Quarterly Exam** (20% weight)
   - The system automatically calculates weighted term averages, numerical GPA ratings, and *Passed/Failed* statuses.
   - Click **"Submit Grades for Approval"** to lock your entries and forward them to the Department Head / Registrar.

---

## 5. Student Portal

The **Student Portal** delivers a 360° academic experience for registered students.

### Features:
1. **360° Student Dashboard (`/dashboard`):**
   - Live view of current Term GPA, Total Credit Units, and Outstanding Balance in **PHP**.
   - Today's upcoming class schedule with room locations and professor names.
2. **My Academic Grades (`/grades`):**
   - Comprehensive breakdown of all completed subjects, semester grades, and academic remarks.
3. **Class Schedule (`/schedules`):**
   - Printable weekly timetable view showing all lecture and lab sessions.
4. **Account Balance & Ledger (`/finance`):**
   - View itemized tuition and laboratory fee breakdowns.
   - Review past payment history, official receipt numbers (OR#), and remaining balance.
5. **Digital Student QR ID:**
   - Displays student barcode and cryptographic QR identity card for turnstile access, library checkout, and contactless classroom attendance.
6. **Clearance Tracker (`/clearance`):**
   - Real-time status tracker monitoring sign-offs from the Registrar, Accounting, Library, Guidance, Clinic, and Department Head.

---

## 6. Parent / Guardian Portal

The **Parent Portal** empowers families to stay informed regarding their student's safety, attendance, and academic standing.

### Key Features:
1. **Child 360° Overview:**
   - View linked student profile, matriculation number, degree program, and enrolled year level.
2. **Real-time Attendance Alerts (`/attendance`):**
   - Check daily gate entry logs and classroom attendance records.
   - Identify unexcused absences or late arrival notices.
3. **Academic Progress Tracker (`/grades`):**
   - View published midterm and final grades verified by the registrar.
4. **Tuition Statement of Account (`/finance`):**
   - Inspect current assessment fees, scholarship subsidies, and pending payment deadlines.

---

## 7. Cashier / Accountant Portal

The **Finance Portal** governs university revenue collection, student billing, cashier drawers, and official receipt issuance.

### Key Workflows:
1. **Tuition Invoicing & Billing Assessment (`/finance`):**
   - Generate student semester invoices computed from enrolled credit and laboratory units.
   - Apply recognized scholarship grants (e.g. *DOST-SEI*, *Presidential Academic Excellence Grant*).
2. **Cashier Drawer & Payment Processing:**
   - Search for student matriculation number or invoice reference.
   - Select payment channel: **Cash**, **GCash**, **Maya**, **Bank Transfer**, or **Check**.
   - Input amount tendered; system computes change in **PHP**.
   - Issue **Official Receipt (OR#)** with instant BIR-compliant printable receipt slip.
3. **Financial Collections Ledger:**
   - Real-time audit of daily collection totals by payment channel.

---

## 8. Librarian Portal

The **Library Management Module** handles bibliographic cataloging, student book loans, and overdue penalty collection.

### Key Workflows:
1. **Catalog Search & Inventory (`/library`):**
   - Browse catalog by Title, Author, Category (e.g. *Computer Science*, *Software Engineering*), or ISBN.
   - Check real-time shelf location (e.g. `CS-ROW-02-B`) and available physical copy count.
2. **Issue Book Loan:**
   - Input borrower student ID and book accession number.
   - The system records a 14-day borrowing window and generates due date stamps.
3. **Returns & Overdue Penalties:**
   - Check in returned volumes.
   - If overdue, system automatically calculates accumulated fines (e.g. PHP 50.00/day) and updates the student's library clearance status to **Hold** until settled.

---

## 9. Guidance Counselor Portal

The **Guidance & Counseling Module** provides an encrypted, confidential environment for student behavioral support.

### Key Workflows:
1. **Confidential Case Records (`/operations`):**
   - Log counseling sessions with concern categories (*Academic Performance & Stress*, *Career & Graduate School Path*, *Peer Adjustment*).
   - Record clinical observation notes and counselor recommendations.
   - Mark cases as *In Progress*, *Resolved*, or *Referred*.
2. **Disciplinary Hearing Tracking:**
   - Document student infraction reports, evidence summaries, and committee sanctions (*Written Reprimand*, *Suspension*, *Community Service*).
3. **Clearance Department Sign-Off:**
   - Verify that students have no unresolved counseling summons before clearing them for graduation or term transfer.

---

## 10. School Nurse Portal

The **University Infirmary & Clinic Module** manages student health maintenance and emergency triage logs.

### Key Workflows:
1. **Clinical Consultations & Triage (`/operations`):**
   - Record visit complaints, vital signs (*Blood Pressure*, *Temperature*, *Pulse Rate*), and clinical diagnoses.
   - Document first-aid treatment administered and prescription medications dispensed.
2. **Allergy & Medical Precaution Alerts:**
   - Maintain active medical warnings (e.g. *Penicillin allergy*, *Asthma*, *Epilepsy*) that automatically surface in the student's 360° health dossier.
3. **Medical Clearance Endorsement:**
   - Confirm annual physical exams and required health sign-offs.
