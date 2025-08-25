const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    unique: true,
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
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ registrationDate: -1 });

module.exports = mongoose.model('Student', studentSchema);