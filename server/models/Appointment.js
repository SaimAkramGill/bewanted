const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // Student Information
    studentInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true
      },
      lastName: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      phoneNumber: {
        type: String,
        required: true
      },
      fieldOfStudy: {
        type: String,
        required: true
      },
      motivation: {
        type: String,
        required: true
      }
    },

    // Company Reference
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    // Appointment Details
    date: {
      type: Date,
      default: () => new Date('2025-11-26')
    },

    timeSlot: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },

    // CV Information
    cvPath: String,
    cvFileName: String,

    // Special Confirmations
    germanLanguageConfirmed: {
      type: Boolean,
      default: false
    },
    internshipInterest: {
      type: Boolean,
      default: false
    },
    hasValidVisa: {
      type: Boolean,
      default: false
    },

    registrationDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Simple indexes (non-unique)
appointmentSchema.index({ 'studentInfo.email': 1, company: 1, timeSlot: 1 });
appointmentSchema.index({ company: 1, timeSlot: 1 });
appointmentSchema.index({ 'studentInfo.email': 1 });
appointmentSchema.index({ registrationDate: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);