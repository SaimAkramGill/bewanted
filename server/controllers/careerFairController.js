const Company = require('../models/Company');
const Appointment = require('../models/Appointment');
const emailService = require('../services/emailService');


// @desc    Get all companies
// @route   GET /api/career-fair/companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true })
      .select('name industry positions description website logo')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies'
    });
  }
};

// @desc    Get available time slots for a specific date
// @route   GET /api/career-fair/available-slots/:date
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const requestedDate = new Date(date);
    
    // Validate date
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Get all booked slots for this date (non-cancelled appointments)
    const bookedAppointments = await Appointment.find({
      date: requestedDate,
      status: { $ne: 'cancelled' }
    }).select('timeSlot company');

    // Generate all available time slots
    const allTimeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + 15;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const adjustedEndMinute = endMinute >= 60 ? 0 : endMinute;
        const end = `${endHour.toString().padStart(2, '0')}:${adjustedEndMinute.toString().padStart(2, '0')}`;
        allTimeSlots.push(`${start} - ${end}`);
      }
    }

    // Create availability map
    const availability = {};
    const companies = await Company.find({ isActive: true }).select('_id name');
    
    companies.forEach(company => {
      availability[company._id] = {};
      allTimeSlots.forEach(slot => {
        const isBooked = bookedAppointments.some(
          apt => apt.timeSlot === slot && apt.company.toString() === company._id.toString()
        );
        availability[company._id][slot] = !isBooked;
      });
    });

    res.json({
      success: true,
      data: {
        date,
        timeSlots: allTimeSlots,
        availability,
        bookedSlots: bookedAppointments.length
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots'
    });
  }
};

// @desc    Register student and book appointments
// @route   POST /api/career-fair/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { studentInfo, appointments } = req.body;

    // Validate input
    if (!studentInfo || !appointments || appointments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student information and appointments are required'
      });
    }

    // Validate student info
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'fieldOfStudy', 'motivation'];
    for (const field of requiredFields) {
      if (!studentInfo[field] || !studentInfo[field].toString().trim()) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Create appointments with embedded student info
    const createdAppointments = [];
    const errors = [];

    for (const appointmentData of appointments) {
      for (const apt of appointmentData.appointments) {
        try {
          // Check if time slot is already booked for this company
          const existingCompanyAppointment = await Appointment.findOne({
            company: appointmentData.companyId,
            date: new Date(apt.date),
            timeSlot: apt.timeSlot,
            status: { $ne: 'cancelled' }
          });

          if (existingCompanyAppointment) {
            errors.push(`Time slot ${apt.timeSlot} is already booked for ${appointmentData.companyName}`);
            continue;
          }

          // Check if student already has appointment at this time
          const studentTimeConflict = await Appointment.findOne({
            'studentInfo.email': studentInfo.email.toLowerCase().trim(),
            date: new Date(apt.date),
            timeSlot: apt.timeSlot,
            status: { $ne: 'cancelled' }
          });

          if (studentTimeConflict) {
            errors.push(`You already have an appointment at ${apt.timeSlot} on ${apt.date}`);
            continue;
          }

          // Check if student already has appointment with this company on this date
          const studentCompanyConflict = await Appointment.findOne({
            'studentInfo.email': studentInfo.email.toLowerCase().trim(),
            company: appointmentData.companyId,
            date: new Date(apt.date),
            status: { $ne: 'cancelled' }
          });

          if (studentCompanyConflict) {
            errors.push(`You already have an appointment with ${appointmentData.companyName} on ${apt.date}`);
            continue;
          }

          // Create appointment with embedded student info
          const appointment = await Appointment.create({
            studentInfo: {
              firstName: studentInfo.firstName.trim(),
              lastName: studentInfo.lastName.trim(),
              email: studentInfo.email.toLowerCase().trim(),
              phoneNumber: studentInfo.phoneNumber.trim(),
              fieldOfStudy: studentInfo.fieldOfStudy,
              motivation: studentInfo.motivation.trim()
            },
            company: appointmentData.companyId,
            date: new Date(apt.date),
            timeSlot: apt.timeSlot
          });

          createdAppointments.push(appointment);
        } catch (error) {
          console.error('Appointment creation error:', error);
          if (error.code === 11000) {
            // Handle duplicate key error
            if (error.keyPattern && error.keyPattern['studentInfo.email']) {
              errors.push(`You already have an appointment at ${apt.timeSlot} on ${apt.date}`);
            } else if (error.keyPattern && error.keyPattern.company) {
              errors.push(`Time slot ${apt.timeSlot} is already booked for ${appointmentData.companyName}`);
            } else {
              errors.push(`Booking conflict for ${apt.timeSlot} with ${appointmentData.companyName}`);
            }
          } else {
            errors.push(`Failed to book ${apt.timeSlot} with ${appointmentData.companyName}: ${error.message}`);
          }
        }
      }
    }

    if (errors.length > 0 && createdAppointments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No appointments could be created',
        errors
      });
    }

    // Populate the created appointments with company details
    const populatedAppointments = await Appointment.find({
      _id: { $in: createdAppointments.map(apt => apt._id) }
    }).populate('company', 'name industry positions website');

    // Send emails after successful registration
    try {
      console.log('📧 Sending registration emails...');
      
      const emailResults = await emailService.sendRegistrationEmails(
        studentInfo, 
        populatedAppointments
      );

      console.log('📧 Email results:', {
        student: emailResults.student.success ? '✅ Sent' : '❌ Failed',
        admin: emailResults.admin.success ? '✅ Sent' : '❌ Failed'
      });

      // Don't fail the registration if emails fail
      if (!emailResults.student.success || !emailResults.admin.success) {
        console.warn('⚠️ Some emails failed to send, but registration was successful');
      }
    } catch (emailError) {
      console.error('📧 Email service error:', emailError);
      // Continue with successful response even if emails fail
    }

    res.status(201).json({
      success: true,
      message: `Successfully registered and booked ${createdAppointments.length} appointment${createdAppointments.length > 1 ? 's' : ''}. Confirmation emails have been sent.`,
      data: {
        student: {
          firstName: studentInfo.firstName,
          lastName: studentInfo.lastName,
          email: studentInfo.email,
          fieldOfStudy: studentInfo.fieldOfStudy
        },
        appointments: populatedAppointments,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// @desc    Get student appointments by email
// @route   GET /api/career-fair/student/:email/appointments
// @access  Public
const getStudentAppointments = async (req, res) => {
  try {
    const { email } = req.params;
    
    const appointments = await Appointment.find({ 
      'studentInfo.email': email.toLowerCase(),
      status: { $ne: 'cancelled' }
    })
    .populate('company', 'name industry positions website')
    .sort({ date: 1, timeSlot: 1 });

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for this email'
      });
    }

    res.json({
      success: true,
      data: {
        student: {
          firstName: appointments[0].studentInfo.firstName,
          lastName: appointments[0].studentInfo.lastName,
          email: appointments[0].studentInfo.email,
          fieldOfStudy: appointments[0].studentInfo.fieldOfStudy
        },
        appointments
      }
    });
  } catch (error) {
    console.error('Get student appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/career-fair/appointments/:id/cancel
// @access  Public
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        notes: reason || 'Cancelled by student'
      },
      { new: true }
    ).populate('company', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment'
    });
  }
};

// @desc    Get career fair statistics
// @route   GET /api/career-fair/stats
// @access  Public
const getCareerFairStats = async (req, res) => {
  try {
    // Get unique students count
    const uniqueStudents = await Appointment.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$studentInfo.email' } },
      { $count: 'totalStudents' }
    ]);

    const totalStudents = uniqueStudents[0]?.totalStudents || 0;
    const totalCompanies = await Company.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments({ status: { $ne: 'cancelled' } });
    
    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      },
      status: { $ne: 'cancelled' }
    });

    // Get popular companies
    const popularCompanies = await Appointment.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          name: '$company.name',
          appointments: '$count'
        }
      }
    ]);

    // Get field of study distribution
    const fieldDistribution = await Appointment.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$studentInfo.fieldOfStudy', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCompanies,
        totalAppointments,
        todayAppointments,
        popularCompanies,
        fieldDistribution
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

module.exports = {
  getCompanies,
  getAvailableSlots,
  registerStudent,
  getStudentAppointments,
  cancelAppointment,
  getCareerFairStats
};