# ApexSIS — Enterprise School Information System

ApexSIS is a commercial-grade, full-stack **Enterprise School Information System (SIS)** designed for colleges, universities, and multi-campus institutions. Built with a modern **Navy & Gold UI**, **React 18**, **Tailwind CSS**, **Lucide Icons**, and **Recharts**, backed by a scalable **PHP 8.2 REST API**, **PDO**, and **MySQL**.

---

## 📚 Capstone & System Documentation

Comprehensive documentation has been prepared for academic defense and institutional deployment:

- 📖 **[Deployment & Setup Guide](docs/DEPLOYMENT_GUIDE.md):** Complete installation, XAMPP config, and multi-PC LAN deployment instructions.
- ⚙️ **[Technical Architecture Manual](docs/TECHNICAL_MANUAL.md):** System architecture, Mermaid diagrams, API references, and full 32-table Data Dictionary.
- 👤 **[Comprehensive User Manual](docs/USER_MANUAL.md):** Step-by-step operational workflows for all 9 institutional user roles.
- 🎓 **[Capstone Project Specification](docs/CAPSTONE_SPECIFICATION.md):** Thesis overview, problem statement, objectives, scope, features matrix, and methodology.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js (v18+) & npm
- PHP (v8.0+) with `pdo_mysql` extension enabled
- MySQL / MariaDB (Running on port `3306`)

### 2. Database Initialization
Ensure your MySQL server is running (e.g., via XAMPP or native service). Then run:
```bash
npm run setup:db
```
*This automatically creates the `school_information_system` database, builds all 41 relational tables with foreign keys, and seeds realistic institutional data (programs, subjects, faculty, students, grades, payments, library, and clearances).*

### 3. Launch Development Server
To launch both the PHP REST API (Port 8000) and the React Vite Frontend (Port 5173) simultaneously:
```bash
npm run dev
```

Visit the application in your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Demo Credentials

All seeded accounts use the default password: **`Admin@123`**

| Role | Username / Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@school.edu` | `Admin@123` | Institutional command, system audits, all permissions |
| **University Registrar** | `registrar@school.edu` | `Admin@123` | Enrollment approvals, TOR, Good Moral, Certifications |
| **Faculty / Teacher** | `faculty@school.edu` | `Admin@123` | Schedule view, class rosters, grade component encoding |
| **Student** | `student@school.edu` | `Admin@123` | 360° student portal, class schedule, grades, balance, QR ID |
| **Parent / Guardian** | `parent@school.edu` | `Admin@123` | Student monitoring, attendance alerts, tuition records |
| **Cashier / Accountant** | `accountant@school.edu` | `Admin@123` | Cashier drawer, official receipts (OR#), fee assessments |
| **Librarian** | `librarian@school.edu` | `Admin@123` | Book loans, cataloging, overdue fine calculations |
| **Guidance Counselor** | `guidance@school.edu` | `Admin@123` | Confidential counseling case files, behavioral follow-ups |
| **School Nurse** | `nurse@school.edu` | `Admin@123` | Clinic visits, vitals, allergy logs, prescriptions |

> **Tip for evaluators & capstone presentations:** Use the **Quick Role Switcher** dropdown in the top navigation bar to seamlessly experience every role's interface in real time without having to log out!

---

## 🏛️ Comprehensive Architecture & Entities

### 1. System Users & Access Control (RBAC)
- Multi-role permissions model with 24 configurable roles
- Stateless HMAC-SHA256 JWT tokens with automatic localStorage persistence
- Immutable audit log capturing user, role, module, action, IP, and changes

### 2. School Organization
- Multi-campus architecture (`campuses`, `buildings`, `rooms`, `departments`)
- Room capacity and facility classification (Lecture, Laboratory, Library, Clinic)

### 3. Academic Structure
- Academic Years & Semesters (`2026-2027`, `1st Semester`, `2nd Semester`, `Summer`)
- Degree Programs (`BSCS`, `BSIT`, `BSBA`, `BSN`)
- Subjects with lecture, laboratory, and credit units, plus prerequisite chaining

### 4. Student Management (360° Dossier)
- Unique student matriculation numbering (e.g. `2026-10001`)
- Tabbed 360° student drawer:
  - Demographic & Emergency Contact Info
  - Active Enrolled Subjects & Timetable
  - Quarterly Grade Records & Performance
  - Billing Statements & Official Receipts
  - Departmental Clearance Status
  - Clinic Visits & Known Allergies

### 5. Admissions Pipeline
- Candidate inquiry, examination scheduling, entrance test scoring, panel interviews
- **1-Click Conversion Workflow**: Convert approved candidates into active matriculated students with generated student numbers and digital QR credentials

### 6. Enrollment & Certificate of Registration (COR)
- Lifecycle states: `Pending` → `Assessed` → `For Payment` → `Paid` → `Enrolled`
- Printable official **Certificate of Registration (COR)** with schedule, course units, fee assessment breakdown, and registrar seal

### 7. Office of the Registrar
- Request and issuance workflow for:
  - Transcript of Records (TOR)
  - Certificate of Good Moral Character
  - Certificate of Enrollment
  - Transfer Credential / Honorable Dismissal
- Printable official certificates with university watermark and security QR validation seal

### 8. Faculty & Teaching Load
- Instructional roster, rank promotions, and real-time teaching load capacity meters

### 9. Class Schedules & Automated Clash Detection
- Full weekly timetable matrix
- **Triple-Collision Conflict Detector**: Real-time detection of professor overlaps, room double-bookings, and section collisions before allocating slots

### 10. Attendance & Contactless QR Scanner
- Daily class attendance rosters (Present, Late, Absent, Excused)
- **Interactive QR Scanner Terminal Simulator**: Point camera viewport or tap virtual student barcodes for instant attendance validation

### 11. Grading & Academic Records
- Configurable component weighting: Written Works (30%) + Performance Tasks (50%) + Quarterly Exam (20%)
- Live weighted average and GPA calculation with Passed / Failed remarks
- Draft → Submitted → Approved grade approval workflow

### 12. Accounting, Tuition & Cashier Drawer
- Billing assessments & student invoice tracking
- Multi-channel cashier collection: Cash, GCash, Maya, Bank Transfer, Check
- Automated **Official Receipt (OR#)** generation with printable BIR-style slip

### 13. Digital Clearance Workflow
- End-of-term multi-signatory clearance: Registrar → Accounting → Library → Guidance → Clinic → Department Head → **CLEARED**
- 1-click clearance approval buttons with celebration animations

### 14. Library Management
- ISBN catalog search, shelf location discovery
- 14-day book loans, return processing, and automatic overdue fine computation

### 15. Student Welfare: Clinic, Guidance & Discipline
- Protected clinical consultation logs, vital signs, allergy records, and prescriptions
- Confidential psychological guidance counseling files
- Disciplinary hearings, violations, investigations, and imposed sanctions

### 16. Institutional Operations: Inventory, HR, Announcements, Graduation
- University fixed assets and IT inventory tracking
- HR staff roster, employment types, and leave tracking
- Campus-wide announcements broadcast with priority tags
- Graduation candidate list with automated **Latin Honors** (Summa Cum Laude, Magna Cum Laude, Cum Laude)

### 17. QR Verification Portal
- Live token validator for Student IDs, Transcripts, and Clearances
- Verifies cryptographic validity and displays decrypted holder metadata

### 18. Reports & Analytics Suite
- Student Master List & Demographic Directories
- Real-time CSV file exporter and printable reports
- Recharts visualizations for revenue trajectory and degree enrollment

---

## 🎨 UI/UX Design System
- **Glassmorphism Aesthetic**: Backdrop blur (`backdrop-blur-xl`), soft borders, layered shadows, modern typography (Plus Jakarta Sans).
- **Responsive Layout**: Collapsible sidebar, mobile slide-over drawers, responsive data grids.
- **Dark & Light Mode**: Seamless instant theme toggle with persistent user preference.
- **Production Ready**: Optimized bundle size, robust error boundaries, skeleton loaders, and interactive toast notifications.
