// ===================================================
// Time Slot Generation and Management System
// Career Fair: November 26, 2025
// ===================================================

/**
 * TIME SLOT SPECIFICATIONS:
 * - Event Date: November 26, 2025 ONLY
 * - First slot: 09:00
 * - Last slot: 17:20
 * - Company types:
 *   * 25-minute interview + 5-minute buffer = 30-minute slot
 *   * 15-minute interview + 5-minute buffer = 20-minute slot
 * - All times follow 24-hour format
 */

// ===================================================
// Time Slot Generation Helper
// ===================================================

const generateTimeSlots = (companyDuration) => {
  /**
   * Generate all available time slots for a company
   * @param {number} companyDuration - Slot duration in minutes (20 or 30)
   * @returns {array} Array of time slot strings (e.g., "09:00-09:30")
   */
  
  const slots = [];
  const startHour = 9; // 09:00
  const startMinute = 0;
  const endHour = 17; // 17:20
  const endMinute = 20;
  
  // Convert to total minutes for easier calculation
  const eventStartMinutes = startHour * 60 + startMinute; // 540 minutes (09:00)
  const eventEndMinutes = endHour * 60 + endMinute; // 1040 minutes (17:20)
  
  let currentMinutes = eventStartMinutes;
  
  while (currentMinutes + companyDuration <= eventEndMinutes) {
    const startHours = Math.floor(currentMinutes / 60);
    const startMins = currentMinutes % 60;
    
    const endTotalMinutes = currentMinutes + companyDuration;
    const endHours = Math.floor(endTotalMinutes / 60);
    const endMins = endTotalMinutes % 60;
    
    const timeSlot = 
      `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}-` +
      `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    
    slots.push({
      timeSlot: timeSlot,
      startTime: currentMinutes,
      endTime: endTotalMinutes,
      available: true,
      bookingCount: 0
    });
    
    currentMinutes += companyDuration;
  }
  
  return slots;
};

// ===================================================
// Pre-generated Time Slots (ready to use)
// ===================================================

// For 25-minute interviews + 5-minute buffer = 30-minute slots
const SLOTS_30_MINUTES = generateTimeSlots(30);

// For 15-minute interviews + 5-minute buffer = 20-minute slots
const SLOTS_20_MINUTES = generateTimeSlots(20);

// Event Details
const EVENT_DATE = new Date(2025, 10, 26); // November 26, 2025 (month is 0-indexed, so 10 = November)
const EVENT_DATE_STRING = "2025-11-26";

// ===================================================
// Example Usage in Company Schema
// ===================================================

/*
// When creating a company document, use:

const company = {
  name: "Company Name",
  industry: "Tech",
  packageType: "Gold",
  interviewDuration: 25, // 25 or 15 minutes
  timeSlots: company.interviewDuration === 25 
    ? JSON.parse(JSON.stringify(SLOTS_30_MINUTES))
    : JSON.parse(JSON.stringify(SLOTS_20_MINUTES)),
  eventDate: EVENT_DATE_STRING,
  // ... other fields
}
*/

// ===================================================
// Export for use in controllers
// ===================================================

module.exports = {
  generateTimeSlots,
  SLOTS_30_MINUTES,
  SLOTS_20_MINUTES,
  EVENT_DATE,
  EVENT_DATE_STRING,
  
  // Helper function to get slots based on interview duration
  getTimeSlotsByDuration: (duration) => {
    if (duration === 25) {
      return JSON.parse(JSON.stringify(SLOTS_30_MINUTES));
    } else if (duration === 15) {
      return JSON.parse(JSON.stringify(SLOTS_20_MINUTES));
    }
    throw new Error('Invalid interview duration. Must be 15 or 25 minutes.');
  },
  
  // Validate that booking is for correct date
  validateEventDate: (date) => {
    const bookingDate = new Date(date).toISOString().split('T')[0];
    return bookingDate === EVENT_DATE_STRING;
  },
  
  // Get all time slots info
  getTimeSlotsInfo: () => {
    return {
      eventDate: EVENT_DATE_STRING,
      eventName: "Career Fair",
      startTime: "09:00",
      endTime: "17:20",
      totalDuration: "8 hours 20 minutes",
      durations: [
        {
          type: "Standard (25 min interview)",
          interviewDuration: 25,
          withBuffer: 30,
          slots: SLOTS_30_MINUTES.length,
          slotFormat: "HH:MM-HH:MM"
        },
        {
          type: "Quick (15 min interview)",
          interviewDuration: 15,
          withBuffer: 20,
          slots: SLOTS_20_MINUTES.length,
          slotFormat: "HH:MM-HH:MM"
        }
      ]
    };
  }
};

// ===================================================
// Example: Slots Generated (30-minute slots)
// ===================================================

/*
30-MINUTE SLOTS (25 min interview + 5 min buffer):
09:00-09:30
09:30-10:00
10:00-10:30
10:30-11:00
11:00-11:30
11:30-12:00
12:00-12:30
12:30-13:00
13:00-13:30
13:30-14:00
14:00-14:30
14:30-15:00
15:00-15:30
15:30-16:00
16:00-16:30
16:30-17:00
17:00-17:30 (ends at 17:30, but event ends at 17:20, so might trim)

Total: ~16-17 slots

20-MINUTE SLOTS (15 min interview + 5 min buffer):
09:00-09:20
09:20-09:40
09:40-10:00
10:00-10:20
... (continuing every 20 minutes)
17:00-17:20 (perfect fit!)

Total: ~25 slots
*/

// ===================================================
// Usage in careerFairController.js
// ===================================================

/*
const timeSlotManager = require('../utils/timeSlotManager');

// When creating a company:
router.post('/companies', async (req, res) => {
  try {
    const { name, industry, packageType, interviewDuration } = req.body;
    
    const company = new Company({
      name,
      industry,
      packageType,
      interviewDuration: interviewDuration || 25,
      timeSlots: timeSlotManager.getTimeSlotsByDuration(interviewDuration || 25),
      eventDate: timeSlotManager.EVENT_DATE_STRING,
      // ... other fields
    });
    
    await company.save();
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// When fetching available slots:
router.get('/available-slots/:companyId', async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    // Validate event date
    if (!timeSlotManager.validateEventDate(company.eventDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'This company is not available on the event date' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        company: company.name,
        eventDate: timeSlotManager.EVENT_DATE_STRING,
        eventName: "Career Fair",
        timeSlots: company.timeSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
*/