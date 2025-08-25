const express = require('express');
const {
  getCompanies,
  getAvailableSlots,
  registerStudent,
  getStudentAppointments,
  cancelAppointment,
  getCareerFairStats
} = require('../controllers/careerFairController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/companies', getCompanies);
router.get('/available-slots/:date', getAvailableSlots);
router.post('/register', registerStudent);
router.get('/student/:email/appointments', getStudentAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);

// Admin routes
router.get('/stats', protect, admin, getCareerFairStats);

module.exports = router;