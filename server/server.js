const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const fileUpload = require('express-fileupload');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());

// ⚠️ Don't parse JSON before multer routes
// (Multer needs raw form-data stream)
app.use('/api/career-fair', require('./routes/careerFair')); // <-- multer handles multipart

// ✅ After multer routes, add JSON parsers for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File Upload (if used elsewhere)
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  createParentPath: true,
  abortOnLimit: true,
  responseOnLimit: 'CV file size is too large (max 2MB)'
}));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'beWanted Server is running!', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    services: {
      database: 'connected',
      careerFair: 'active'
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to beWanted API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      careerFair: '/api/career-fair'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 beWanted Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🎯 Career Fair API: http://localhost:${PORT}/api/career-fair`);
});
