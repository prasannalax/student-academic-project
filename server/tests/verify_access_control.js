/**
 * Comprehensive Automated Verification Script for
 * Department & Section Access Control + Secure College Email Registration
 * (Using native fetch)
 */

const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = 'http://localhost:5001';

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING ACCESS CONTROL & EMAIL VALIDATION TEST SUITE');
  console.log('======================================================\n');

  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const connectDB = require('../config/db');

  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/notes', require('../routes/noteRoutes'));
  app.use('/api/note-requests', require('../routes/noteRequestRoutes'));
  app.use('/api/assignments', require('../routes/assignmentRoutes'));
  app.use('/api/announcements', require('../routes/announcementRoutes'));
  app.use('/api/tasks', require('../routes/taskRoutes'));

  const server = app.listen(5001);
  console.log('Test server active on port 5001.');

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, testName) => {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  };

  try {
    // -----------------------------------------------------------
    // TEST GROUP 1: Roll Number & Department Boundary Checks
    // -----------------------------------------------------------
    console.log('\n--- 1. Testing Roll Number & Department Boundary Checks ---');

    // 1.1 Out-of-bounds roll number (> 324103210250)
    const res1 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Student',
        rollNumber: '324103210999',
        email: '324103210999.invalid@gvpcew.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    assert(res1.status === 400, 'Rejects out-of-range roll number (324103210999) with 400');

    // 1.2 Non-CSE department roll number (e.g. ECE department code 324102...)
    const res2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'ECE Student',
        rollNumber: '324102210001',
        email: '324102210001.ece@gvpcew.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    assert(res2.status === 400, 'Rejects non-CSE department student with 400');

    // -----------------------------------------------------------
    // TEST GROUP 2: College Email Verification Rules
    // -----------------------------------------------------------
    console.log('\n--- 2. Testing College Email Format & Correlation Rules ---');

    // 2.1 Non-college domain (@gmail.com)
    const res3 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya Sharma',
        rollNumber: '324103210130',
        email: '324103210130.ananya@gmail.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    const body3 = await res3.json();
    assert(
      res3.status === 400 && body3.message.includes('@gvpcew.ac.in'),
      'Rejects non-college email domain (@gmail.com) with domain error'
    );

    // 2.2 Mismatched roll number in email prefix
    const res4 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya Sharma',
        rollNumber: '324103210130',
        email: '324103210188.ananya@gvpcew.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    const body4 = await res4.json();
    assert(
      res4.status === 400 && body4.message.includes('does not match'),
      'Rejects email roll prefix mismatch with clear error message'
    );

    // 2.3 Invalid email pattern (missing name component between roll and domain)
    const res5 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya Sharma',
        rollNumber: '324103210130',
        email: '324103210130@gvpcew.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    assert(res5.status === 400, 'Rejects invalid email format without student name with 400');

    // 2.4 Valid CSE 3 Student Registration
    // Clean up if existing
    const User = require('../models/User');
    await User.deleteOne({ rollNumber: '324103210130' });

    const res6 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ananya Sharma',
        rollNumber: '324103210130',
        email: '324103210130.ananya@gvpcew.ac.in',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    });
    const body6 = await res6.json();
    assert(res6.status === 201, 'Successfully registers valid CSE 3 student');
    assert(body6.user.section === 'CSE 3', 'Auto-assigns correct section: CSE 3');
    assert(body6.user.department === 'CSE', 'Auto-assigns department: CSE');

    // -----------------------------------------------------------
    // TEST GROUP 3: Flexible Login with Roll Number or Email
    // -----------------------------------------------------------
    console.log('\n--- 3. Testing Login with Roll Number & College Email ---');

    // 3.1 Login via Roll Number
    const rollLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '324103210130',
        password: 'Password123!',
      }),
    });
    const rollLoginBody = await rollLogin.json();
    assert(rollLogin.status === 200 && rollLoginBody.token, 'Student successfully logs in using Roll Number');

    // 3.2 Login via College Email
    const emailLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '324103210130.ananya@gvpcew.ac.in',
        password: 'Password123!',
      }),
    });
    const emailLoginBody = await emailLogin.json();
    assert(emailLogin.status === 200 && emailLoginBody.token, 'Student successfully logs in using College Email');

    // -----------------------------------------------------------
    // TEST GROUP 4: Section-Based Isolation for Notes & Downloads
    // -----------------------------------------------------------
    console.log('\n--- 4. Testing Section Isolation for Sharing Notes & Downloads ---');

    // Login Alex (CSE 3)
    const alexRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '324103210127',
        password: 'Password123!',
      }),
    });
    const alexToken = (await alexRes.json()).token;

    // Login David (CSE 1)
    const davidRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '324103210001',
        password: 'Password123!',
      }),
    });
    const davidToken = (await davidRes.json()).token;

    // 4.1 Alex (CSE 3) queries notes
    const alexNotesRes = await fetch(`${BASE_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const alexVisibleNotes = (await alexNotesRes.json()).data;
    const hasCSE1NoteInAlexView = alexVisibleNotes.some((n) => n.section === 'CSE 1');
    assert(!hasCSE1NoteInAlexView, 'CSE 3 student CANNOT see student notes from CSE 1');

    // 4.2 David (CSE 1) queries notes
    const davidNotesRes = await fetch(`${BASE_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${davidToken}` },
    });
    const davidVisibleNotes = (await davidNotesRes.json()).data;
    const hasCSE3NoteInDavidView = davidVisibleNotes.some(
      (n) => n.section === 'CSE 3' && !n.isTeacherMaterial
    );
    assert(!hasCSE3NoteInDavidView, 'CSE 1 student CANNOT see student notes from CSE 3');

    // Find note uploaded by Maria Chen in CSE 3
    const Note = require('../models/Note');
    const cse3Note = await Note.findOne({ section: 'CSE 3', isTeacherMaterial: false });

    // 4.3 David (CSE 1) attempts direct download of CSE 3 student note -> Must return 403 Forbidden!
    const davidDownloadRes = await fetch(`${BASE_URL}/api/notes/${cse3Note._id}/download`, {
      headers: { Authorization: `Bearer ${davidToken}` },
    });
    assert(
      davidDownloadRes.status === 403,
      'Direct download protection: Returns 403 Forbidden on cross-section download attempt'
    );

    // 4.4 Alex (CSE 3) downloads same CSE 3 note -> Must succeed (200)
    const alexDownloadRes = await fetch(`${BASE_URL}/api/notes/${cse3Note._id}/download`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    assert(alexDownloadRes.status === 200, 'Same-section student can download notes successfully');

    // -----------------------------------------------------------
    // TEST GROUP 5: Student Notes Requests Section Isolation
    // -----------------------------------------------------------
    console.log('\n--- 5. Testing Student Notes Requests Section Isolation ---');

    // 5.1 CSE 3 student gets notes requests
    const alexRequestsRes = await fetch(`${BASE_URL}/api/note-requests`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const alexRequests = (await alexRequestsRes.json()).data;
    assert(
      alexRequests.every((r) => r.section === 'CSE 3'),
      'CSE 3 student only receives/views requests from CSE 3 section'
    );

    // 5.2 Faculty attempts to access student-to-student notes requests -> Must be rejected with 403
    const facultyLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'teacher@companion.edu',
        password: 'Password123!',
      }),
    });
    const facultyToken = (await facultyLoginRes.json()).token;

    const facultyRequestsRes = await fetch(`${BASE_URL}/api/note-requests`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    assert(
      facultyRequestsRes.status === 403,
      'Faculty access to student notes requests strictly forbidden (403)'
    );

    // -----------------------------------------------------------
    // TEST GROUP 6: Section Tasks & Assignments Section Isolation
    // -----------------------------------------------------------
    console.log('\n--- 6. Testing Section Tasks & Assignments Targeting ---');

    // 6.1 Alex (CSE 3) views section tasks
    const alexTasksRes = await fetch(`${BASE_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${alexToken}` },
    });
    const alexTasks = (await alexTasksRes.json()).data;
    assert(
      alexTasks.every(
        (t) => t.targetSection === 'CSE 3' || t.targetSection === 'All CSE Sections'
      ),
      'Alex sees tasks targeted to CSE 3 or All CSE Sections'
    );

    // 6.2 Toggle task complete
    if (alexTasks.length > 0) {
      const taskId = alexTasks[0]._id;
      const toggleRes = await fetch(`${BASE_URL}/api/tasks/${taskId}/toggle-complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${alexToken}` },
      });
      const toggleBody = await toggleRes.json();
      assert(toggleBody.success === true, 'Student can toggle completion of section task');
    }

    console.log('\n======================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================\n');
  } catch (testError) {
    console.error('\n❌ Test suite failed:', testError.message);
  } finally {
    server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

runTests();
