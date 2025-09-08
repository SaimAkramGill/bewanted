const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Student Information (embedded directly)
  studentInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true, 
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s\-()]{10,}$/, 'Please enter a valid phone number']
    },
    fieldOfStudy: {
      type: String,
      required: [true, 'Field of study is required'],
      enum: [
        'Computer Science', 'Software Engineering', 'Data Science', 'Cybersecurity',
        'Information Technology', 'Business Administration', 'Marketing', 'Finance',
        'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering',
        'Biomedical Engineering', 'Medicine', 'Nursing', 'Psychology', 'Education',
        'Law', 'Other'
      ]
    },
    motivation: {
      type: String,
      required: [true, 'Motivation is required'],
      maxlength: [1000, 'Motivation cannot exceed 1000 characters']
    }
  },
  
  // Company Information (reference to company)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Appointment Details
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^\d{2}:\d{2} - \d{2}:\d{2}$/, 'Invalid time slot format']
  },
  
  // Appointment Status
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  meetingLink: {
    type: String // For virtual meetings
  },
  
  // Registration tracking
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes to prevent double booking
// Prevent same student (email) booking same time slot
appointmentSchema.index({ 
  'studentInfo.email': 1, 
  date: 1, 
  timeSlot: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

// Prevent same company having double bookings at same time
appointmentSchema.index({ 
  company: 1, 
  date: 1, 
  timeSlot: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: { $ne: 'cancelled' } }
});

// Other useful indexes
appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ 'studentInfo.email': 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);