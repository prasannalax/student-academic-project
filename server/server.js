const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const noteRequestRoutes = require('./routes/noteRequestRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded documents statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Student Academic Companion API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/note-requests', noteRequestRoutes);
app.use('/api/tasks', taskRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Academic Companion Server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});
