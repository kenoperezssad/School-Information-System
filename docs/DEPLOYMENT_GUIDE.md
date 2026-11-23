# ApexSIS — Deployment & Installation Guide

This guide provides end-to-end instructions for deploying the **ApexSIS School Information System** on a single workstation, migrating to another computer, or running across a local campus network.

---

## 1. System Requirements

### Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk Space:** At least 2 GB of free disk space

### Software Prerequisites
1. **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org)
2. **XAMPP** (PHP 8.0+ and MySQL / MariaDB) — [Download XAMPP](https://www.apachefriends.org)
3. **Git** (optional, for repository synchronization) — [Download Git](https://git-scm.com)
4. **Modern Web Browser** — Google Chrome, Microsoft Edge, or Mozilla Firefox

---

## 2. Fresh Installation on a New Laptop / Workstation

### Step 1: Clone or Copy the Repository
Open your terminal / command prompt:
```bash
git clone https://github.com/kenoperezssad/School-Information-System.git
cd "School-Information-System"
```
*(Or copy the project folder from your USB storage drive).*

### Step 2: Install Node Dependencies
Inside the project root directory, install all required packages:
```bash
npm install
```

### Step 3: Configure Environment Variables (.env)
You can configure the `.env` file using one of the following methods:

- **Method A (Automatic):** Double-click `CREATE-ENV-FILE.bat` in the project root.
- **Method B (Manual):** Copy `.env.example` to `.env` using your terminal:
  ```bash
  copy .env.example .env
  ```

Your `.env` file will contain:
```ini
# --- Database Configuration ---
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=school_information_system
DB_USER=root
DB_PASS=

# --- JWT Secret Key ---
JWT_SECRET=ApexSIS_Super_Secure_Secret_Key_2026_Enterprise_System_DeepMind!

# --- CORS Allowed Origins ---
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176

# --- Environment ---
APP_ENV=development
```

> **Note:** The backend has built-in fallbacks. Even if `.env` is absent, it defaults to `127.0.0.1`, user `root`, empty password, and a pre-configured secure JWT key.

### Step 4: Start MySQL in XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (and optionally **Apache** if using phpMyAdmin).
3. Verify that the MySQL status indicator turns green and displays port `3306`.

### Step 5: Initialize the Database

Choose either of the two methods below:

#### Method A: Browser Auto-Initializer (Easiest)
1. Start the server (see Step 6).
2. Open your web browser and navigate to:
   👉 **`http://localhost:8000/api/setup_database.php`**
3. The browser will respond with:
   ```json
   {
     "success": true,
     "message": "Database initialized and seeded successfully with all SIS entities!"
   }
   ```
   *All 32 relational tables and seed records are automatically created.*

#### Method B: phpMyAdmin Import
1. Open **phpMyAdmin** at `http://localhost/phpmyadmin`.
2. Click the **Import** tab at the top.
3. Click **Choose File** and select `apexsis_database_export.sql` located in the root of the project folder.
4. Click **Go** at the bottom.

---

## 3. Launching the Application

Run the combined startup script in the project root:
```bash
npm run dev
```

This command initiates two background services concurrently:
1. **PHP Built-in Server** on `http://127.0.0.1:8000` (serving the `/api` REST endpoints).
2. **Vite Development Server** on `http://localhost:5173` (serving the React Frontend).

Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 4. Default Seed Credentials

All pre-seeded demo accounts share the standard password: **`Admin@123`**

| Role | Email / Login | Password |
| :--- | :--- | :--- |
| **Super Administrator** | `admin@school.edu` | `Admin@123` |
| **University Registrar** | `registrar@school.edu` | `Admin@123` |
| **Faculty / Teacher** | `faculty@school.edu` | `Admin@123` |
| **Student** | `student@school.edu` | `Admin@123` |
| **Parent / Guardian** | `parent@school.edu` | `Admin@123` |
| **Accountant / Cashier** | `accountant@school.edu` | `Admin@123` |
| **Librarian** | `librarian@school.edu` | `Admin@123` |
| **Guidance Counselor** | `guidance@school.edu` | `Admin@123` |
| **School Nurse** | `nurse@school.edu` | `Admin@123` |

---

## 5. Local Area Network (LAN) / Multi-PC Setup

To present the system with multiple devices (e.g. tablet for student, laptop for registrar) on the same Wi-Fi router:

1. Determine your host computer's local IP address:
   ```bash
   ipconfig
   ```
   *(e.g., `192.168.1.50`)*

2. In `vite.config.js`, verify `host: true` or pass the `--host` flag:
   ```bash
   npx vite --host
   ```

3. Update `.env` on the host computer:
   ```ini
   CORS_ORIGINS=http://localhost:5173,http://192.168.1.50:5173
   ```

4. Other devices on the same Wi-Fi can now open:
   `http://192.168.1.50:5173`

---

## 6. Troubleshooting Common Issues

### Issue A: "Request failed with status code 500"
- **Cause:** MySQL server is stopped, or the database tables have not been created.
- **Fix:** Open XAMPP and click **Start** on **MySQL**. Then visit `http://localhost:8000/api/setup_database.php` in your browser to verify table initialization.

### Issue B: "Invalid email or password credentials"
- **Cause:** Passwords were wiped or imported without proper bcrypt hashing.
- **Fix:** In phpMyAdmin, import `apexsis_reset_passwords.sql`, or visit `http://localhost:8000/api/setup_database.php` to regenerate fresh hashes for all 9 demo accounts.

### Issue C: "Server misconfiguration: JWT_SECRET is not set"
- **Cause:** Outdated backend code missing the default secret fallback.
- **Fix:** Run `git pull` to fetch the latest code from GitHub, or ensure `JWT_SECRET` is defined in `.env`.

### Issue D: Port 8000 or Port 5173 is already in use
- **Cause:** A previous instance of PHP or Node is still running in the background.
- **Fix (Windows Command Prompt):**
  ```cmd
  taskkill /F /IM php.exe
  taskkill /F /IM node.exe
  ```
  Then re-run `npm run dev`.
