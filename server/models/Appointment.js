const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^\d{2}:\d{2} - \d{2}:\d{2}$/, 'Invalid time slot format']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  meetingLink: {
    type: String // For virtual meetings
  }
}, {
  timestamps: true
});

// Compound index to prevent double booking
appointmentSchema.index({ student: 1, date: 1, timeSlot: 1 }, { unique: true });
appointmentSchema.index({ company: 1, date: 1, timeSlot: 1 }, { unique: true });
appointmentSchema.index({ date: 1, timeSlot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);