const express = require('express');
const {
  getCompanies,
  getAvailableSlots,
  registerStudent,
  getStudentAppointments,
  cancelAppointment,
  getCareerFairStats
} = require('../controllers/careerFairController');
// Remove: const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Keep all public routes
router.get('/companies', getCompanies);
router.get('/available-slots/:date', getAvailableSlots);
router.post('/register', registerStudent);
router.get('/student/:email/appointments', getStudentAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);

// Make stats public or remove if not needed
router.get('/stats', getCareerFairStats);  // Remove protect, admin

module.exports = router;