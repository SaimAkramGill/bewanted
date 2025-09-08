const express = require('express');
const {
  getCompanies,
  getAvailableSlots,
  registerStudent,
  getStudentAppointments,
  cancelAppointment,
  getCareerFairStats,
  testEmailService,
  getAllRegistrations
} = require('../controllers/careerFairController');

const router = express.Router();

// Public routes
router.get('/companies', getCompanies);
router.get('/available-slots/:date', getAvailableSlots);
router.post('/register', registerStudent);
router.get('/student/:email/appointments', getStudentAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);

// Admin/Stats routes (now public since no auth)
router.get('/stats', getCareerFairStats);
router.get('/registrations', getAllRegistrations);

// Email testing route (remove in production)
router.post('/test-email', testEmailService);

module.exports = router;