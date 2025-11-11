const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  packageType: {
    type: String,
    enum: ['Platinum', 'Gold', 'Silver'],
    required: true,
    default: 'Silver'
  },
  specialRules: {
    // ÖBB: Requires German B2 level
    germanRequired: { 
      type: Boolean, 
      default: false,
      description: 'Add disclaimer that B2 German is required'
    },
    
    // Netconomy: Internship visa requirements
    internshipVisa: { 
      type: Boolean, 
      default: false,
      description: 'Show internship checkbox for visa requirements'
    },
    
    // Beyond Now: Only 1 booking per timeslot (2:1 interviews)
    limitedBookings: { 
      type: Boolean, 
      default: false,
      description: 'Limit to 1 booking per timeslot instead of 2'
    },
    
    // Beyond Now: Use Gold timeslots instead of Platinum
    usesGoldTimeslots: {
      type: Boolean,
      default: false,
      description: 'Use Gold timeslots (20-min intervals) instead of Platinum (30-min)'
    },
    
    // Siemens: Booking activation status
    bookingAvailable: { 
      type: Boolean, 
      default: true,
      description: 'Is booking available for this company (e.g., waiting for valid contract)'
    }
  },
  
  positions: [{
    type: String,
    required: true
  }],
  
  interviewDuration: {
    type: Number,
    default: 15  // Default to 15 minutes
  },
  
  bufferTime: {
    type: Number,
    default: 5   // Default 5 minutes buffer
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  
  logo: {
    type: String, // URL to company logo
  },
  
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
companySchema.index({ name: 1 });
companySchema.index({ packageType: 1 });
companySchema.index({ isActive: 1 });

module.exports = mongoose.model('Company', companySchema);