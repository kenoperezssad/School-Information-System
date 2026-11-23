# ApexSIS — Capstone Project Specification & Thesis Documentation

**Project Title:** ApexSIS: An Integrated Multi-Campus Enterprise School Information System with Contactless QR Verification and Automated Academic-Financial Lifecycle Management  
**Field of Study:** Information Technology / Computer Science / Information Systems  
**Academic Year:** 2026–2027  

---

## 1. Executive Summary & Abstract

Traditional educational institutions frequently suffer from fragmented departmental data silos, manual record-keeping bottlenecks, paper-intensive enrollment workflows, and delayed financial clearance approvals. **ApexSIS** is a unified, commercial-grade enterprise School Information System (SIS) engineered to consolidate multi-campus operations into a centralized, reactive web platform.

ApexSIS introduces end-to-end automation spanning student recruitment, entrance examination evaluation, 1-click matriculation, conflict-free class scheduling, weighted component grading, contactless QR attendance logging, cashier collection with printable official receipts, departmental clearance sign-offs, and cryptographic credential verification. Built on a resilient React 18 Single-Page Application (SPA) architecture and a lightweight, stateless PHP 8.2 PDO RESTful backend, the system guarantees sub-second response times, stringent role-based access control (RBAC), and immutable audit accountability.

---

## 2. Project Objectives

### 2.1 General Objective
To design, develop, and implement a web-based Enterprise School Information System that automates academic, operational, and financial workflows across colleges, universities, and multi-campus higher education institutions.

### 2.2 Specific Objectives
1. **Automate the Admissions & Matriculation Pipeline:** Develop a digital applicant intake funnel that scores exams and automatically converts approved candidates into active matriculated students with generated student ID numbers.
2. **Prevent Class Scheduling Clashes:** Implement a triple-collision detection algorithm that verifies room availability, instructor assignments, and section schedules before confirming timetables.
3. **Streamline Grade Encoding & Computation:** Create a modular grading framework that automatically applies weighted term formulas (Written Works 30%, Performance Tasks 50%, Quarterly Exam 20%) to yield composite GPAs and academic standing remarks.
4. **Digitize Campus Attendance:** Provide a dual-mode attendance logger featuring manual roster controls and an interactive contactless QR scanner simulation.
5. **Accelerate Financial Operations:** Build an integrated cashier drawer capable of handling multiple tender channels (Cash, GCash, Maya, Bank Transfer, Check), calculating tuition balances in Philippine Pesos (PHP), and generating BIR-compliant printable Official Receipts (OR#).
6. **Eliminate Paper-Based Term Clearances:** Provide an interconnected clearance workflow where students track live approvals from the Registrar, Accounting, Library, Guidance, Clinic, and Academic Dean.
7. **Ensure Institutional Data Integrity & Accountability:** Enforce granular Role-Based Access Control (RBAC) across 9 institutional roles, complemented by an immutable system audit trail.

---

## 3. Scope and Delimitations

### 3.1 Scope of the System
The system comprises the following operational modules:

- **Security & Identity Management:** JWT stateless authentication (HMAC-SHA256), BCrypt password hashing, session recovery, and immutable system audit logging.
- **Institutional Organization:** Multi-campus directory, buildings, lecture rooms, laboratories, departments, academic years, semesters, and degree programs.
- **Admissions & Enrollment:** Online application review, entrance exam evaluation, 1-click student conversion, subject enlistment, and official Certificate of Registration (COR) generation.
- **Faculty & Academic Load:** Faculty profiling, teaching load capacity indicators, and weekly timetable matrices.
- **Grading & Academic Standards:** Grade encoding by subject instructors, grade approval hierarchies, and automated GPA calculations.
- **Attendance Monitoring:** Daily roster recording with QR identity token verification.
- **Tuition & Cashier Drawer:** Student billing statements, fee assessments, payment tracking, official receipt issuance, and scholarship grants.
- **Student Services & Welfare:**
  - *Library:* Book cataloging, borrowing schedules, return logs, and automated overdue fine calculations.
  - *Clinic / Infirmary:* Health consultations, triage logs, vital signs monitoring, and prescription records.
  - *Guidance & Counseling:* Confidential session files, behavioral assessments, and disciplinary proceedings.
- **Registrar Document Requests:** Processing for Transcripts of Records (TOR), Certificates of Good Moral Character, and Enrollment Certificates with security QR verification.
- **Graduation & Latin Honors:** Automated qualification for *Summa Cum Laude*, *Magna Cum Laude*, and *Cum Laude*.

### 3.2 Delimitations
1. **SMS Gateway:** Notification alerts are simulated in-app via interactive toast notices; real-world SMS transmission requires an external telecommunication API (e.g. Twilio or Semaphore) and is excluded from the core local scope.
2. **Payment Gateway Integration:** Payment entries in GCash, Maya, and Bank Transfer log external reference transaction numbers directly into the cashier ledger without connecting to third-party bank merchant gateways.
3. **Biometric Hardware Integration:** Physical turnstile hardware is simulated through high-resolution QR scanning terminals within the web interface.

---

## 4. System Features Matrix

| Module | Super Admin | Registrar | Faculty | Student | Parent | Cashier | Librarian | Counselor | Nurse |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard & Analytics** | Full | Academic | Teaching | Personal | Child | Revenue | Library | Welfare | Clinic |
| **Audit Logs** | Full | View | - | - | - | - | - | - | - |
| **Matriculation & COR** | Manage | Manage | - | View | View | - | - | - | - |
| **Class Schedules** | Manage | Manage | View/Assigned | Enrolled | Enrolled | - | - | - | - |
| **Grade Encoding** | Approve | Approve | Encode | View | View | - | - | - | - |
| **QR Attendance** | View | View | Scan/Log | View ID | View Alerts | - | - | - | - |
| **Cashier & Receipts** | View | - | - | Ledger | Ledger | Collect | - | - | - |
| **Clearance Approvals** | Supervise | Sign-Off | - | Track | Track | Sign-Off | Sign-Off | Sign-Off | Sign-Off |
| **Library Loans & Fines** | View | - | - | Borrowings | - | Collect | Manage | - | - |
| **Counseling & Clinic** | Summary | - | - | 360° View | - | - | - | Manage | Manage |

---

## 5. Development Methodology

The project was executed following the **Agile Scrum Methodology**, partitioned into focused two-week sprints:

1. **Sprint 1 (Architecture & Database Foundations):** Schema normalization (3NF), relational table generation, PDO connection pooling, and baseline seed data.
2. **Sprint 2 (Security & Authentication):** JWT token generator, BCrypt password hashing, route guards, and role permission resolution.
3. **Sprint 3 (Admissions, Students & Enrollment):** 360° student drawer, 1-click admission conversion, subject schedule assignment, and printable COR.
4. **Sprint 4 (Academics & Attendance):** Class scheduling clash detector, contactless QR scanner terminal simulation, component grading, and GPA calculation.
5. **Sprint 5 (Finance & Cashier Drawer):** Statement of accounts, multi-channel payment processing, Official Receipt (OR#) slip generation in Philippine Pesos (PHP).
6. **Sprint 6 (Student Welfare & Institutional Services):** Library loans, clinic triage, counseling cases, and multi-department clearance approvals.
7. **Sprint 7 (Design Polish & Audit Hardening):** Navy + Gold theme implementation, responsive layout optimizations, cross-browser validation, and documentation package compilation.

---

## 6. Hardware & Software Requirements

### Minimum Client Requirements
- **OS:** Windows 10/11, macOS 12+, or Ubuntu 20.04+
- **Processor:** Dual-Core 2.0 GHz or higher
- **RAM:** 4 GB
- **Browser:** Google Chrome (v100+), Edge (v100+), Firefox (v100+)

### Minimum Server / Host Requirements
- **OS:** Windows Server / Windows 10+, Linux (Ubuntu/Debian)
- **Web Server:** PHP 8.0+ Built-in Server / Apache 2.4+ (XAMPP)
- **Database Server:** MySQL 8.0+ or MariaDB 10.4+
- **Node.js Environment:** Node.js v18.0.0+ & npm 9.0+
- **Network Interface:** Standard 100/1000 Mbps Ethernet or 802.11ac Wi-Fi

---

## 7. Institutional Beneficiaries

1. **Students:** Gain instant transparent access to academic grades, real-time schedule timetables, financial statements, and paperless clearance status.
2. **Parents and Guardians:** Receive continuous visibility regarding student attendance and billing obligations without needing to visit the campus registrar physically.
3. **Faculty Members:** Benefit from automated weighted grade computation, simplified contactless attendance logging, and clear schedule conflict prevention.
4. **Administrative Staff (Registrar, Cashier, Librarian, Nurses, Counselors):** Experience reduced manual paperwork, faster inter-departmental endorsements, and unified search across student dossiers.
5. **School Executives & Accreditation Boards:** Gain actionable analytics on enrollment distribution, institutional collections, and chronological audit trails for compliance.
