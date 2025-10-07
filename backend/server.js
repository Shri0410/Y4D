const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Add this import
const impactDataRoutes = require('./routes/impactData');
require('dotenv').config();

const db = require('./config/database');
const { authenticateToken } = require('./middleware/auth');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const dirs = ['mentors', 'management', 'board-trustees', 'accreditations', 'reports']; // Add accreditations here
  dirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created upload directory: ${dirPath}`);
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/registration', require('./routes/registration'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/management', require('./routes/management'));
app.use('/api/careers', require('./routes/careers'));
app.use('/api/media', require('./routes/media'));
app.use('/api/our-work', require('./routes/OurWork'));
app.use('/api/quality-education', require('./routes/QualityEducation'));
app.use('/api/livelihood', require('./routes/livelihood'));
app.use('/api/healthcare', require('./routes/healthcare'));
app.use('/api/environment-sustainability', require('./routes/environmentSustainability'));
app.use('/api/integrated-development', require('./routes/integratedDevelopment'));
app.use('/api/board-trustees', require('./routes/boardTrustees'));
app.use('/api/accreditations', require('./routes/accreditations')); // Add this line
app.use('/api', impactDataRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});
app.get('/api/accreditations', async (req, res) => {
  try {
    const accreditations = await Accreditation.find();
    res.json(accreditations);
  } catch (error) {
    console.error('Error fetching accreditations:', error);
    res.status(500).json({ error: 'Failed to fetch accreditations' });
  }
});
// Database test route
app.get('/api/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Database connection successful', solution: results[0].solution });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});