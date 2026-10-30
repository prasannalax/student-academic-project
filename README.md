# Student Academic Companion

> A centralized academic resource and class sharing platform built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js), exclusively designed for the **Computer Science & Engineering (CSE)** department.

---

## 1. Problem Statement & Motivation

Many students frequently miss college classes due to:
* **Illness & medical emergencies**
* **Internships & placement interview drives**
* **Project work & hackathons**
* **Academic workshops, symposiums & seminars**
* **Personal reasons**

When absent, students often depend on fragmented WhatsApp groups or busy classmates to obtain class notes. The notes are frequently incomplete, scattered across chat histories, or completely lost.

**Student Academic Companion** replaces scattered group chats with an organized platform where students and faculty can upload, search, view, download, rate, request, and moderate academic resources anytime with strict department and section-based access control.

---

## 2. Department & Section Structure

The application is exclusively dedicated to the **Computer Science & Engineering (CSE)** department across four sections:

| Section | Roll Number Allocation Range | Status |
| :--- | :--- | :--- |
| **CSE 1** | `324103210001` - `324103210063` | Active |
| **CSE 2** | `324103210064` - `324103210126` | Active |
| **CSE 3** | `324103210127` - `324103210189` | Active (Mandatory Range) |
| **CSE 4** | `324103210190` - `324103210250` | Active |
| **Total CSE** | `324103210001` - `324103210250` | Department Exclusive |

> **Security Guard:** Students from ECE, EEE, and other departments or roll numbers outside the CSE range cannot register or log in. All four section ranges are stored in a modular configuration at `server/config/sections.js`.

---

## 3. Secure Student Registration & College Email Verification

### Registration Rules:
1. **Student Name**
2. **Roll Number**: 12-digit number strictly within `324103210001` - `324103210250`.
3. **Official College Email**: Mandatory format `rollnumber.name@gvpcew.ac.in` (e.g. `324103210127.alex@gvpcew.ac.in`).
4. **Auto-Assigned Section**: Section is automatically determined from the roll number and locked.
5. **Password & Confirm Password**: Minimum 6 characters.

### Flexible Authentication:
* Students can sign in using their **Roll Number** or **College Email** and password.
* Faculty sign in using their credentials and password.

---

## 4. Pre-configured Demo Accounts

| Role | Roll Number | College Email | Password | Section / Department |
| :--- | :--- | :--- | :--- | :--- |
| **👨‍🎓 Student 1** | `324103210127` | `324103210127.alex@gvpcew.ac.in` | `Password123!` | Alex Rivera &bull; **CSE 3** |
| **👩‍🎓 Student 2** | `324103210128` | `324103210128.maria@gvpcew.ac.in` | `Password123!` | Maria Chen &bull; **CSE 3** |
| **👨‍🎓 Student 3** | `324103210001` | `324103210001.david@gvpcew.ac.in` | `Password123!` | David Kumar &bull; **CSE 1** |
| **👩‍🏫 Faculty** | `FAC-102` | `teacher@companion.edu` | `Password123!` | Prof. Sarah Jenkins &bull; **Faculty** |
| **🛡️ Admin** | `ADM-001` | `admin@companion.edu` | `Password123!` | Dr. Arthur Pendelton &bull; **Admin** |

*(Quick One-Click Sign-In buttons are available on the Login page!)*

---

## 5. Section-Based Isolation Matrix

1. **Sharing Notes**:
   * Notes uploaded by students are locked to their assigned section.
   * CSE 3 students can only access CSE 3 student notes and faculty materials.
   * Direct file download endpoints verify section authorization (`403 Forbidden` on mismatch).
2. **Student-to-Student Notes Requests**:
   * Students can submit notes requests for specific subjects, topics, or missed lecture dates.
   * Notifications and requests are sent **only** to classmates in the same section.
   * Faculty members are strictly excluded and cannot access notes requests.
3. **Faculty Material Targeting**:
   * Faculty can publish notes, assignments, tasks, and announcements targeted to `All CSE Sections` or specific sections (`CSE 1`, `CSE 2`, `CSE 3`, `CSE 4`).
4. **Section Tasks & Assignments**:
   * Dedicated tab for Section Tasks where students track deadlines and mark items completed.

---

## 6. How to Run Locally

### Prerequisites
* **Node.js** (v18+) and **npm**
* **MongoDB** running on `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies & Seed Database
```bash
# In server directory:
cd server
npm install
node seeds/seed.js     # Seeds CSE students, faculty, notes, and tasks

# In client directory:
cd ../client
npm install
```

### Step 2: Run Verification Test Suite
```bash
cd server
node tests/verify_access_control.js
# Runs all 18 automated tests for boundary checks, email format, and section isolation
```

### Step 3: Start the Backend Server
```bash
cd server
npm start
# Server starts on http://localhost:5000
```

### Step 4: Start the Frontend Client
```bash
cd client
npm run dev
# Vite dev server starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser to start using Student Academic Companion!
