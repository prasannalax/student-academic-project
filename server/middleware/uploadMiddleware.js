const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const notesDir = path.join(__dirname, '../uploads/notes');
const assignmentsDir = path.join(__dirname, '../uploads/assignments');

[notesDir, assignmentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.baseUrl.includes('assignments')) {
      cb(null, assignmentsDir);
    } else {
      cb(null, notesDir);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename and append unique timestamp
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(cleanName);
    const base = path.basename(cleanName, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|ppt|pptx|doc|docx|txt|png|jpg|jpeg|webp/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype =
    allowedExtensions.test(file.mimetype) ||
    file.mimetype.includes('pdf') ||
    file.mimetype.includes('presentation') ||
    file.mimetype.includes('powerpoint') ||
    file.mimetype.includes('word') ||
    file.mimetype.includes('document') ||
    file.mimetype.includes('image/') ||
    file.mimetype.includes('text/plain');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file format. Please upload PDF, PPT, PPTX, DOC, DOCX, TXT, or Image files.'
      )
    );
  }
};

// 25MB file size limit
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
