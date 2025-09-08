const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', require('./routes/auth'));
//app.use('/api/users', require('./routes/users'));
app.use('/api/career-fair', require('./routes/careerFair')); // ← ADD THIS LINE

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
      //auth: '/api/auth',
      //users: '/api/users',
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
  console.log(`🎯 Career Fair API: http://localhost:${PORT}/api/career-fair`); // ← ADD THIS LINE
});