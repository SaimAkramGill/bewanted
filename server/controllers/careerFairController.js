const moment = require('moment');
const Company = require('../models/Company');
const Appointment = require('../models/Appointment');
const emailService = require('../services/emailService');

// ============ TIMESLOT GENERATION ============

function generateTimeSlots(packageType) {
  const slots = [];
  
  const morningStart = moment('09:00', 'HH:mm');
  const morningEnd = moment('11:45', 'HH:mm');
  const afternoonStart = moment('13:00', 'HH:mm');
  const afternoonEnd = moment('17:20', 'HH:mm');

  const interval = packageType === 'Platinum' ? 30 : 20;

  function generateSessionSlots(startTime, endTime) {
    let currentTime = moment(startTime);
    
    while (currentTime.clone().add(interval, 'minutes').isSameOrBefore(endTime)) {
      const slotEnd = currentTime.clone().add(interval, 'minutes');
      
      slots.push({
        start: currentTime.format('HH:mm'),
        end: slotEnd.format('HH:mm'),
        timeSlot: `${currentTime.format('HH:mm')} - ${slotEnd.format('HH:mm')}`
      });
      
      currentTime.add(interval, 'minutes');
    }
  }

  generateSessionSlots(morningStart, morningEnd);
  generateSessionSlots(afternoonStart, afternoonEnd);

  return slots;
}

function generateGoldTimeSlots() {
  return generateTimeSlots('Gold');
}

// ============ GET COMPANIES ============

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ 'specialRules.bookingAvailable': true });
    
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// ============ GET AVAILABLE SLOTS ============

const getAvailableSlots = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { email } = req.query;

    console.log(`Fetching slots for company: ${companyId}, email: ${email}`);

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (!company.specialRules?.bookingAvailable) {
      return res.status(403).json({
        success: false,
        message: 'Bookings not available for this company',
        maintenance: true
      });
    }

    // Generate timeslots
    let timeSlots;
    if (company.specialRules?.usesGoldTimeslots) {
      timeSlots = generateGoldTimeSlots();
    } else {
      timeSlots = generateTimeSlots(company.packageType);
    }

    // Get existing bookings
    const existingBookings = await Appointment.find({
      company: companyId,
      status: { $ne: 'cancelled' }
    }).select('timeSlot studentInfo.email');

    // Check conflicts for this email
    const emailBookings = email ? 
      await Appointment.find({
        'studentInfo.email': email.toLowerCase(),
        status: { $ne: 'cancelled' }
      }).select('timeSlot')
      : [];

    // Determine max bookings
    let maxBookings = 2;
    if (company.specialRules?.limitedBookings) {
      maxBookings = 1;
    }

    // Build availability
    const availability = timeSlots.map(slot => {
      const slotString = slot.timeSlot;
      
      const bookingCount = existingBookings.filter(
        b => b.timeSlot === slotString
      ).length;

      const hasConflict = emailBookings.some(
        b => b.timeSlot === slotString
      );

      return {
        timeSlot: slotString,
        available: bookingCount < maxBookings && !hasConflict,
        conflict: hasConflict,
        bookingsCount: bookingCount,
        maxBookings: maxBookings
      };
    });

    res.json({
      success: true,
      data: {
        companyId: company._id,
        companyName: company.name,
        timeSlots: availability
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};

// ============ REGISTER STUDENT ============

const registerStudent = async (req, res) => {
  try {
    console.log('\n========== REGISTRATION START ==========');
    console.log('Received body keys:', Object.keys(req.body));
    console.log('File:', req.file ? req.file.originalname : 'No file');

    let {
      firstName,
      lastName,
      email,
      phoneNumber,
      fieldOfStudy,
      motivation,
      appointments
    } = req.body;

    // Parse appointments if string
    if (typeof appointments === 'string') {
      appointments = JSON.parse(appointments);
    }

    console.log('Parsed appointments:', appointments);

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !fieldOfStudy || !motivation) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields required'
      });
    }

    if (!appointments || appointments.length === 0) {
      console.log('No appointments provided');
      return res.status(400).json({
        success: false,
        message: 'Select at least one company'
      });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    console.log(`Processing ${appointments.length} appointments for ${email}`);

    // Create appointments
    const createdAppointments = [];
    const errors = [];

    for (const apt of appointments) {
      try {
        console.log(`\nProcessing: Company ${apt.companyId}, Time ${apt.timeSlot}`);

        // Validate inputs
        if (!apt.companyId || !apt.timeSlot) {
          throw new Error('Missing companyId or timeSlot');
        }

        // Find company
        const company = await Company.findById(apt.companyId);
        if (!company) {
          throw new Error('Company not found');
        }

        console.log(`Found company: ${company.name}`);

        // Check booking availability
        if (!company.specialRules?.bookingAvailable) {
          throw new Error('Company not available for booking');
        }

        // Check max bookings
        let maxBookings = 2;
        if (company.specialRules?.limitedBookings) {
          maxBookings = 1;
        }

        const bookingCount = await Appointment.countDocuments({
          company: apt.companyId,
          timeSlot: apt.timeSlot,
          status: { $ne: 'cancelled' }
        });

        console.log(`Current bookings: ${bookingCount}/${maxBookings}`);

        if (bookingCount >= maxBookings) {
          throw new Error('Timeslot is fully booked');
        }

        // Create appointment
        const newAppointment = new Appointment({
          studentInfo: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email,
            phoneNumber: phoneNumber.trim(),
            fieldOfStudy: fieldOfStudy.trim(),
            motivation: motivation.trim()
          },
          company: apt.companyId,
          date: new Date('2025-11-26'),
          timeSlot: apt.timeSlot,
          status: 'scheduled',
          cvPath: req.file?.path || null,
          cvFileName: req.file?.originalname || null,
          germanLanguageConfirmed: req.body.germanLanguageConfirmed === 'true' || false,
          internshipInterest: req.body.internshipInterest === 'true' || false,
          hasValidVisa: req.body.hasValidVisa === 'true' || false
        });

        console.log('Saving appointment...');
        await newAppointment.save();
        console.log('✅ Saved');

        createdAppointments.push(newAppointment);

      } catch (error) {
        console.error(`Error on this appointment: ${error.message}`);
        errors.push({
          company: apt.companyId,
          reason: error.message
        });
      }
    }

    console.log(`\nCreated ${createdAppointments.length} appointments`);

    if (createdAppointments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not create appointments',
        errors
      });
    }

    // Send emails
    try {
      const studentInfo = {
        firstName,
        lastName,
        email,
        phoneNumber,
        fieldOfStudy
      };

      await emailService.sendRegistrationEmails(studentInfo, createdAppointments);
      console.log('✅ Emails sent');
    } catch (emailError) {
      console.warn('Email error (non-fatal):', emailError.message);
    }

    console.log('========== REGISTRATION SUCCESS ==========\n');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email.',
      data: {
        appointmentsCreated: createdAppointments.length,
        appointments: createdAppointments
      }
    });

  } catch (error) {
    console.error('\n❌ REGISTRATION ERROR:', error.message);
    console.error(error.stack);
    console.log('========== REGISTRATION FAILED ==========\n');

    res.status(500).json({
      success: false,
      message: 'Registration error: ' + error.message,
      error: error.message
    });
  }
};

// ============ EXPORTS ============

module.exports = {
  getCompanies,
  getAvailableSlots,
  registerStudent
};