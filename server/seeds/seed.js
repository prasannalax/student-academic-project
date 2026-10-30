const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('../models/User');
const Note = require('../models/Note');
const Review = require('../models/Review');
const Report = require('../models/Report');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const NoteRequest = require('../models/NoteRequest');
const Task = require('../models/Task');

// Sample mock note files creation helper
const createSampleFiles = () => {
  const notesDir = path.join(__dirname, '../uploads/notes');
  const assignmentsDir = path.join(__dirname, '../uploads/assignments');
  [notesDir, assignmentsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const sampleFiles = [
    {
      name: 'computer_networks_ch1_ethernet.txt',
      content: `COMPUTER NETWORKS - LECTURE NOTES (CSE DEPARTMENT)
Date: September 20, 2026
Instructor: Prof. Sarah Jenkins
Topic: Physical Layer, Ethernet Standards, CSMA/CD

1. Introduction to Ethernet (IEEE 802.3)
Ethernet enables devices to communicate with each other via a common network language.

2. CSMA/CD Protocol (Carrier Sense Multiple Access with Collision Detection)
- Carrier Sense: Listen before transmitting. If channel is busy, wait.
- Multiple Access: Multiple stations share the transmission medium.
- Collision Detection: If two stations transmit simultaneously, collision occurs. Both send jam signals and back off.
`,
    },
    {
      name: 'data_mining_apriori_algorithm.txt',
      content: `DATA MINING & WAREHOUSING - LECTURE NOTES (CSE 3 EXCLUSIVE)
Module: Association Rule Mining & Apriori Algorithm
Instructor: Prof. Sarah Jenkins

1. Association Rule Concepts:
- Support: Percentage of transactions containing both Itemset A and B
- Confidence: Conditional probability P(B|A) = Support(A U B) / Support(A)
`,
    },
    {
      name: 'ai_heuristics_astar_search.txt',
      content: `ARTIFICIAL INTELLIGENCE - LECTURE SUMMARY (CSE 3 STUDENT NOTES)
Topic: Informed Search Algorithms & A* Search
Class Date: September 19, 2026
Notes by: Maria Chen (Roll: 324103210128, Section: CSE 3)

1. Best-First Search & Heuristic Evaluation Function:
f(n) = g(n) + h(n)
Where:
- g(n) = exact path cost from start node to current node n
- h(n) = estimated cost from current node n to goal state
`,
    },
    {
      name: 'cse1_python_lab_notes.txt',
      content: `PYTHON PROGRAMMING & DATA STRUCTURES (CSE 1 STUDENT NOTES)
Topic: Recursion and Binary Search Trees
Class Date: September 22, 2026
Notes by: David Kumar (Roll: 324103210001, Section: CSE 1)

1. BST In-Order Traversal yields sorted order.
`,
    },
    {
      name: 'wireshark_lab_handout.txt',
      content: `LAB ASSIGNMENT HANDOUT: PACKET ANALYSIS USING WIRESHARK
Department of Computer Science & Engineering (CSE)

Objective:
1. Capture HTTP and DNS packets using Wireshark.
2. Analyze 3-way TCP handshake (SYN, SYN-ACK, ACK).
`,
    },
  ];

  sampleFiles.forEach((file) => {
    const fullPath = path.join(notesDir, file.name);
    fs.writeFileSync(fullPath, file.content, 'utf-8');
  });

  fs.writeFileSync(
    path.join(assignmentsDir, 'wireshark_lab_handout.txt'),
    sampleFiles[4].content,
    'utf-8'
  );
};

const seedDatabase = async () => {
  try {
    const connUri =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/student_academic_companion';
    await mongoose.connect(connUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Note.deleteMany({}),
      Review.deleteMany({}),
      Report.deleteMany({}),
      Assignment.deleteMany({}),
      Announcement.deleteMany({}),
      Notification.deleteMany({}),
      NoteRequest.deleteMany({}),
      Task.deleteMany({}),
    ]);
    console.log('Previous records cleared.');

    createSampleFiles();
    console.log('Sample files generated on disk.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Dr. Arthur Pendelton',
      email: 'admin@companion.edu',
      password: 'Password123!',
      role: 'admin',
      department: 'CSE',
      section: null,
      semester: 'All',
      rollOrEmployeeId: 'ADM-001',
      bio: 'Head of Academic Administration & Platform Coordinator.',
    });

    const teacherUser = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@companion.edu',
      password: 'Password123!',
      role: 'faculty',
      department: 'CSE',
      section: null,
      semester: 'Semester 5',
      rollOrEmployeeId: 'FAC-102',
      bio: 'Associate Professor, Department of Computer Science & Engineering.',
    });

    // Student 1: CSE 3
    const studentUser1 = await User.create({
      name: 'Alex Rivera',
      rollNumber: '324103210127',
      email: '324103210127.alex@gvpcew.ac.in',
      password: 'Password123!',
      role: 'student',
      department: 'CSE',
      section: 'CSE 3',
      semester: 'Semester 5',
      rollOrEmployeeId: '324103210127',
      bio: '5th Semester CSE 3 Student. Class Representative.',
    });

    // Student 2: CSE 3 (classmate of Alex)
    const studentUser2 = await User.create({
      name: 'Maria Chen',
      rollNumber: '324103210128',
      email: '324103210128.maria@gvpcew.ac.in',
      password: 'Password123!',
      role: 'student',
      department: 'CSE',
      section: 'CSE 3',
      semester: 'Semester 5',
      rollOrEmployeeId: '324103210128',
      bio: 'Junior CSE 3 Student interested in Artificial Intelligence and Data Mining.',
    });

    // Student 3: CSE 1 (for cross-section testing)
    const studentUser3 = await User.create({
      name: 'David Kumar',
      rollNumber: '324103210001',
      email: '324103210001.david@gvpcew.ac.in',
      password: 'Password123!',
      role: 'student',
      department: 'CSE',
      section: 'CSE 1',
      semester: 'Semester 5',
      rollOrEmployeeId: '324103210001',
      bio: 'CSE 1 Student focused on Systems Programming.',
    });

    console.log('Users created: Admin, Faculty, CSE 3 Students (Alex, Maria), CSE 1 Student (David).');

    // 2. Create Notes
    // Note 1: Faculty material for All CSE Sections
    const note1 = await Note.create({
      title: 'Computer Networks - Chapter 1: Ethernet Standards & CSMA/CD',
      subject: 'Computer Networks',
      topic: 'Ethernet & CSMA/CD Protocol',
      description: 'Official lecture notes detailing IEEE 802.3 standards and CSMA/CD.',
      fileUrl: '/uploads/notes/computer_networks_ch1_ethernet.txt',
      originalFileName: 'computer_networks_ch1_ethernet.txt',
      fileType: 'TXT',
      fileSize: 1024,
      uploader: teacherUser._id,
      uploaderName: teacherUser.name,
      uploaderRole: 'faculty',
      department: 'CSE',
      section: 'All CSE Sections',
      targetSection: 'All CSE Sections',
      semester: 'Semester 5',
      classDate: new Date('2026-09-20'),
      isTeacherMaterial: true,
      averageRating: 4.8,
      totalReviews: 2,
      downloadCount: 42,
      viewCount: 110,
      status: 'active',
    });

    // Note 2: Faculty material targeted specifically to CSE 3
    const note2 = await Note.create({
      title: 'Data Mining & Warehousing - Apriori Algorithm & Association Rules',
      subject: 'Data Mining',
      topic: 'Apriori Algorithm & Frequent Itemsets',
      description: 'Worked examples on frequent itemsets and rule generation tailored for CSE 3.',
      fileUrl: '/uploads/notes/data_mining_apriori_algorithm.txt',
      originalFileName: 'data_mining_apriori_algorithm.txt',
      fileType: 'TXT',
      fileSize: 850,
      uploader: teacherUser._id,
      uploaderName: teacherUser.name,
      uploaderRole: 'faculty',
      department: 'CSE',
      section: 'CSE 3',
      targetSection: 'CSE 3',
      semester: 'Semester 5',
      classDate: new Date('2026-09-18'),
      isTeacherMaterial: true,
      averageRating: 5.0,
      totalReviews: 1,
      downloadCount: 31,
      viewCount: 88,
      status: 'active',
    });

    // Note 3: Student Note uploaded by Maria Chen in CSE 3
    const note3 = await Note.create({
      title: 'Artificial Intelligence - State Space Search & A* Heuristics',
      subject: 'Artificial Intelligence',
      topic: 'Informed Search and A* Heuristic Design',
      description: 'Comprehensive classroom notes taken during CSE 3 lecture.',
      fileUrl: '/uploads/notes/ai_heuristics_astar_search.txt',
      originalFileName: 'ai_heuristics_astar_search.txt',
      fileType: 'TXT',
      fileSize: 920,
      uploader: studentUser2._id,
      uploaderName: studentUser2.name,
      uploaderRole: 'student',
      department: 'CSE',
      section: 'CSE 3',
      targetSection: 'CSE 3',
      semester: 'Semester 5',
      classDate: new Date('2026-09-19'),
      isTeacherMaterial: false,
      averageRating: 4.5,
      totalReviews: 1,
      downloadCount: 19,
      viewCount: 54,
      status: 'active',
    });

    // Note 4: Student Note uploaded by David Kumar in CSE 1
    const note4 = await Note.create({
      title: 'Python Programming - Data Structures & BST Traversal',
      subject: 'Python Programming',
      topic: 'Binary Search Trees & Traversal',
      description: 'Lab practical notes for CSE 1 section.',
      fileUrl: '/uploads/notes/cse1_python_lab_notes.txt',
      originalFileName: 'cse1_python_lab_notes.txt',
      fileType: 'TXT',
      fileSize: 740,
      uploader: studentUser3._id,
      uploaderName: studentUser3.name,
      uploaderRole: 'student',
      department: 'CSE',
      section: 'CSE 1',
      targetSection: 'CSE 1',
      semester: 'Semester 5',
      classDate: new Date('2026-09-22'),
      isTeacherMaterial: false,
      averageRating: 4.0,
      totalReviews: 0,
      downloadCount: 12,
      viewCount: 40,
      status: 'active',
    });

    console.log('Notes created successfully with section mappings.');

    // 3. Create Reviews
    await Review.create([
      {
        note: note1._id,
        user: studentUser1._id,
        userName: studentUser1.name,
        userRole: 'student',
        rating: 5,
        comment: 'Great explanation on CSMA/CD and collision handling!',
      },
      {
        note: note3._id,
        user: studentUser1._id,
        userName: studentUser1.name,
        userRole: 'student',
        rating: 4.5,
        comment: 'Very neat notes for A* search, thanks Maria!',
      },
    ]);

    // 4. Create Student Notes Request in CSE 3
    await NoteRequest.create({
      requester: studentUser1._id,
      requesterName: studentUser1.name,
      department: 'CSE',
      section: 'CSE 3',
      semester: 'Semester 5',
      subject: 'Computer Networks',
      topic: 'Sliding Window Protocols (Go-Back-N & Selective Repeat)',
      classDate: new Date('2026-09-25'),
      description: 'Missed class due to placement interview. Need handwritten notes with sequence number diagrams.',
      status: 'Pending',
    });
    console.log('CSE 3 Notes Request created.');

    // 5. Create Assignments
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    await Assignment.create([
      {
        title: 'Computer Networks Lab 3: Packet Sniffing & TCP Analysis',
        description: 'Analyze captured network traffic using Wireshark for all CSE sections.',
        subject: 'Computer Networks',
        department: 'CSE',
        targetSection: 'All CSE Sections',
        semester: 'Semester 5',
        deadline: oneWeekFromNow,
        createdBy: teacherUser._id,
        creatorName: teacherUser.name,
        attachmentUrl: '/uploads/assignments/wireshark_lab_handout.txt',
        originalFileName: 'wireshark_lab_handout.txt',
        completedBy: [studentUser1._id],
      },
      {
        title: 'Data Mining Mini-Project: Frequent Pattern Analysis (CSE 3)',
        description: 'Implement Apriori algorithm in Python. Specific to CSE 3 lab batch.',
        subject: 'Data Mining',
        department: 'CSE',
        targetSection: 'CSE 3',
        semester: 'Semester 5',
        deadline: twoWeeksFromNow,
        createdBy: teacherUser._id,
        creatorName: teacherUser.name,
        completedBy: [],
      },
    ]);
    console.log('Assignments created.');

    // 6. Create Section Tasks
    await Task.create([
      {
        title: 'Submit Unit 1 Tutorial Problems',
        description: 'Solve problems 1-10 on page 45 of Kurose & Ross and submit handwritten copy.',
        subject: 'Computer Networks',
        department: 'CSE',
        targetSection: 'CSE 3',
        semester: 'Semester 5',
        deadline: oneWeekFromNow,
        createdBy: teacherUser._id,
        creatorName: teacherUser.name,
        creatorRole: 'faculty',
        completedBy: [],
      },
    ]);
    console.log('Section Task created.');

    // 7. Create Announcements
    await Announcement.create([
      {
        title: 'CSE Department Mid-Term Examination Timetable',
        description: 'Mid-term exams for all CSE sections commence October 12, 2026.',
        category: 'Exam',
        targetDepartment: 'CSE',
        targetSection: 'All CSE Sections',
        isImportant: true,
        createdBy: adminUser._id,
        creatorName: adminUser.name,
        creatorRole: 'admin',
      },
      {
        title: 'CSE 3 Class Committee Meeting & Feedback Session',
        description: 'Class committee meeting for CSE 3 section will be held in CR-304 on Friday.',
        category: 'General',
        targetDepartment: 'CSE',
        targetSection: 'CSE 3',
        isImportant: false,
        createdBy: teacherUser._id,
        creatorName: teacherUser.name,
        creatorRole: 'faculty',
      },
    ]);
    console.log('Announcements created.');

    console.log('\n==========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('CSE Student 1 (CSE 3):');
    console.log('  Roll Number: 324103210127');
    console.log('  Email:       324103210127.alex@gvpcew.ac.in');
    console.log('  Password:    Password123!');
    console.log('CSE Student 2 (CSE 3):');
    console.log('  Roll Number: 324103210128');
    console.log('  Email:       324103210128.maria@gvpcew.ac.in');
    console.log('  Password:    Password123!');
    console.log('CSE Student 3 (CSE 1):');
    console.log('  Roll Number: 324103210001');
    console.log('  Email:       324103210001.david@gvpcew.ac.in');
    console.log('  Password:    Password123!');
    console.log('Faculty:');
    console.log('  Email:       teacher@companion.edu');
    console.log('  Password:    Password123!');
    console.log('Admin:');
    console.log('  Email:       admin@companion.edu');
    console.log('  Password:    Password123!');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
